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

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const admin = createAdminClient();

    const { data: customer, error } = await admin
      .from("customers")
      .select("*, profiles!customers_assigned_to_fkey(id, name, email)")
      .eq("id", id)
      .eq("dealership_id", auth.profile.dealership_id)
      .single();

    if (error || !customer)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Fetch live vehicles for interests
    let vehicles: unknown[] = [];
    if (customer.vehicle_interests?.length) {
      const { data: v } = await admin
        .from("vehicles")
        .select("id, year, make, model, trim, stock_number, preview_image, online_price, sale_price")
        .in("id", customer.vehicle_interests);
      vehicles = v ?? [];
    }

    // Fetch deal sheets for this customer
    const { data: dealSheets } = await admin
      .from("deal_sheets")
      .select("id, title, status, options, created_at")
      .eq("customer_id", id)
      .eq("dealership_id", auth.profile.dealership_id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ customer, vehicles, deal_sheets: dealSheets ?? [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("customers")
      .select("dealership_id")
      .eq("id", id)
      .single();

    if (!existing || existing.dealership_id !== auth.profile.dealership_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const allowed = [
      "first_name", "last_name", "email", "phone", "address", "city", "state", "zip",
      "status", "source", "vehicle_interests", "assigned_to",
    ];
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    const { data, error } = await admin
      .from("customers")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ customer: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!["owner", "manager"].includes(auth.profile.dealership_role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("customers")
      .select("dealership_id")
      .eq("id", id)
      .single();

    if (!existing || existing.dealership_id !== auth.profile.dealership_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await admin.from("customers").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
