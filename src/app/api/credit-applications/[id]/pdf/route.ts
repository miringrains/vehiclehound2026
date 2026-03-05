import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";
import { generateCreditApplicationPDF } from "@/lib/pdf/credit-application-pdf";
import { fetchLogoData } from "@/lib/pdf/fetch-logo";

type RouteContext = { params: Promise<{ id: string }> };

/* ────────────────────────────────────────────────
   GET /api/credit-applications/:id/pdf
   Regenerates the PDF on-the-fly from current DB
   data so it always reflects the latest template.
   ──────────────────────────────────────────────── */
export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: app, error } = await supabase
      .from("credit_applications")
      .select(
        "*, vehicle:vehicles(year, make, model, stock_number)"
      )
      .eq("id", id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    let ssn: string | null = null;
    let co_ssn: string | null = null;
    try {
      if (app.ssn_encrypted) ssn = decrypt(app.ssn_encrypted);
      if (app.co_ssn_encrypted) co_ssn = decrypt(app.co_ssn_encrypted);
    } catch {
      // If decryption fails, leave as null
    }

    const admin = createAdminClient();
    const { data: dealership } = await admin
      .from("dealerships")
      .select("name, phone, logo_url")
      .eq("id", app.dealership_id)
      .single();

    const logo_data = await fetchLogoData(dealership?.logo_url);

    const pdfBytes = generateCreditApplicationPDF({
      first_name: app.first_name,
      last_name: app.last_name,
      email: app.email,
      phone: app.phone,
      ssn,
      co_ssn,
      date_of_birth: app.date_of_birth,
      address: app.address,
      city: app.city,
      state: app.state,
      zip: app.zip,
      residential_status: app.residential_status,
      monthly_payment: app.monthly_payment,
      years_at_address: app.years_at_address,
      months_at_address: app.months_at_address,
      employer: app.employer,
      occupation: app.occupation,
      employment_status: app.employment_status,
      employer_address: app.employer_address,
      employer_city: app.employer_city,
      employer_state: app.employer_state,
      employer_zip: app.employer_zip,
      employer_phone: app.employer_phone,
      monthly_income: app.monthly_income,
      years_employed: app.years_employed,
      months_employed: app.months_employed,
      other_income_sources: app.other_income_sources,
      additional_monthly_income: app.additional_monthly_income,
      has_co_applicant: app.has_co_applicant ?? false,
      co_first_name: app.co_first_name,
      co_last_name: app.co_last_name,
      co_email: app.co_email,
      co_phone: app.co_phone,
      co_date_of_birth: app.co_date_of_birth,
      co_address: app.co_address,
      co_city: app.co_city,
      co_state: app.co_state,
      co_zip: app.co_zip,
      co_residential_status: app.co_residential_status,
      co_monthly_payment: app.co_monthly_payment,
      co_years_at_address: app.co_years_at_address,
      co_months_at_address: app.co_months_at_address,
      co_employer: app.co_employer,
      co_occupation: app.co_occupation,
      co_employment_status: app.co_employment_status,
      co_employer_address: app.co_employer_address,
      co_employer_city: app.co_employer_city,
      co_employer_state: app.co_employer_state,
      co_employer_zip: app.co_employer_zip,
      co_employer_phone: app.co_employer_phone,
      co_monthly_income: app.co_monthly_income,
      co_years_employed: app.co_years_employed,
      co_months_employed: app.co_months_employed,
      co_other_income_sources: app.co_other_income_sources,
      co_additional_monthly_income: app.co_additional_monthly_income,
      is_business_app: app.is_business_app ?? false,
      business_name: app.business_name,
      business_type: app.business_type,
      business_ein: app.business_ein,
      business_nature: app.business_nature,
      business_address: app.business_address,
      business_city: app.business_city,
      business_state: app.business_state,
      business_zip: app.business_zip,
      business_phone: app.business_phone,
      years_in_business: app.years_in_business,
      vehicle: app.vehicle,
      created_at: app.created_at,
      logo_data,
      dealership_name: dealership?.name || null,
      dealership_phone: dealership?.phone || null,
    });

    const filename = `Credit-Application-${app.first_name}-${app.last_name}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
