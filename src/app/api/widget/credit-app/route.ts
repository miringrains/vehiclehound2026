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
   GET /api/widget/credit-app
   Public widget API — returns config for the
   standalone credit application embed widget.
   ──────────────────────────────────────────────── */
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const apiKey =
      request.headers.get("x-api-key") ||
      request.nextUrl.searchParams.get("key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401, headers },
      );
    }

    const admin = createAdminClient();

    const { data: config, error: configErr } = await admin
      .from("widget_configs")
      .select("*")
      .eq("api_key", apiKey)
      .eq("status", "active")
      .single();

    if (configErr || !config) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 403, headers },
      );
    }

    const allowed: string[] = config.allowed_domains ?? [];
    if (allowed.length > 0 && origin) {
      const originHost = new URL(origin).hostname;
      const match = allowed.some(
        (d: string) => originHost === d || originHost.endsWith(`.${d}`),
      );
      if (!match) {
        return NextResponse.json(
          { error: "Domain not allowed" },
          { status: 403, headers },
        );
      }
    }

    const showCreditApp = config.config?.showCreditApp !== false;
    if (!showCreditApp) {
      return NextResponse.json(
        { error: "Credit application is disabled" },
        { status: 403, headers },
      );
    }

    const { data: dealership } = await admin
      .from("dealerships")
      .select("name, phone, slug")
      .eq("id", config.dealership_id)
      .single();

    const appOrigin = new URL(request.url).origin;
    const creditAppUrl =
      config.config?.creditAppUrl ||
      (dealership?.slug
        ? `${appOrigin}/s/${dealership.slug}/credit-application`
        : "");

    return NextResponse.json(
      {
        config: {
          primaryColor: config.config?.primaryColor || "#1a1d1e",
          hoverColor: config.config?.hoverColor || "#374151",
          borderRadius: config.config?.borderRadius || "rounded",
          backgroundColor: config.config?.backgroundColor || "#ffffff",
          creditAppUrl,
          phone: dealership?.phone || "",
          dealershipName: dealership?.name || "",
        },
      },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers },
    );
  }
}
