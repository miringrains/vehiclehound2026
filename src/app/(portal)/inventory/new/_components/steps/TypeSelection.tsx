"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useWizard } from "../WizardContext";
import type { InventoryType } from "@/types/vehicle";

const types = [
  {
    key: "sale" as InventoryType,
    label: "For Sale",
    badge: "$40,500",
    badgeSub: "Asking price",
  },
  {
    key: "lease" as InventoryType,
    label: "Lease",
    badge: "$599/mo",
    badgeSub: "36 mo · 10k mi/yr",
  },
];

export function TypeSelection() {
  const { setData, next } = useWizard();

  function select(type: InventoryType) {
    setData({ inventory_type: type });
    next();
  }

  return (
    <div className="flex flex-col items-center pt-10 pb-12">
      <motion.h2
        className="text-heading-1 mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        What are you listing?
      </motion.h2>

      <div className="grid gap-5 sm:grid-cols-2 w-full max-w-3xl">
        {types.map(({ key, label, badge, badgeSub }, i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1 + i * 0.1,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => select(key)}
            className="group relative rounded-2xl bg-card border border-border
                       overflow-hidden cursor-pointer
                       transition-[border-color,box-shadow] duration-300
                       hover:border-violet-700/50 hover:shadow-[var(--shadow-glow)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* Abstract image wrapper */}
            <div className="relative aspect-[3/2] bg-card overflow-hidden px-5 pt-5">
              <div className="relative h-full w-full rounded-xl bg-[oklch(0.95_0.005_280)] overflow-hidden">
                <Image
                  src="/vehiclehoundinventorycar.webp"
                  alt={label}
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-contain p-5 transition-transform duration-500 ease-out
                             group-hover:scale-[1.03]"
                />

                {/* Mock UI price badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border px-3 py-2 shadow-sm">
                  <span className="text-body-sm font-semibold text-foreground">{badge}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{badgeSub}</span>
                </div>

                {/* Mock UI dot indicators */}
                <div className="absolute bottom-3 right-3 flex gap-1">
                  <div className="h-1.5 w-4 rounded-full bg-primary/70" />
                  <div className="h-1.5 w-1.5 rounded-full bg-border" />
                  <div className="h-1.5 w-1.5 rounded-full bg-border" />
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="px-6 pb-5 pt-3">
              <p className="text-heading-3">{label}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
