import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PERIOD_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id) {
      return NextResponse.json({ error: "No dealership" }, { status: 403 });
    }

    const period = request.nextUrl.searchParams.get("period") || "30d";
    const days = PERIOD_DAYS[period] || 30;
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const admin = createAdminClient();
    const dealershipId = profile.dealership_id;

    const { data: events } = await admin
      .from("widget_events")
      .select("event, vehicle_id, session_id, payload, created_at")
      .eq("dealership_id", dealershipId)
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    const allEvents = events ?? [];

    const counts: Record<string, number> = {};
    const dailyCounts: Record<string, { views: Set<string>; clicks: Set<string> }> = {};
    const vehicleCounts: Record<string, { views: number; clicks: number }> = {};
    const searchQueries: Record<string, number> = {};

    for (const e of allEvents) {
      counts[e.event] = (counts[e.event] || 0) + 1;

      const day = e.created_at.slice(0, 10);
      if (!dailyCounts[day]) dailyCounts[day] = { views: new Set(), clicks: new Set() };
      if (e.event === "page_view" || e.event === "detail_view") dailyCounts[day].views.add(e.session_id);
      if (e.event === "vehicle_click") dailyCounts[day].clicks.add(e.session_id);

      if (e.vehicle_id) {
        if (!vehicleCounts[e.vehicle_id]) vehicleCounts[e.vehicle_id] = { views: 0, clicks: 0 };
        if (e.event === "detail_view") vehicleCounts[e.vehicle_id].views++;
        if (e.event === "vehicle_click") vehicleCounts[e.vehicle_id].clicks++;
      }

      if (e.event === "search" && e.payload?.query) {
        const q = String(e.payload.query).toLowerCase().trim();
        if (q) searchQueries[q] = (searchQueries[q] || 0) + 1;
      }
    }

    // Resolve top vehicles
    const topVehicleIds = Object.entries(vehicleCounts)
      .sort(([, a], [, b]) => (b.views + b.clicks) - (a.views + a.clicks))
      .slice(0, 10)
      .map(([id]) => id);

    let topVehicles: { vehicle_id: string; year: number; make: string; model: string; views: number; clicks: number }[] = [];
    if (topVehicleIds.length > 0) {
      const { data: vehicles } = await admin
        .from("vehicles")
        .select("id, year, make, model")
        .in("id", topVehicleIds);

      const vMap = new Map((vehicles ?? []).map((v: { id: string; year: number; make: string; model: string }) => [v.id, v]));
      topVehicles = topVehicleIds.map((id) => {
        const v = vMap.get(id);
        const c = vehicleCounts[id];
        return {
          vehicle_id: id,
          year: v?.year ?? 0,
          make: v?.make ?? "(Deleted)",
          model: v?.model ?? "",
          views: c?.views ?? 0,
          clicks: c?.clicks ?? 0,
        };
      });
    }

    const topSearches = Object.entries(searchQueries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    const viewsByDay = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date, views: d.views.size, clicks: d.clicks.size }));

    const uniqueViewSessions = new Set<string>();
    for (const d of Object.values(dailyCounts)) {
      for (const s of d.views) uniqueViewSessions.add(s);
    }

    return NextResponse.json({
      totalViews: uniqueViewSessions.size,
      totalSearches: counts.search || 0,
      totalVehicleClicks: counts.vehicle_click || 0,
      totalDetailViews: counts.detail_view || 0,
      totalCallClicks: counts.call_click || 0,
      totalApplyClicks: counts.apply_click || 0,
      viewsByDay,
      topVehicles,
      topSearches,
      conversionFunnel: {
        views: (counts.page_view || 0) + (counts.detail_view || 0),
        vehicleClicks: counts.vehicle_click || 0,
        detailViews: counts.detail_view || 0,
        callClicks: counts.call_click || 0,
        applyClicks: counts.apply_click || 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
