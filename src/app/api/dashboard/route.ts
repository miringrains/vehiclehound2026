import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VEHICLE_STATUSES } from "@/lib/constants";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, name, dealership_role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id)
      return NextResponse.json({ error: "No dealership" }, { status: 403 });

    const did = profile.dealership_id;
    const admin = createAdminClient();

    const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

    const [
      dealershipRes,
      activeRes,
      totalRes,
      soldRes,
      addedThisWeekRes,
      customersRes,
      newAppsRes,
      totalAppsRes,
      eventsRes,
      recentVehiclesRes,
      recentAppsRes,
      recentCustomersRes,
    ] = await Promise.all([
      admin.from("dealerships").select("name, trial_ends_at, subscription_status").eq("id", did).single(),
      admin.from("vehicles").select("id", { count: "exact", head: true }).eq("dealership_id", did).eq("status", VEHICLE_STATUSES.AVAILABLE),
      admin.from("vehicles").select("id", { count: "exact", head: true }).eq("dealership_id", did),
      admin.from("vehicles").select("id", { count: "exact", head: true }).eq("dealership_id", did).eq("status", VEHICLE_STATUSES.SOLD),
      admin.from("vehicles").select("id", { count: "exact", head: true }).eq("dealership_id", did).gte("created_at", sevenDaysAgo),
      admin.from("customers").select("id", { count: "exact", head: true }).eq("dealership_id", did),
      admin.from("credit_applications").select("id", { count: "exact", head: true }).eq("dealership_id", did).eq("status", "new"),
      admin.from("credit_applications").select("id", { count: "exact", head: true }).eq("dealership_id", did),
      admin.from("widget_events").select("event, session_id, created_at").eq("dealership_id", did).gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }),
      admin.from("vehicles").select("id, year, make, model, trim, status, online_price, preview_image, created_at, inventory_type").eq("dealership_id", did).order("created_at", { ascending: false }).limit(5),
      admin.from("credit_applications").select("id, applicant_name, status, vehicle_year, vehicle_make, vehicle_model, created_at").eq("dealership_id", did).order("created_at", { ascending: false }).limit(5),
      admin.from("customers").select("id, first_name, last_name, status, created_at").eq("dealership_id", did).order("created_at", { ascending: false }).limit(5),
    ]);

    // Build 7-day sparkline — count unique sessions per day, not raw events
    const events = eventsRes.data ?? [];
    const dailyViews: Record<string, Set<string>> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000);
      dailyViews[d.toISOString().slice(0, 10)] = new Set();
    }

    const sessions30d = new Set<string>();

    for (const e of events) {
      if (e.event === "page_view" || e.event === "detail_view") {
        sessions30d.add(e.session_id);
        const day = e.created_at.slice(0, 10);
        if (day in dailyViews) {
          dailyViews[day].add(e.session_id);
        }
      }
    }

    const sessions7d = new Set<string>();
    for (const sessions of Object.values(dailyViews)) {
      for (const s of sessions) sessions7d.add(s);
    }

    const viewsSparkline = Object.entries(dailyViews).map(([date, sessions]) => ({ date, count: sessions.size }));

    // Build activity feed — merge recent items, sort by date, take 8
    const activity: { type: string; id: string; label: string; sub: string; time: string }[] = [];

    for (const v of recentVehiclesRes.data ?? []) {
      const name = [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ") || "Vehicle";
      activity.push({ type: "vehicle", id: v.id, label: name, sub: "added to inventory", time: v.created_at });
    }
    for (const a of recentAppsRes.data ?? []) {
      const name = a.applicant_name || "Applicant";
      const vehicle = [a.vehicle_year, a.vehicle_make, a.vehicle_model].filter(Boolean).join(" ");
      activity.push({ type: "application", id: a.id, label: name, sub: vehicle ? `applied for ${vehicle}` : "submitted application", time: a.created_at });
    }
    for (const c of recentCustomersRes.data ?? []) {
      const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || "Customer";
      activity.push({ type: "customer", id: c.id, label: name, sub: "added to CRM", time: c.created_at });
    }

    activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({
      profile: { name: profile.name, role: profile.dealership_role },
      dealership: dealershipRes.data,
      stats: {
        activeInventory: activeRes.count ?? 0,
        totalInventory: totalRes.count ?? 0,
        soldCount: soldRes.count ?? 0,
        addedThisWeek: addedThisWeekRes.count ?? 0,
        totalCustomers: customersRes.count ?? 0,
        newApplications: newAppsRes.count ?? 0,
        totalApplications: totalAppsRes.count ?? 0,
        widgetViews7d: sessions7d.size,
        widgetViews30d: sessions30d.size,
      },
      viewsSparkline,
      activity: activity.slice(0, 8),
      recentVehicles: recentVehiclesRes.data ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
