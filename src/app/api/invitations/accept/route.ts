import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { acceptInviteSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, ...rest } = body;
    const parsed = acceptInviteSchema.safeParse(rest);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid invitation token." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: invitation, error: invError } = await supabase
      .from("user_invitations")
      .select("*, dealerships(name)")
      .eq("token", token)
      .is("accepted_at", null)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found or already used." },
        { status: 404 }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 410 }
      );
    }

    const { name, password } = parsed.data;

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: invitation.email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    await supabase
      .from("profiles")
      .update({
        name,
        dealership_id: invitation.dealership_id,
        dealership_role: "user",
        invited_by: invitation.invited_by,
        joined_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id);

    await supabase
      .from("user_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    await supabase.rpc("increment_active_users", {
      d_id: invitation.dealership_id,
    }).then(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
