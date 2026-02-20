import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { generateCreditApplicationPDF } from "@/lib/pdf/credit-application-pdf";
import { notifyCreditAppSubmission } from "@/lib/email/credit-application-email";

/* ────────────────────────────────────────────────
   POST /api/credit-applications
   Public endpoint — no auth required.
   Accepts JSON body with form data + optional files
   as base64-encoded strings.
   ──────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { dealership_id, ssn, co_ssn, front_id_base64, insurance_base64, registration_base64, ...rest } = body;

    if (!dealership_id || !rest.first_name || !rest.last_name || !rest.email || !rest.phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const admin = createAdminClient();

    const ssnEncrypted = ssn ? encrypt(ssn) : null;
    const coSsnEncrypted = co_ssn ? encrypt(co_ssn) : null;

    const storagePath = `${dealership_id}/${Date.now()}`;
    const filePaths: Record<string, string | null> = {
      front_id_path: null,
      insurance_path: null,
      registration_path: null,
    };

    const fileUploads: [string, string, string][] = [];
    if (front_id_base64) fileUploads.push(["front_id_path", `${storagePath}/front-id.jpg`, front_id_base64]);
    if (insurance_base64) fileUploads.push(["insurance_path", `${storagePath}/insurance.jpg`, insurance_base64]);
    if (registration_base64) fileUploads.push(["registration_path", `${storagePath}/registration.jpg`, registration_base64]);

    for (const [key, path, b64] of fileUploads) {
      const buffer = Buffer.from(b64.replace(/^data:[^;]+;base64,/, ""), "base64");
      const contentType = b64.startsWith("data:image/png") ? "image/png" : b64.startsWith("data:application/pdf") ? "application/pdf" : "image/jpeg";

      const { error: uploadErr } = await admin.storage.from("credit-app-files").upload(path, buffer, {
        contentType,
        upsert: false,
      });

      if (!uploadErr) {
        filePaths[key] = path;
      }
    }

    let vehicleData = null;
    if (rest.vehicle_id) {
      const { data: v } = await admin.from("vehicles").select("year, make, model, stock_number").eq("id", rest.vehicle_id).single();
      vehicleData = v;
    }

    const record = {
      dealership_id,
      ...rest,
      ssn_encrypted: ssnEncrypted,
      co_ssn_encrypted: coSsnEncrypted,
      ...filePaths,
      ip_address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null,
    };

    delete record.ssn;
    delete record.co_ssn;

    const { data: inserted, error: insertErr } = await admin.from("credit_applications").insert(record).select("id, created_at").single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    try {
      const pdfBytes = generateCreditApplicationPDF({
        ...rest,
        dealership_id,
        has_co_applicant: rest.has_co_applicant ?? false,
        is_business_app: rest.is_business_app ?? false,
        vehicle: vehicleData,
        created_at: inserted.created_at,
      });

      const pdfPath = `${storagePath}/application-${inserted.id}.pdf`;
      const { error: pdfUploadErr } = await admin.storage.from("credit-app-files").upload(pdfPath, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

      if (!pdfUploadErr) {
        await admin.from("credit_applications").update({ pdf_path: pdfPath }).eq("id", inserted.id);
      }
    } catch {
      // PDF generation is non-critical; the application is already saved
    }

    try {
      const { data: dealership } = await admin.from("dealerships").select("name, credit_app_emails").eq("id", dealership_id).single();

      const emails: string[] = dealership?.credit_app_emails ?? [];
      if (emails.length > 0) {
        const vehicleLabel = vehicleData ? [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean).join(" ") : null;

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vehiclehound.com";
        await notifyCreditAppSubmission({
          to: emails,
          dealershipName: dealership?.name ?? "Dealership",
          applicantName: `${rest.first_name} ${rest.last_name}`,
          vehicleLabel,
          applicationId: inserted.id,
          portalUrl: `${baseUrl}/credit-applications/${inserted.id}`,
        });
      }
    } catch {
      // Email is non-critical
    }

    return NextResponse.json({ id: inserted.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────
   GET /api/credit-applications
   Authenticated — returns list for the user's dealership
   ──────────────────────────────────────────────── */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("credit_applications")
      .select("id, first_name, last_name, email, phone, status, vehicle_id, created_at, updated_at, vehicle:vehicles(year, make, model, stock_number)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      applications: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
