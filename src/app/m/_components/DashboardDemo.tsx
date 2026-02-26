"use client";

import { motion } from "framer-motion";
import { Car, Eye, FileText, TrendingUp } from "lucide-react";

const stats = [
  { label: "Active Inventory", value: "47", icon: Car, delta: "+3", color: "text-violet-400" },
  { label: "Widget Views", value: "2,841", icon: Eye, delta: "+18%", color: "text-blue-400" },
  { label: "Credit Apps", value: "12", icon: FileText, delta: "+5", color: "text-emerald-400" },
];

const sparkData = [20, 35, 28, 45, 52, 38, 60, 55, 72, 65, 80, 90, 78, 95];

const vehicles = [
  { year: 2025, make: "BMW", model: "330i", price: "$429/mo", img: "bg-blue-900/40" },
  { year: 2026, make: "Audi", model: "Q5 Premium", price: "$609/mo", img: "bg-emerald-900/40" },
  { year: 2025, make: "Mercedes", model: "C300", price: "$348/mo", img: "bg-violet-900/40" },
];

function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const h = 32;
  const w = 120;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(124,58,237)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(124,58,237)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="rgb(124,58,237)" strokeWidth="1.5" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#spark-fill)" />
    </svg>
  );
}

export function DashboardDemo() {
  return (
    <div className="bg-background p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-lg border border-border/40 bg-card/60 p-3"
          >
            <div className="flex items-center justify-between">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="flex items-center text-[10px] font-medium text-emerald-400">
                <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                {s.delta}
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="rounded-lg border border-border/40 bg-card/60 p-3"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Widget Views — 7 days</span>
          <span className="text-[10px] text-muted-foreground">Last updated just now</span>
        </div>
        <Spark data={sparkData} />
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {vehicles.map((v, i) => (
          <motion.div
            key={v.model}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2 + i * 0.1, duration: 0.4 }}
            className="overflow-hidden rounded-lg border border-border/40 bg-card/60"
          >
            <div className={`h-16 ${v.img}`} />
            <div className="p-2">
              <p className="text-[10px] font-medium text-foreground truncate">
                {v.year} {v.make} {v.model}
              </p>
              <p className="text-[10px] text-violet-400">{v.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
