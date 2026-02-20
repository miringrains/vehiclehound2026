import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";

type RouteContext = { params: Promise<{ id: string }> };

/* ────────────────────────────────────────────────
   GET /api/credit-applications/:id/ssn
   Decrypts and returns the SSN for authorized users.
   Returns last-4 by default; full if ?full=true.
   ──────────────────────────────────────────────── */
export async function GET(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: app, error } = await supabase
      .from("credit_applications")
      .select("ssn_encrypted, co_ssn_encrypted")
      .eq("id", id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const full = url.searchParams.get("full") === "true";

    const result: { ssn: string | null; co_ssn: string | null } = { ssn: null, co_ssn: null };

    if (app.ssn_encrypted) {
      const plain = decrypt(app.ssn_encrypted);
      result.ssn = full ? plain : `•••-••-${plain.slice(-4)}`;
    }

    if (app.co_ssn_encrypted) {
      const plain = decrypt(app.co_ssn_encrypted);
      result.co_ssn = full ? plain : `•••-••-${plain.slice(-4)}`;
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to decrypt SSN" }, { status: 500 });
  }
}
