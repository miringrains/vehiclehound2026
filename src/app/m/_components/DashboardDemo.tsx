"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  LayoutDashboard,
  Car,
  Eye,
  FileText,
  Users,
  List,
  Upload,
  BarChart3,
  Plug,
  Settings,
  CreditCard,
  TrendingUp,
  PlusCircle,
} from "lucide-react";

const sidebarNav = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: PlusCircle, label: "New Vehicle" },
  { icon: List, label: "Manage Inventory" },
  { icon: Upload, label: "CSV Import" },
  { icon: BarChart3, label: "Insights" },
  { icon: FileText, label: "Applications" },
  { icon: Users, label: "Customers" },
  { icon: Plug, label: "Integrations" },
  { icon: Settings, label: "Settings" },
  { icon: CreditCard, label: "Billing" },
];

const stats = [
  { label: "Active Inventory", value: 47, icon: Car, delta: "+3", spark: [20, 35, 28, 45, 52, 38, 60] },
  { label: "Widget Views", value: 2841, icon: Eye, delta: "+18%", spark: [30, 50, 45, 65, 55, 72, 80] },
  { label: "New Applications", value: 12, icon: FileText, delta: "+5", spark: [10, 18, 14, 22, 30, 25, 35], accent: true },
  { label: "Customers", value: 89, icon: Users, delta: "+7", spark: [40, 42, 45, 50, 48, 55, 60] },
];

const chartData = [15, 28, 22, 42, 38, 55, 48, 62, 58, 72, 65, 85, 78, 90];

const activities = [
  { icon: Car, text: "2025 BMW 330i added to inventory", time: "2m ago", fresh: true },
  { icon: FileText, text: "Credit app from J. Smith", time: "15m ago", fresh: true },
  { icon: Users, text: "Maria Lopez added as customer", time: "1h ago", fresh: false },
  { icon: Car, text: "Mercedes C300 marked as sold", time: "3h ago", fresh: false },
];

function useCountUp(target: number, delay: number, inView: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1200;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start - delay * 1000;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delay, inView]);
  return val;
}

function formatNum(n: number) {
  return n >= 1000 ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, "0")}` : String(n);
}

function MiniSparkline({ data, color = "rgba(124,58,237,0.6)", animate = false }: { data: number[]; color?: string; animate?: boolean }) {
  const max = Math.max(...data);
  const h = 24;
  const w = 64;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  const id = `sf-${color.replace(/[^a-z0-9]/g, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={animate ? "200" : undefined}
        strokeDashoffset={animate ? "200" : undefined}
      >
        {animate && (
          <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.5s" fill="freeze" begin="0.8s" />
        )}
      </polyline>
    </svg>
  );
}

function AnimatedAreaChart({ data, inView }: { data: number[]; inView: boolean }) {
  const max = Math.max(...data);
  const h = 80;
  const w = 280;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 8)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chart-fill-demo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.65 0.25 280)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.65 0.25 280)" stopOpacity="0" />
        </linearGradient>
        <clipPath id="chart-reveal">
          <rect x="0" y="0" width={inView ? w : 0} height={h}>
            {inView && (
              <animate attributeName="width" from="0" to={w} dur="1.8s" fill="freeze" begin="0s" calcMode="spline" keySplines="0.16 1 0.3 1" />
            )}
          </rect>
        </clipPath>
      </defs>
      <g clipPath="url(#chart-reveal)">
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#chart-fill-demo)" />
        <polyline points={pts} fill="none" stroke="oklch(0.65 0.25 280)" strokeWidth="1.5" />
        {/* Animated dot at the end of the line */}
        {inView && (
          <circle r="2.5" fill="oklch(0.65 0.25 280)">
            <animateMotion
              dur="1.8s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.16 1 0.3 1"
              path={`M${data.map((v, i) => `${(i / (data.length - 1)) * w} ${h - (v / max) * (h - 8)}`).join(" L")}`}
            />
          </circle>
        )}
      </g>
    </svg>
  );
}

export function DashboardDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="flex bg-[oklch(0.07_0.005_285)] rounded-b-lg overflow-hidden" style={{ height: 360 }}>
      {/* Sidebar */}
      <div className="hidden md:flex w-[140px] shrink-0 flex-col border-r border-white/[0.06] py-3 px-2">
        <div className="mb-4 px-2">
          <div className="h-4 w-20 rounded bg-white/10" />
        </div>
        <div className="space-y-0.5">
          {sidebarNav.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[9px] ${
                item.active
                  ? "bg-violet-950/60 text-violet-200"
                  : "text-white/40"
              }`}
            >
              <item.icon className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content area — light panel */}
      <div className="flex-1 p-2 md:p-2.5">
        <div className="h-full rounded-xl bg-[oklch(0.98_0.002_285)] p-3 md:p-4 overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mb-3 flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-medium text-[oklch(0.145_0.005_285)]">Welcome back, Kevin</p>
              <p className="text-[8px] text-[oklch(0.44_0.02_280)]">Platinum Auto Group</p>
            </div>
            <div className="flex gap-1.5">
              <div className="rounded-md border border-[oklch(0.91_0.005_280)] px-2 py-0.5 text-[8px] text-[oklch(0.44_0.02_280)]">View Inventory</div>
              <div className="rounded-md bg-[oklch(0.46_0.16_280)] px-2 py-0.5 text-[8px] text-white">Add Vehicle</div>
            </div>
          </motion.div>

          {/* Stat cards */}
          <div className="mb-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {stats.map((s, i) => {
              const count = useCountUp(s.value, 0.6 + i * 0.15, inView);
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#0a0a0c] p-2.5"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06]">
                        <s.icon className="h-2.5 w-2.5 text-white/50" strokeWidth={1.75} />
                      </div>
                      <MiniSparkline data={s.spark} animate={inView} color={s.accent ? "rgba(52,211,153,0.6)" : undefined} />
                    </div>
                    <p className="mt-2 text-sm font-medium tracking-tight text-white tabular-nums">{formatNum(count)}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] font-medium text-white/45">{s.label}</p>
                      <span className="flex items-center text-[8px] text-emerald-400">
                        <TrendingUp className="mr-0.5 h-2 w-2" />{s.delta}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Chart + Activity */}
          <div className="grid grid-cols-5 gap-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="col-span-3 rounded-lg border border-[oklch(0.91_0.005_280)] bg-white p-2.5"
            >
              <p className="text-[9px] font-medium text-[oklch(0.145_0.005_285)]">Engagement</p>
              <p className="mb-2 text-[7px] text-[oklch(0.44_0.02_280)]">Widget views — last 7 days</p>
              <div className="h-16">
                <AnimatedAreaChart data={chartData} inView={inView} />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.1, duration: 0.4 }}
              className="col-span-2 rounded-lg border border-[oklch(0.91_0.005_280)] bg-white p-2.5"
            >
              <p className="mb-2 text-[9px] font-medium text-[oklch(0.145_0.005_285)]">Recent Activity</p>
              <div className="space-y-1.5">
                {activities.map((a, i) => (
                  <motion.div
                    key={a.text}
                    initial={{ opacity: 0, x: 8 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.3 + i * 0.12, duration: 0.35 }}
                    className="flex items-center gap-1.5"
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full ${a.fresh ? "bg-violet-50" : "bg-[oklch(0.955_0.003_285)]"}`}>
                      <a.icon className={`h-2 w-2 ${a.fresh ? "text-violet-500" : "text-[oklch(0.44_0.02_280)]"}`} />
                    </div>
                    <span className="flex-1 truncate text-[7px] text-[oklch(0.145_0.005_285)]">{a.text}</span>
                    <span className="shrink-0 text-[7px] text-[oklch(0.44_0.02_280)]">{a.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
