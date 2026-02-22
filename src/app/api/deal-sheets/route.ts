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
    const customerId = searchParams.get("customer_id");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 25)));
    const offset = (page - 1) * limit;

    const admin = createAdminClient();
    let query = admin
      .from("deal_sheets")
      .select("*, customers(id, first_name, last_name)", { count: "exact" })
      .eq("dealership_id", auth.profile.dealership_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      deal_sheets: data ?? [],
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
    const admin = createAdminClient();

    // Validate customer belongs to same dealership
    if (body.customer_id) {
      const { data: cust } = await admin
        .from("customers")
        .select("dealership_id")
        .eq("id", body.customer_id)
        .single();
      if (!cust || cust.dealership_id !== auth.profile.dealership_id) {
        return NextResponse.json({ error: "Invalid customer" }, { status: 400 });
      }
    }

    // Snapshot vehicles for each option
    const options = Array.isArray(body.options) ? body.options : [];
    const vehicleIds = options
      .map((o: { vehicle_id?: string }) => o.vehicle_id)
      .filter(Boolean) as string[];

    let vehicleMap: Record<string, Record<string, unknown>> = {};
    if (vehicleIds.length > 0) {
      const { data: vehicles } = await admin
        .from("vehicles")
        .select("id, year, make, model, trim, vin, stock_number, mileage, exterior_color, msrp, online_price, sale_price")
        .in("id", vehicleIds);

      if (vehicles) {
        vehicleMap = Object.fromEntries(
          vehicles.map((v) => [
            v.id,
            {
              year: v.year,
              make: v.make,
              model: v.model,
              trim: v.trim,
              vin: v.vin,
              stock_number: v.stock_number,
              mileage: v.mileage,
              exterior_color: v.exterior_color,
              msrp: v.msrp,
            },
          ])
        );
      }
    }

    const snapshotOptions = options.map(
      (o: { vehicle_id?: string; vehicle_snapshot?: unknown }) => ({
        ...o,
        vehicle_snapshot: o.vehicle_id ? vehicleMap[o.vehicle_id] ?? null : o.vehicle_snapshot ?? null,
      })
    );

    const { data, error } = await admin
      .from("deal_sheets")
      .insert({
        dealership_id: auth.profile.dealership_id,
        customer_id: body.customer_id || null,
        created_by: auth.user.id,
        title: body.title || null,
        options: snapshotOptions,
        status: body.status || "draft",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ deal_sheet: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
