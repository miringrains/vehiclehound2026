import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/mailgun";
import { userInvitation } from "@/lib/email/templates";

export async function GET() {
  try {
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
    const { data: invitations } = await admin
      .from("user_invitations")
      .select("id, email, token, invited_by, expires_at, accepted_at, created_at")
      .eq("dealership_id", profile.dealership_id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ invitations: invitations ?? [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (profile.dealership_role === "manager") {
      // managers can only invite users, not managers
    }

    const body = await request.json();
    const { email, role } = body as { email: string; role: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!["manager", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (profile.dealership_role === "manager" && role === "manager") {
      return NextResponse.json({ error: "Managers cannot invite other managers" }, { status: 403 });
    }

    const admin = createAdminClient();

    const { data: dealership } = await admin
      .from("dealerships")
      .select("max_users, active_users_count")
      .eq("id", profile.dealership_id)
      .single();

    if (dealership && dealership.active_users_count >= dealership.max_users) {
      return NextResponse.json({ error: "User limit reached for your plan" }, { status: 400 });
    }

    const { data: existingMember } = await admin
      .from("profiles")
      .select("id")
      .eq("dealership_id", profile.dealership_id)
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({ error: "This email is already a team member" }, { status: 409 });
    }

    const { data: existingInvite } = await admin
      .from("user_invitations")
      .select("id")
      .eq("dealership_id", profile.dealership_id)
      .eq("email", email.toLowerCase())
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json({ error: "A pending invitation already exists for this email" }, { status: 409 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invitation, error } = await admin
      .from("user_invitations")
      .insert({
        dealership_id: profile.dealership_id,
        email: email.toLowerCase(),
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select("id, email, token, expires_at, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/invitation/${token}`;
      const { data: inviterProfile } = await admin.from("profiles").select("name").eq("id", user.id).single();
      const { data: dlr } = await admin.from("dealerships").select("name").eq("id", profile.dealership_id).single();

      await sendEmail({
        to: email,
        subject: `You're invited to join ${dlr?.name || "a dealership"} on Vehicle Hound`,
        html: userInvitation({
          dealershipName: dlr?.name || "a dealership",
          inviterName: inviterProfile?.name || "A team member",
          inviteUrl,
          expiresInDays: 7,
        }),
      });
    } catch {
      // Email send failure shouldn't block the invitation creation
    }

    return NextResponse.json({ invitation });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
