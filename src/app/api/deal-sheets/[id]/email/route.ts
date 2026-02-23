import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDealSheetPDF } from "@/lib/pdf/deal-sheet-pdf";
import { sendEmail } from "@/lib/email/mailgun";
import { dealSheetEmail } from "@/lib/email/templates";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, name, email")
      .eq("id", user.id)
      .single();
    if (!profile?.dealership_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const admin = createAdminClient();

    const { data: sheet } = await admin
      .from("deal_sheets")
      .select("*, customers(first_name, last_name, email, phone)")
      .eq("id", id)
      .eq("dealership_id", profile.dealership_id)
      .single();

    if (!sheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const recipientEmail = body.email || sheet.customers?.email;

    if (!recipientEmail) {
      return NextResponse.json({ error: "No customer email available" }, { status: 400 });
    }

    const { data: dealership } = await admin
      .from("dealerships")
      .select("name, phone")
      .eq("id", profile.dealership_id)
      .single();

    const customerName = sheet.customers
      ? `${sheet.customers.first_name} ${sheet.customers.last_name}`
      : recipientEmail;

    const pdfBytes = generateDealSheetPDF({
      dealership_name: dealership?.name || "Dealership",
      customer_name: sheet.customers
        ? `${sheet.customers.first_name} ${sheet.customers.last_name}`
        : null,
      title: sheet.title,
      options: sheet.options || [],
      created_at: sheet.created_at,
    });

    const html = dealSheetEmail({
      customerName,
      dealershipName: dealership?.name || "Dealership",
      sheetTitle: sheet.title || "Your Deal Options",
      contactName: profile.name || undefined,
      contactPhone: dealership?.phone || undefined,
      contactEmail: profile.email || undefined,
    });

    await sendEmail({
      to: recipientEmail,
      subject: `${sheet.title || "Deal Options"} — ${dealership?.name || "Dealership"}`,
      html,
      replyTo: profile.email || undefined,
      attachments: [
        {
          filename: `deal-sheet-${id.slice(0, 8)}.pdf`,
          data: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ],
    });

    await admin
      .from("deal_sheets")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DEAL SHEET EMAIL]", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
