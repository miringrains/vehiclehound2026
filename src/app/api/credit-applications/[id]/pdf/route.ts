import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

/* ────────────────────────────────────────────────
   GET /api/credit-applications/:id/pdf
   Returns a signed download URL for the generated PDF
   ──────────────────────────────────────────────── */
export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: app, error } = await supabase
      .from("credit_applications")
      .select("pdf_path")
      .eq("id", id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (!app.pdf_path) {
      return NextResponse.json({ error: "No PDF available for this application" }, { status: 404 });
    }

    const admin = createAdminClient();
    const { data: signedUrl, error: signErr } = await admin.storage
      .from("credit-app-files")
      .createSignedUrl(app.pdf_path, 300);

    if (signErr || !signedUrl) {
      return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
    }

    return NextResponse.json({ url: signedUrl.signedUrl });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
