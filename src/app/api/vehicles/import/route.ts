import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

type MappedVehicle = Record<string, unknown>;

const ALLOWED_FIELDS = new Set([
  "inventory_type", "condition", "stock_number", "vin",
  "year", "make", "model", "trim",
  "trim_level", "series", "vehicle_type", "body_class", "doors", "mileage",
  "online_price", "sale_price", "purchase_price", "msrp",
  "lease_payment", "lease_term", "lease_down_payment", "lease_annual_mileage",
  "broker_fee", "taxes_and_fees",
  "engine_hp", "engine_cylinders", "engine_displacement",
  "fuel_type", "transmission_style", "drive_type",
  "exterior_color", "interior_color",
  "description", "title_status", "location_detail",
]);

const INTEGER_FIELDS = new Set(["year", "doors", "mileage", "lease_term", "lease_annual_mileage"]);
const PRICE_FIELDS = new Set([
  "online_price", "sale_price", "purchase_price", "msrp",
  "lease_payment", "lease_down_payment", "broker_fee", "taxes_and_fees",
]);
const CONDITION_VALUES = new Set(["new", "used"]);
const IMAGE_TIMEOUT_MS = 8000;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id) {
      return NextResponse.json({ error: "No dealership" }, { status: 403 });
    }

    const dealershipId = profile.dealership_id;
    const body = await request.json();
    const { vehicles, mode } = body as { vehicles: MappedVehicle[]; mode: "skip" | "overwrite" };

    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      return NextResponse.json({ error: "No vehicles provided" }, { status: 400 });
    }

    if (vehicles.length > 2000) {
      return NextResponse.json({ error: "Maximum 2000 vehicles per import" }, { status: 400 });
    }

    const admin = createAdminClient();

    const vins = vehicles
      .map((v) => v.vin)
      .filter((v): v is string => typeof v === "string" && v.length > 0);

    let existingVins = new Map<string, string>();
    if (vins.length > 0) {
      const { data: existing } = await admin
        .from("vehicles")
        .select("id, vin")
        .eq("dealership_id", dealershipId)
        .in("vin", vins);
      for (const r of existing ?? []) {
        existingVins.set(r.vin, r.id);
      }
    }

    const results = { imported: 0, skipped: 0, errors: [] as { row: number; message: string }[] };

    for (let i = 0; i < vehicles.length; i++) {
      const raw = vehicles[i];
      const vin = typeof raw.vin === "string" ? raw.vin.trim().toUpperCase() : null;
      const imageUrls = extractImageUrls(raw.image_url);

      if (!raw.year || !raw.make || !raw.model) {
        results.errors.push({ row: i + 1, message: "Missing required fields (year, make, model)" });
        continue;
      }

      let vehicleId: string | null = null;

      if (vin && existingVins.has(vin)) {
        if (mode === "skip") {
          results.skipped++;
          continue;
        }
        vehicleId = existingVins.get(vin)!;
        const { error } = await admin
          .from("vehicles")
          .update(sanitize(raw, dealershipId))
          .eq("id", vehicleId);
        if (error) {
          results.errors.push({ row: i + 1, message: error.message });
          continue;
        }
        results.imported++;
      } else {
        const record = sanitize(raw, dealershipId);
        if (vin) record.vin = vin;

        const { data: inserted, error } = await admin
          .from("vehicles")
          .insert(record)
          .select("id")
          .single();
        if (error || !inserted) {
          results.errors.push({ row: i + 1, message: error?.message ?? "Insert failed" });
          continue;
        }
        vehicleId = inserted.id;
        results.imported++;
      }

      if (vehicleId && imageUrls.length > 0) {
        await processImages(admin, dealershipId, vehicleId, imageUrls);
      }
    }

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

function extractImageUrls(raw: unknown): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(/[,|;]+/)
    .map((u) => u.trim())
    .filter((u) => {
      try {
        const url = new URL(u);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    });
}

async function processImages(
  admin: ReturnType<typeof createAdminClient>,
  dealershipId: string,
  vehicleId: string,
  urls: string[]
) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  let primarySet = false;

  for (let i = 0; i < urls.length; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

      const response = await fetch(urls[i], {
        signal: controller.signal,
        headers: { "User-Agent": "VehicleHound/1.0" },
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") || "";
      const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
      if (contentLength > MAX_IMAGE_SIZE) continue;

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > MAX_IMAGE_SIZE || buffer.length === 0) continue;

      let ext = "jpg";
      if (contentType.includes("png")) ext = "png";
      else if (contentType.includes("webp")) ext = "webp";
      else if (contentType.includes("gif")) ext = "gif";
      else {
        const urlPath = new URL(urls[i]).pathname.toLowerCase();
        if (urlPath.endsWith(".png")) ext = "png";
        else if (urlPath.endsWith(".webp")) ext = "webp";
        else if (urlPath.endsWith(".gif")) ext = "gif";
      }

      const fileName = `${randomUUID()}.${ext}`;
      const filePath = `${dealershipId}/${vehicleId}/${fileName}`;

      const { error: uploadError } = await admin.storage
        .from("vehicle-images")
        .upload(filePath, buffer, {
          contentType: contentType || `image/${ext}`,
          upsert: false,
        });

      if (uploadError) continue;

      await admin.from("vehicle_images").insert({
        vehicle_id: vehicleId,
        file_path: filePath,
        display_order: i,
      });

      if (!primarySet) {
        const publicUrl = `${projectUrl}/storage/v1/object/public/vehicle-images/${filePath}`;
        await admin
          .from("vehicles")
          .update({ preview_image: publicUrl, updated_at: new Date().toISOString() })
          .eq("id", vehicleId);
        primarySet = true;
      }
    } catch {
      // Skip images that fail to download — don't block the import
    }
  }
}

function sanitize(raw: MappedVehicle, dealershipId: string): Record<string, unknown> {
  const record: Record<string, unknown> = { dealership_id: dealershipId, status: 1 };

  for (const [key, val] of Object.entries(raw)) {
    if (!ALLOWED_FIELDS.has(key) || val === null || val === undefined || val === "") continue;

    if (INTEGER_FIELDS.has(key)) {
      const n = parseInt(String(val), 10);
      if (!isNaN(n)) record[key] = n;
    } else if (PRICE_FIELDS.has(key)) {
      const cleaned = String(val).replace(/[$,\s]/g, "");
      const n = parseFloat(cleaned);
      if (!isNaN(n)) record[key] = n;
    } else if (key === "condition") {
      const norm = String(val).trim().toLowerCase();
      if (CONDITION_VALUES.has(norm)) record[key] = norm;
    } else if (key === "inventory_type") {
      const norm = String(val).trim().toLowerCase();
      if (norm === "lease" || norm === "sale") record[key] = norm;
    } else {
      record[key] = String(val).trim();
    }
  }

  if (!record.inventory_type) record.inventory_type = "sale";

  return record;
}
