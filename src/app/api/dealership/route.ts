import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const { data: dealership, error } = await admin
      .from("dealerships")
      .select("*")
      .eq("id", profile.dealership_id)
      .single();

    if (error || !dealership) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ dealership });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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

    const body = await request.json();
    const allowed = ["name", "phone", "address", "city", "state", "zip", "website", "logo_url", "credit_app_emails", "deal_defaults"];
    const update: Record<string, unknown> = {};

    for (const key of allowed) {
      if (key in body) {
        if (key === "name" && (!body.name || !String(body.name).trim())) {
          return NextResponse.json({ error: "Dealership name is required" }, { status: 400 });
        }
        if (key === "website" && body.website) {
          let url = String(body.website).trim();
          if (url && !url.startsWith("http")) url = `https://${url}`;
          update[key] = url;
        } else if (key === "credit_app_emails" && Array.isArray(body.credit_app_emails)) {
          const emails = body.credit_app_emails
            .map((e: string) => String(e).trim().toLowerCase())
            .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
          update[key] = [...new Set(emails)];
        } else {
          update[key] = body[key];
        }
      }
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("dealerships")
      .update(update)
      .eq("id", profile.dealership_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
