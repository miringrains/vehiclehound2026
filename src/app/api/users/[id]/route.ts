import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: NextRequest,
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
      return NextResponse.json({ error: "Only owners can remove users" }, { status: 403 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: target } = await admin
      .from("profiles")
      .select("id, dealership_id")
      .eq("id", targetUserId)
      .eq("dealership_id", profile.dealership_id)
      .single();

    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await admin
      .from("profiles")
      .update({ dealership_id: null, dealership_role: "user" })
      .eq("id", targetUserId);

    const { data: dealership } = await admin
      .from("dealerships")
      .select("active_users_count")
      .eq("id", profile.dealership_id)
      .single();

    if (dealership) {
      await admin
        .from("dealerships")
        .update({ active_users_count: Math.max(0, (dealership.active_users_count ?? 1) - 1) })
        .eq("id", profile.dealership_id);
    }

    await admin.from("dealership_audit_logs").insert({
      dealership_id: profile.dealership_id,
      user_id: user.id,
      action: "user_removed",
      target_user_id: targetUserId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
