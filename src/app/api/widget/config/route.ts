import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Darken a hex color by mixing it toward black.
 * factor 0 = unchanged, 1 = fully black.
 */
function darkenHex(hex: string, factor = 0.12): string {
  const h = hex.replace("#", "");
  const r = Math.round(parseInt(h.substring(0, 2), 16) * (1 - factor));
  const g = Math.round(parseInt(h.substring(2, 4), 16) * (1 - factor));
  const b = Math.round(parseInt(h.substring(4, 6), 16) * (1 - factor));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

const DEFAULT_CONFIG = {
  primaryColor: "#1a1d1e",
  hoverColor: "#171919",
  showPricing: true,
  itemsPerPage: 12,
  defaultSort: "newest",
  creditAppUrl: "",
  borderRadius: "rounded" as const,
};

function withDerivedHover(config: Record<string, unknown>) {
  if (config.primaryColor && typeof config.primaryColor === "string") {
    config.hoverColor = darkenHex(config.primaryColor, 0.12);
  }
  if (!config.borderRadius) {
    config.borderRadius = "rounded";
  }
  return config;
}

/* ────────────────────────────────────────────────
   GET /api/widget/config
   ──────────────────────────────────────────────── */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
      .from("widget_configs")
      .select("*")
      .maybeSingle();

    return NextResponse.json({ config: data });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────
   POST /api/widget/config
   ──────────────────────────────────────────────── */
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
      return NextResponse.json({ error: "No dealership found" }, { status: 400 });
    }

    const body = await request.json();
    const config = withDerivedHover({ ...DEFAULT_CONFIG, ...(body.config || {}) });

    const { data, error } = await supabase
      .from("widget_configs")
      .insert({
        dealership_id: profile.dealership_id,
        name: body.name || "Website Widget",
        config,
        allowed_domains: body.allowed_domains || [],
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Integration already exists for this dealership" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ config: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────
   PATCH /api/widget/config
   ──────────────────────────────────────────────── */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const { data: existing } = await supabase
      .from("widget_configs")
      .select("id")
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "No integration found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.config !== undefined) updates.config = withDerivedHover({ ...body.config });
    if (body.allowed_domains !== undefined) updates.allowed_domains = body.allowed_domains;
    if (body.status !== undefined) updates.status = body.status;

    const { data, error } = await supabase
      .from("widget_configs")
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ config: data });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────
   DELETE /api/widget/config
   ──────────────────────────────────────────────── */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: existing } = await supabase
      .from("widget_configs")
      .select("id")
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "No integration found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("widget_configs")
      .delete()
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
