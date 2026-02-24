"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Car, Eye, Users, FileText, Plus, ArrowRight,
  Loader2, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip as RTooltip, XAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { ICON_STROKE_WIDTH, VEHICLE_STATUS_LABELS } from "@/lib/constants";
import { formatRelative } from "@/lib/utils/format-date";
import type { LucideIcon } from "lucide-react";

const ACCENT = "oklch(0.65 0.25 280)";
const MUTED_ICON = "oklch(0.55 0.02 280)";

type DashboardData = {
  profile: { name: string | null; role: string };
  dealership: { name: string } | null;
  stats: {
    activeInventory: number;
    totalInventory: number;
    soldCount: number;
    addedThisWeek: number;
    totalCustomers: number;
    newApplications: number;
    totalApplications: number;
    widgetViews7d: number;
    widgetViews30d: number;
  };
  viewsSparkline: { date: string; count: number }[];
  activity: { type: string; id: string; label: string; sub: string; time: string }[];
  recentVehicles: {
    id: string;
    year: number | null;
    make: string | null;
    model: string | null;
    trim: string | null;
    status: number;
    online_price: number | null;
    preview_image: string | null;
    inventory_type: string | null;
  }[];
};

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [mv, value]);

  return <motion.span>{display}</motion.span>;
}

function Sparkline({ data, accent }: { data: number[]; accent?: boolean }) {
  if (data.length < 2) return null;

  const color = accent ? ACCENT : "rgba(255,255,255,0.35)";
  const max = Math.max(...data, 1);
  const w = 64;
  const h = 24;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - (v / max) * (h - 4) - 2,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;
  const gradId = accent ? "sg-accent" : "sg-muted";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={accent ? 0.25 : 0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={accent ? 1 : 0.6} />
    </svg>
  );
}

function StatCard({
  label, value, icon: Icon, sparkData, accent, href, delay,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  sparkData?: number[];
  accent?: boolean;
  href?: string;
  delay: number;
}) {
  const trend = sparkData && sparkData.length >= 2
    ? sparkData[sparkData.length - 1] - sparkData[0]
    : null;

  const iconBg = accent ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.08)";
  const iconFg = accent ? ACCENT : "rgba(255,255,255,0.5)";

  const card = (
    <motion.div
      variants={staggerItem}
      custom={delay}
      className={`group relative rounded-xl p-5 transition-colors ${
        accent ? "border border-primary/20" : "border border-white/[0.06]"
      }`}
      style={{ background: accent ? "oklch(0.13 0.02 280)" : "oklch(0.11 0.01 280)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: iconBg }}
        >
          <Icon size={16} strokeWidth={ICON_STROKE_WIDTH} style={{ color: iconFg }} />
        </div>
        {sparkData && sparkData.length >= 2 && (
          <Sparkline data={sparkData} accent={accent} />
        )}
      </div>
      <p className="text-[1.125rem] font-semibold tracking-[-0.02em] leading-tight text-white mb-0.5">
        <AnimatedNumber value={value} />
      </p>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/50">{label}</p>
        {trend !== null && trend !== 0 && (
          <div className="flex items-center gap-0.5 text-[10px] font-medium text-white/40">
            {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend > 0 ? "+" : ""}{trend}
          </div>
        )}
        {trend === 0 && (
          <div className="flex items-center gap-0.5 text-[10px] font-medium text-white/25">
            <Minus size={10} />
          </div>
        )}
      </div>
    </motion.div>
  );

  return href ? <Link href={href} className="block">{card}</Link> : card;
}

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  vehicle: Car,
  application: FileText,
  customer: Users,
};

function activityHref(item: { type: string; id: string }) {
  if (item.type === "vehicle") return routes.vehicleDetail(item.id);
  if (item.type === "application") return routes.creditApplication(item.id);
  if (item.type === "customer") return routes.customerDetail(item.id);
  return "#";
}

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Failed to load dashboard.
      </div>
    );
  }

  const { stats, viewsSparkline, activity, recentVehicles, profile, dealership } = data;
  const greeting = profile.name ? `Welcome back, ${profile.name.split(" ")[0]}` : "Welcome back";
  const sparkCounts = viewsSparkline.map((d) => d.count);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-heading-1">{greeting}</h1>
            <p className="mt-1 text-body-sm text-muted-foreground">
              {dealership?.name ?? "Your dealership"} — here&apos;s what&apos;s happening.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 sm:mt-0">
            <Button variant="outline" size="sm" asChild>
              <Link href={routes.inventory}>View Inventory</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={routes.vehicleNew}>
                <Plus size={15} strokeWidth={ICON_STROKE_WIDTH} />
                Add Vehicle
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-3 grid-cols-2 lg:grid-cols-4"
      >
        <StatCard label="Active Inventory" value={stats.activeInventory} icon={Car} href={routes.inventory} delay={0} />
        <StatCard label="Widget Views" value={stats.widgetViews7d} icon={Eye} sparkData={sparkCounts} href={routes.reports} delay={1} />
        <StatCard label="New Applications" value={stats.newApplications} icon={FileText} href={routes.creditApplications} accent delay={2} />
        <StatCard label="Customers" value={stats.totalCustomers} icon={Users} href={routes.customers} delay={3} />
      </motion.div>

      {/* Two-column: Engagement chart + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-3 rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <div>
              <h2 className="text-heading-4">Engagement</h2>
              <p className="text-caption text-muted-foreground mt-0.5">Widget views — last 7 days</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={routes.reports} className="text-caption">
                All Insights <ArrowRight size={12} className="ml-1" />
              </Link>
            </Button>
          </div>

          {viewsSparkline.every((d) => d.count === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <Eye size={24} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground/30 mb-2" />
              <p className="text-body-sm text-muted-foreground">No widget traffic yet</p>
              <p className="text-caption text-muted-foreground/60 mt-0.5">Embed your widget to start tracking</p>
            </div>
          ) : (
            <div className="h-48 px-2 pb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewsSparkline} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d: string) => {
                      const dt = new Date(d + "T00:00:00");
                      return `${dt.getMonth() + 1}/${dt.getDate()}`;
                    }}
                    tick={{ fontSize: 10, fill: "oklch(0.45 0.02 280)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "oklch(0.16 0.015 280)",
                      border: "1px solid oklch(0.22 0.015 280)",
                      borderRadius: 8,
                      fontSize: 12,
                      padding: "6px 10px",
                    }}
                    labelFormatter={(d: string) =>
                      new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                    }
                    formatter={(value: number) => [value, "Views"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={ACCENT}
                    fill="url(#dashGrad)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0, fill: ACCENT }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2 rounded-xl border border-border bg-card"
        >
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-heading-4">Recent Activity</h2>
          </div>

          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <p className="text-body-sm text-muted-foreground">No activity yet</p>
              <p className="text-caption text-muted-foreground/60 mt-0.5">Add inventory or customers to get started</p>
            </div>
          ) : (
            <div className="px-5 pb-4">
              {activity.map((item, i) => {
                const Icon = ACTIVITY_ICONS[item.type] ?? Car;
                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={activityHref(item)}
                    className={`flex items-start gap-3 py-2.5 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg ${
                      i < activity.length - 1 ? "border-b border-border/40" : ""
                    }`}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon size={13} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium truncate">{item.label}</p>
                      <p className="text-caption text-muted-foreground truncate">{item.sub}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap pt-0.5">
                      {formatRelative(item.time)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent inventory */}
      {recentVehicles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-heading-4">Recent Inventory</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={routes.inventory} className="text-caption">
                View All <ArrowRight size={12} className="ml-1" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-y border-border/50">
                  <th className="text-left text-caption text-muted-foreground font-medium px-5 py-2">Vehicle</th>
                  <th className="text-left text-caption text-muted-foreground font-medium px-5 py-2 hidden sm:table-cell">Type</th>
                  <th className="text-left text-caption text-muted-foreground font-medium px-5 py-2 hidden md:table-cell">Price</th>
                  <th className="text-left text-caption text-muted-foreground font-medium px-5 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-2.5">
                      <Link href={routes.vehicleDetail(v.id)} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden">
                          {v.preview_image ? (
                            <img src={v.preview_image} alt="" className="h-9 w-9 object-cover" />
                          ) : (
                            <Car size={14} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium truncate max-w-[200px]">
                          {[v.year, v.make, v.model].filter(Boolean).join(" ") || "Untitled"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 hidden sm:table-cell">
                      <span className="text-caption text-muted-foreground capitalize">{v.inventory_type || "—"}</span>
                    </td>
                    <td className="px-5 py-2.5 hidden md:table-cell">
                      <span className="text-caption text-muted-foreground">
                        {v.online_price ? `$${v.online_price.toLocaleString()}` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        v.status === 1
                          ? "bg-foreground/5 text-foreground/70"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {VEHICLE_STATUS_LABELS[v.status] ?? "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
