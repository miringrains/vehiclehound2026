import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/mailgun";
import { userInvitation } from "@/lib/email/templates";

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

    try {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/invitation/${token}`;
      const { data: inviterProfile } = await admin.from("profiles").select("name").eq("id", user.id).single();
      const { data: dlr } = await admin.from("dealerships").select("name").eq("id", profile.dealership_id).single();

      await sendEmail({
        to: existing.email,
        subject: `Reminder: You're invited to join ${dlr?.name || "a dealership"} on Vehicle Hound`,
        html: userInvitation({
          dealershipName: dlr?.name || "a dealership",
          inviterName: inviterProfile?.name || "A team member",
          inviteUrl,
          expiresInDays: 7,
        }),
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
