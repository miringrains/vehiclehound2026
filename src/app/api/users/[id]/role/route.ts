import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, dealership_role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.dealership_role !== "owner") {
      return NextResponse.json({ error: "Only owners can change roles" }, { status: 403 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const body = await request.json();
    const { role } = body as { role: string };
    if (!["manager", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: target } = await admin
      .from("profiles")
      .select("id, dealership_id, dealership_role")
      .eq("id", targetUserId)
      .eq("dealership_id", profile.dealership_id)
      .single();

    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (target.dealership_role === "owner" && role !== "owner") {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("dealership_id", profile.dealership_id)
        .eq("dealership_role", "owner");

      if ((count ?? 0) <= 1) {
        return NextResponse.json({ error: "Cannot demote the last owner" }, { status: 400 });
      }
    }

    const { error } = await admin
      .from("profiles")
      .update({ dealership_role: role })
      .eq("id", targetUserId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await admin.from("dealership_audit_logs").insert({
      dealership_id: profile.dealership_id,
      user_id: user.id,
      action: "role_change",
      target_user_id: targetUserId,
      details: { from: target.dealership_role, to: role },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
