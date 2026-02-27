"use client";

import {
  Car,
  FileText,
  Users,
  BarChart3,
  Globe,
  Presentation,
} from "lucide-react";
import { motion } from "framer-motion";

const pillars = [
  { icon: Car, label: "Inventory Management" },
  { icon: Globe, label: "Website Widgets" },
  { icon: FileText, label: "Credit Applications" },
  { icon: Users, label: "Customer CRM" },
  { icon: Presentation, label: "Deal Sheets" },
  { icon: BarChart3, label: "Analytics" },
];

export function StatsBar() {
  return (
    <section className="relative border-y border-border/30 bg-card/20 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex items-center gap-2 text-muted-foreground/70"
            >
              <p.icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-sm">{p.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
