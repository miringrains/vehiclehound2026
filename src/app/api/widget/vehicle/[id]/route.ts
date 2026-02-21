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

type RouteContext = { params: Promise<{ id: string }> };

/* ────────────────────────────────────────────────
   GET /api/widget/vehicle/:id
   Public widget API — returns full vehicle detail
   ──────────────────────────────────────────────── */
export async function GET(request: NextRequest, ctx: RouteContext) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const { id } = await ctx.params;
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

    const showPricing = config.config?.showPricing !== false;

    const { data: vehicle, error } = await admin
      .from("vehicles")
      .select("*, images:vehicle_images(id, file_path, display_order)")
      .eq("id", id)
      .eq("dealership_id", config.dealership_id)
      .single();

    if (error || !vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404, headers });
    }

    if (!showPricing) {
      vehicle.online_price = null;
      vehicle.sale_price = null;
      vehicle.purchase_price = null;
      vehicle.msrp = null;
      vehicle.lease_payment = null;
    }

    const images = (vehicle.images ?? [])
      .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
      .map((img: { file_path: string }) => {
        const { data } = admin.storage.from("vehicle-images").getPublicUrl(img.file_path);
        return data.publicUrl;
      });

    return NextResponse.json({
      vehicle: { ...vehicle, images, image_urls: images },
      config: {
        primaryColor: config.config?.primaryColor || "#1a1d1e",
        hoverColor: config.config?.hoverColor || "#374151",
        showPricing,
        creditAppUrl: config.config?.creditAppUrl || "",
        borderRadius: config.config?.borderRadius || "rounded",
        backgroundColor: config.config?.backgroundColor || "#ffffff",
      },
    }, { headers });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
  }
}
