import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id, dealership_role")
    .eq("id", user.id)
    .single();

  if (!profile?.dealership_id) return null;
  return { user, profile };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 25)));
    const offset = (page - 1) * limit;

    const admin = createAdminClient();
    let query = admin
      .from("customers")
      .select("*, profiles!customers_assigned_to_fkey(id, name, email)", { count: "exact" })
      .eq("dealership_id", auth.profile.dealership_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      customers: data ?? [],
      total: count ?? 0,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { first_name, last_name } = body;
    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json({ error: "First and last name required" }, { status: 400 });
    }

    if (body.credit_app_id) {
      const admin = createAdminClient();
      const { data: app } = await admin
        .from("credit_applications")
        .select("dealership_id")
        .eq("id", body.credit_app_id)
        .single();
      if (!app || app.dealership_id !== auth.profile.dealership_id) {
        return NextResponse.json({ error: "Invalid credit application" }, { status: 400 });
      }
    }

    const allowed = [
      "first_name", "last_name", "email", "phone", "address", "city", "state", "zip",
      "status", "source", "vehicle_interests", "credit_app_id", "assigned_to",
    ];
    const insert: Record<string, unknown> = { dealership_id: auth.profile.dealership_id };
    for (const key of allowed) {
      if (key in body && body[key] !== undefined) insert[key] = body[key];
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("customers")
      .insert(insert)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ customer: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
