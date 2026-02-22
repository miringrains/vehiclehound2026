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

    const { data: sheet, error } = await admin
      .from("deal_sheets")
      .select("*, customers(id, first_name, last_name, email, phone)")
      .eq("id", id)
      .eq("dealership_id", auth.profile.dealership_id)
      .single();

    if (error || !sheet) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ deal_sheet: sheet });
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
      .from("deal_sheets")
      .select("dealership_id, options")
      .eq("id", id)
      .single();

    if (!existing || existing.dealership_id !== auth.profile.dealership_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if ("title" in body) update.title = body.title;
    if ("status" in body) update.status = body.status;
    if ("customer_id" in body) update.customer_id = body.customer_id || null;

    if ("options" in body && Array.isArray(body.options)) {
      const options = body.options;
      const vehicleIds = options
        .map((o: { vehicle_id?: string }) => o.vehicle_id)
        .filter(Boolean) as string[];

      let vehicleMap: Record<string, Record<string, unknown>> = {};
      if (vehicleIds.length > 0) {
        const { data: vehicles } = await admin
          .from("vehicles")
          .select("id, year, make, model, trim, vin, stock_number, mileage, exterior_color, msrp")
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

      update.options = options.map(
        (o: { vehicle_id?: string; vehicle_snapshot?: unknown }) => ({
          ...o,
          vehicle_snapshot: o.vehicle_id
            ? vehicleMap[o.vehicle_id] ?? o.vehicle_snapshot ?? null
            : o.vehicle_snapshot ?? null,
        })
      );
    }

    const { data, error } = await admin
      .from("deal_sheets")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ deal_sheet: data });
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
      .from("deal_sheets")
      .select("dealership_id")
      .eq("id", id)
      .single();

    if (!existing || existing.dealership_id !== auth.profile.dealership_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await admin.from("deal_sheets").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
