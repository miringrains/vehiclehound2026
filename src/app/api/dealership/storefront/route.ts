import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest) {
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

    const { enabled } = await request.json();
    const value = enabled === true;

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("dealerships")
      .update({ storefront_enabled: value })
      .eq("id", profile.dealership_id)
      .select("storefront_enabled")
      .single();

    if (error) {
      console.error("[storefront-toggle] Update failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("[storefront-toggle] Updated:", profile.dealership_id, "→", data.storefront_enabled);
    return NextResponse.json({ storefront_enabled: data.storefront_enabled });
  } catch (err) {
    console.error("[storefront-toggle] Unexpected:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
