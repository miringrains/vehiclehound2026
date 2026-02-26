"use client";

import { CountUp } from "./CountUp";

const stats = [
  { label: "Vehicles Managed", target: 12400, prefix: "", suffix: "+" },
  { label: "Credit Applications", target: 3200, prefix: "", suffix: "+" },
  { label: "Widget Impressions", target: 840000, prefix: "", suffix: "+" },
  { label: "Uptime", target: 99, prefix: "", suffix: ".9%" },
];

export function StatsBar() {
  return (
    <section className="relative border-y border-border/30 bg-card/30 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center">
            <CountUp
              target={s.target}
              prefix={s.prefix}
              suffix={s.suffix}
              duration={2.5}
              className="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            />
            <span className="mt-2 text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
