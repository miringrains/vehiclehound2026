import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

/* ────────────────────────────────────────────────
   GET /api/credit-applications/:id/files
   Returns signed URLs for all uploaded files
   ──────────────────────────────────────────────── */
export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: app, error } = await supabase
      .from("credit_applications")
      .select("front_id_path, insurance_path, registration_path, pdf_path")
      .eq("id", id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const admin = createAdminClient();
    const files: Record<string, string | null> = {};

    const pathKeys = ["front_id_path", "insurance_path", "registration_path", "pdf_path"] as const;

    for (const key of pathKeys) {
      const path = app[key];
      if (path) {
        const { data } = await admin.storage.from("credit-app-files").createSignedUrl(path, 300);
        files[key.replace("_path", "_url")] = data?.signedUrl ?? null;
      } else {
        files[key.replace("_path", "_url")] = null;
      }
    }

    return NextResponse.json(files);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
