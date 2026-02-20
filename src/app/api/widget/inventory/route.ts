import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

/* ────────────────────────────────────────────────
   GET /api/widget/inventory
   Public widget API — requires X-API-Key header.
   Returns paginated, filtered vehicle inventory.
   ──────────────────────────────────────────────── */
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const apiKey = request.headers.get("x-api-key") || request.nextUrl.searchParams.get("key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401, headers });
    }

    const admin = createAdminClient();

    const { data: config, error: configErr } = await admin
      .from("widget_configs")
      .select("*")
      .eq("api_key", apiKey)
      .eq("status", "active")
      .single();

    if (configErr || !config) {
      return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 403, headers });
    }

    const allowed: string[] = config.allowed_domains ?? [];
    if (allowed.length > 0 && origin) {
      const originHost = new URL(origin).hostname;
      const match = allowed.some((d: string) => originHost === d || originHost.endsWith(`.${d}`));
      if (!match) {
        return NextResponse.json({ error: "Domain not allowed" }, { status: 403, headers });
      }
    }

    const url = request.nextUrl;
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? String(config.config?.itemsPerPage ?? 12), 10), 50);
    const offset = (page - 1) * limit;
    const search = url.searchParams.get("search");
    const type = url.searchParams.get("type");
    const sort = url.searchParams.get("sort") || config.config?.defaultSort || "newest";

    const showPricing = config.config?.showPricing !== false;

    const selectFields = [
      "id", "year", "make", "model", "trim", "stock_number",
      "inventory_type", "vehicle_type", "mileage", "exterior_color",
      "preview_image", "status", "created_at",
      ...(showPricing ? ["online_price", "sale_price", "lease_payment", "lease_term", "msrp"] : []),
    ].join(", ");

    let query = admin
      .from("vehicles")
      .select(selectFields, { count: "exact" })
      .eq("dealership_id", config.dealership_id)
      .eq("status", 1);

    if (type && type !== "all") {
      query = query.eq("inventory_type", type);
    }

    if (search) {
      query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%,trim.ilike.%${search}%,stock_number.ilike.%${search}%`);
    }

    if (sort === "price_asc") query = query.order("online_price", { ascending: true, nullsFirst: false });
    else if (sort === "price_desc") query = query.order("online_price", { ascending: false, nullsFirst: false });
    else if (sort === "year_desc") query = query.order("year", { ascending: false, nullsFirst: false });
    else if (sort === "mileage_asc") query = query.order("mileage", { ascending: true, nullsFirst: false });
    else query = query.order("created_at", { ascending: false });

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers });
    }

    return NextResponse.json({
      vehicles: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
      config: {
        primaryColor: config.config?.primaryColor || "#1a1d1e",
        hoverColor: config.config?.hoverColor || "#374151",
        showPricing,
        creditAppUrl: config.config?.creditAppUrl || "",
      },
    }, { headers });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
  }
}
