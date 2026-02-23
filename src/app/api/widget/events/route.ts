import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_EVENTS = new Set([
  "page_view", "search", "filter", "vehicle_click",
  "detail_view", "call_click", "apply_click", "back_to_inventory",
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BATCH = 50;
const MAX_PAYLOAD_SIZE = 2048;

const rateLimitMap = new Map<string, { count: number; reset: number }>();

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) return new NextResponse(null, { status: 401, headers });

    const now = Date.now();
    const rl = rateLimitMap.get(apiKey);
    if (rl && rl.reset > now && rl.count >= 100) {
      return new NextResponse(null, { status: 429, headers });
    }
    if (!rl || rl.reset <= now) {
      rateLimitMap.set(apiKey, { count: 1, reset: now + 60_000 });
    } else {
      rl.count++;
    }

    const admin = createAdminClient();

    const { data: config } = await admin
      .from("widget_configs")
      .select("dealership_id")
      .eq("api_key", apiKey)
      .single();

    if (!config) return new NextResponse(null, { status: 401, headers });

    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.events)) return new NextResponse(null, { status: 400, headers });

    const events = body.events.slice(0, MAX_BATCH);
    const rows = [];

    for (const evt of events) {
      if (!evt.event || !ALLOWED_EVENTS.has(evt.event)) continue;
      if (!evt.session_id || typeof evt.session_id !== "string") continue;

      let vehicleId = evt.vehicle_id ?? null;
      if (vehicleId && !UUID_RE.test(vehicleId)) vehicleId = null;

      let payload = evt.payload ?? {};
      const payloadStr = JSON.stringify(payload);
      if (payloadStr.length > MAX_PAYLOAD_SIZE) payload = {};

      rows.push({
        dealership_id: config.dealership_id,
        event: evt.event,
        vehicle_id: vehicleId,
        payload,
        session_id: evt.session_id.slice(0, 32),
      });
    }

    if (rows.length > 0) {
      const { error } = await admin.from("widget_events").insert(rows);
      if (error) {
        console.error("[widget-events] Insert failed:", error.message);
        return new NextResponse(null, { status: 500, headers });
      }
    }

    return new NextResponse(null, { status: 204, headers });
  } catch (err) {
    console.error("[widget-events] Unexpected error:", err);
    return new NextResponse(null, { status: 500, headers });
  }
}
