import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, dealership_role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || !["owner", "manager"].includes(profile.dealership_role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("user_invitations")
      .delete()
      .eq("id", id)
      .eq("dealership_id", profile.dealership_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, dealership_role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || !["owner", "manager"].includes(profile.dealership_role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("user_invitations")
      .select("email")
      .eq("id", id)
      .eq("dealership_id", profile.dealership_id)
      .single();

    if (!existing) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await admin
      .from("user_invitations")
      .update({ token, expires_at: expiresAt.toISOString(), accepted_at: null, failed_attempts: 0 })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const inviteUrl = `${new URL(request.url).origin}/invitation/${token}`;
    console.log(`[INVITATION RESEND] Send email to ${existing.email}: ${inviteUrl}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
