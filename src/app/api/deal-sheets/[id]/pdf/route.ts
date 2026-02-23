import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDealSheetPDF } from "@/lib/pdf/deal-sheet-pdf";
import { fetchLogoData } from "@/lib/pdf/fetch-logo";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id")
      .eq("id", user.id)
      .single();
    if (!profile?.dealership_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const admin = createAdminClient();

    const { data: sheet } = await admin
      .from("deal_sheets")
      .select("*, customers(first_name, last_name)")
      .eq("id", id)
      .eq("dealership_id", profile.dealership_id)
      .single();

    if (!sheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: dealership } = await admin
      .from("dealerships")
      .select("name, logo_url")
      .eq("id", profile.dealership_id)
      .single();

    const customerName = sheet.customers
      ? `${sheet.customers.first_name} ${sheet.customers.last_name}`
      : null;

    const logo_data = await fetchLogoData(dealership?.logo_url);

    const pdfBytes = generateDealSheetPDF({
      dealership_name: dealership?.name || "Dealership",
      customer_name: customerName,
      title: sheet.title,
      options: sheet.options || [],
      created_at: sheet.created_at,
      logo_data,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="deal-sheet-${id.slice(0, 8)}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
