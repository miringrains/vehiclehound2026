import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type MappedVehicle = Record<string, unknown>;

const ALLOWED_FIELDS = new Set([
  "inventory_type", "stock_number", "vin", "year", "make", "model", "trim",
  "trim_level", "series", "vehicle_type", "body_class", "doors", "mileage",
  "online_price", "sale_price", "purchase_price", "msrp",
  "lease_payment", "lease_term", "lease_down_payment", "lease_annual_mileage",
  "broker_fee", "taxes_and_fees",
  "engine_hp", "engine_cylinders", "engine_displacement",
  "fuel_type", "transmission_style", "drive_type",
  "exterior_color", "interior_color",
  "description", "title_status", "location_detail",
]);

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

    let existingVins = new Set<string>();
    if (vins.length > 0) {
      const { data: existing } = await admin
        .from("vehicles")
        .select("vin")
        .eq("dealership_id", dealershipId)
        .in("vin", vins);
      existingVins = new Set((existing ?? []).map((r: { vin: string }) => r.vin));
    }

    const results = { imported: 0, skipped: 0, errors: [] as { row: number; message: string }[] };

    for (let i = 0; i < vehicles.length; i++) {
      const raw = vehicles[i];
      const vin = typeof raw.vin === "string" ? raw.vin.trim().toUpperCase() : null;

      if (!raw.year || !raw.make || !raw.model) {
        results.errors.push({ row: i + 1, message: "Missing required fields (year, make, model)" });
        continue;
      }

      if (vin && existingVins.has(vin)) {
        if (mode === "skip") {
          results.skipped++;
          continue;
        }
        const { error } = await admin
          .from("vehicles")
          .update(sanitize(raw, dealershipId))
          .eq("dealership_id", dealershipId)
          .eq("vin", vin);
        if (error) {
          results.errors.push({ row: i + 1, message: error.message });
        } else {
          results.imported++;
        }
        continue;
      }

      const record = sanitize(raw, dealershipId);
      if (vin) record.vin = vin;

      const { error } = await admin.from("vehicles").insert(record);
      if (error) {
        results.errors.push({ row: i + 1, message: error.message });
      } else {
        results.imported++;
      }
    }

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

function sanitize(raw: MappedVehicle, dealershipId: string): Record<string, unknown> {
  const record: Record<string, unknown> = { dealership_id: dealershipId, status: 1 };

  for (const [key, val] of Object.entries(raw)) {
    if (!ALLOWED_FIELDS.has(key) || val === null || val === undefined || val === "") continue;

    if (["year", "doors", "mileage", "lease_term", "lease_annual_mileage"].includes(key)) {
      const n = parseInt(String(val), 10);
      if (!isNaN(n)) record[key] = n;
    } else if ([
      "online_price", "sale_price", "purchase_price", "msrp",
      "lease_payment", "lease_down_payment", "broker_fee", "taxes_and_fees",
    ].includes(key)) {
      const cleaned = String(val).replace(/[$,\s]/g, "");
      const n = parseFloat(cleaned);
      if (!isNaN(n)) record[key] = n;
    } else {
      record[key] = String(val).trim();
    }
  }

  if (!record.inventory_type) record.inventory_type = "sale";

  return record;
}
