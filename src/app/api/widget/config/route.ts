import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ────────────────────────────────────────────────
   GET /api/widget/config
   Returns the widget config for the authenticated user's dealership
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
   Creates a new widget config (one per dealership)
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

    const { data, error } = await supabase
      .from("widget_configs")
      .insert({
        dealership_id: profile.dealership_id,
        name: body.name || "My Integration",
        config: body.config || undefined,
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
   Updates the widget config
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
    if (body.config !== undefined) updates.config = body.config;
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
