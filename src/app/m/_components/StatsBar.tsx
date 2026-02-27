"use client";

import { motion } from "framer-motion";

const props = [
  {
    num: "01",
    title: "Built for retail and leasing",
    desc: "Not another generic CRM. Purpose-built for how dealers and brokers actually operate.",
  },
  {
    num: "02",
    title: "Replaces 5 tools, not adds another",
    desc: "Inventory, widgets, credit apps, CRM, and deal sheets — one login, one bill.",
  },
  {
    num: "03",
    title: "Live in minutes, not months",
    desc: "No onboarding calls, no implementation team. Sign up and start listing today.",
  },
];

export function StatsBar() {
  return (
    <section className="relative border-y border-border/20">
      <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-border/20 md:grid-cols-3 md:divide-x md:divide-y-0 px-6 py-0">
        {props.map((p, i) => (
          <motion.div
            key={p.num}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="px-6 py-8 md:py-10 first:pl-0 last:pr-0"
          >
            <span className="text-[11px] font-medium text-violet-400/60 tabular-nums">{p.num}</span>
            <h3 className="mt-2 text-[0.9375rem] font-medium tracking-[-0.01em] text-foreground leading-snug">
              {p.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {p.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
