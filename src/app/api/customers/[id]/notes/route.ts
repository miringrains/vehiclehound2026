import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, name")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const admin = createAdminClient();

    const { data: customer } = await admin
      .from("customers")
      .select("dealership_id, notes")
      .eq("id", id)
      .single();

    if (!customer || customer.dealership_id !== profile.dealership_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    if (!body.text?.trim()) {
      return NextResponse.json({ error: "Note text required" }, { status: 400 });
    }

    const note = {
      id: crypto.randomUUID(),
      text: body.text.trim(),
      created_at: new Date().toISOString(),
      created_by: user.id,
      created_by_name: profile.name || user.email || "Unknown",
    };

    const existingNotes = Array.isArray(customer.notes) ? customer.notes : [];
    const updatedNotes = [note, ...existingNotes];

    const { error } = await admin
      .from("customers")
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ note }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
