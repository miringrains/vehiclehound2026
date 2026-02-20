"use client";

import { motion } from "framer-motion";
import { Tag, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { useWizard } from "../WizardContext";
import type { InventoryType } from "@/types/vehicle";

const types: { key: InventoryType; label: string; desc: string; icon: typeof Tag }[] = [
  {
    key: "sale",
    label: "For Sale",
    desc: "Standard purchase inventory with asking price, sale price, and dealer cost.",
    icon: Tag,
  },
  {
    key: "lease",
    label: "Lease",
    desc: "Lease inventory with monthly payment, term length, and broker fees.",
    icon: FileText,
  },
];

export function TypeSelection() {
  const { setData, next } = useWizard();

  function select(type: InventoryType) {
    setData({ inventory_type: type });
    next();
  }

  return (
    <div className="flex flex-col items-center pt-12 pb-16">
      <h2 className="text-heading-1 mb-2">What are you listing?</h2>
      <p className="text-body text-muted-foreground mb-12">
        Choose the inventory type to get started.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 w-full max-w-xl">
        {types.map(({ key, label, desc, icon: Icon }, i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => select(key)}
            className={cn(
              "group flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-card p-10",
              "transition-all duration-200",
              "hover:border-primary/40 hover:shadow-md hover:scale-[1.02]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Icon
                size={28}
                strokeWidth={ICON_STROKE_WIDTH}
                className="text-primary"
              />
            </div>
            <div className="text-center">
              <p className="text-heading-3 mb-1">{label}</p>
              <p className="text-body-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
