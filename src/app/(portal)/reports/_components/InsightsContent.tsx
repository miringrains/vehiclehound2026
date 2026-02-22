"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Eye, Search, MousePointer, Phone, FileText, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

type Period = "7d" | "30d" | "90d";

type AnalyticsData = {
  totalViews: number;
  totalSearches: number;
  totalVehicleClicks: number;
  totalDetailViews: number;
  totalCallClicks: number;
  totalApplyClicks: number;
  viewsByDay: { date: string; views: number; clicks: number }[];
  topVehicles: { vehicle_id: string; year: number; make: string; model: string; views: number; clicks: number }[];
  topSearches: { query: string; count: number }[];
  conversionFunnel: { views: number; vehicleClicks: number; detailViews: number; callClicks: number; applyClicks: number };
};

const STAT_CARDS = [
  { key: "totalViews" as const, label: "Total Views", icon: Eye },
  { key: "totalSearches" as const, label: "Searches", icon: Search },
  { key: "totalVehicleClicks" as const, label: "Vehicle Clicks", icon: MousePointer },
  { key: "totalCallClicks" as const, label: "Call Clicks", icon: Phone },
  { key: "totalApplyClicks" as const, label: "Applications", icon: FileText },
];

const FUNNEL_STEPS = [
  { key: "views" as const, label: "Widget Views" },
  { key: "vehicleClicks" as const, label: "Vehicle Clicks" },
  { key: "detailViews" as const, label: "Detail Views" },
  { key: "callClicks" as const, label: "Calls" },
  { key: "applyClicks" as const, label: "Applications" },
];

export function InsightsContent() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${p}`);
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  if (loading && !data) {
    return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  }

  if (!data || (data.totalViews === 0 && data.totalSearches === 0)) {
    return (
      <div className="text-center py-16">
        <BarChart3 size={32} strokeWidth={ICON_STROKE_WIDTH} className="mx-auto mb-4 text-muted-foreground/40" />
        <h3 className="text-heading-3 mb-1">No analytics yet</h3>
        <p className="text-body-sm text-muted-foreground max-w-sm mx-auto">
          Analytics will appear once your widget is live and receiving traffic. Embed the inventory widget on your website to start tracking.
        </p>
      </div>
    );
  }

  const funnelData = FUNNEL_STEPS.map((s) => ({
    name: s.label,
    value: data.conversionFunnel[s.key],
  }));

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 w-fit">
        {(["7d", "30d", "90d"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-md text-caption font-medium transition-colors ${
              period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p === "7d" ? "7 days" : p === "30d" ? "30 days" : "90 days"}
          </button>
        ))}
        {loading && <Loader2 size={12} className="ml-2 animate-spin text-muted-foreground" />}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
              <span className="text-caption text-muted-foreground">{label}</span>
            </div>
            <p className="text-heading-2">{data[key].toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Views over time */}
      {data.viewsByDay.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-heading-4 mb-4">Views & Clicks Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.viewsByDay}>
                <defs>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.25 280)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.25 280)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.15 180)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.7 0.15 180)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 280)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => { const dt = new Date(d + "T00:00:00"); return (dt.getMonth() + 1) + "/" + dt.getDate(); }}
                  tick={{ fontSize: 11, fill: "oklch(0.55 0.02 280)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.02 280)" }} axisLine={false} tickLine={false} />
                <RTooltip
                  contentStyle={{ background: "oklch(0.2 0.03 280)", border: "1px solid oklch(0.3 0.03 280)", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <Area type="monotone" dataKey="views" stroke="oklch(0.65 0.25 280)" fill="url(#vGrad)" strokeWidth={2} name="Views" />
                <Area type="monotone" dataKey="clicks" stroke="oklch(0.7 0.15 180)" fill="url(#cGrad)" strokeWidth={2} name="Clicks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Conversion funnel + top searches side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-heading-4 mb-4">Conversion Funnel</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 280)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "oklch(0.55 0.02 280)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "oklch(0.55 0.02 280)" }} axisLine={false} tickLine={false} />
                <RTooltip
                  contentStyle={{ background: "oklch(0.2 0.03 280)", border: "1px solid oklch(0.3 0.03 280)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" fill="oklch(0.65 0.25 280)" radius={[0, 4, 4, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data.topSearches.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-heading-4 mb-3">Top Search Terms</h3>
            <div className="space-y-2">
              {data.topSearches.map((s, i) => (
                <div key={s.query} className="flex items-center gap-3">
                  <span className="text-caption text-muted-foreground w-5 text-right">{i + 1}</span>
                  <span className="text-body-sm flex-1 truncate">{s.query}</span>
                  <span className="text-caption text-muted-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top vehicles */}
      {data.topVehicles.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-heading-4">Top Vehicles</h3>
          </div>
          <table className="w-full text-caption">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2 text-left font-medium text-muted-foreground">Vehicle</th>
                <th className="px-5 py-2 text-right font-medium text-muted-foreground">Views</th>
                <th className="px-5 py-2 text-right font-medium text-muted-foreground">Clicks</th>
                <th className="px-5 py-2 text-right font-medium text-muted-foreground">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.topVehicles.map((v) => {
                const ctr = v.views > 0 ? ((v.clicks / v.views) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={v.vehicle_id}>
                    <td className="px-5 py-2 text-body-sm">{v.year} {v.make} {v.model}</td>
                    <td className="px-5 py-2 text-right">{v.views}</td>
                    <td className="px-5 py-2 text-right">{v.clicks}</td>
                    <td className="px-5 py-2 text-right">{ctr}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
