import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 25)));

    let query = supabase
      .from("vehicles")
      .select("id, year, make, model, trim, stock_number, vin, online_price, sale_price, mileage, exterior_color, preview_image, msrp")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (search) {
      query = query.or(
        `make.ilike.%${search}%,model.ilike.%${search}%,trim.ilike.%${search}%,stock_number.ilike.%${search}%,vin.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ vehicles: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("vehicles")
      .insert(body)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
