"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useWizard } from "../WizardContext";
import type { InventoryType } from "@/types/vehicle";

const types = [
  { key: "sale" as InventoryType, label: "For Sale", overline: "PURCHASE" },
  { key: "lease" as InventoryType, label: "Lease", overline: "LEASE" },
];

export function TypeSelection() {
  const { setData, next } = useWizard();

  function select(type: InventoryType) {
    setData({ inventory_type: type });
    next();
  }

  return (
    <div className="flex flex-col items-center pt-16 pb-20">
      <motion.h2
        className="text-heading-1 mb-14"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        What are you listing?
      </motion.h2>

      <div className="grid gap-8 sm:grid-cols-2 w-full max-w-lg">
        {types.map(({ key, label, overline }, i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1 + i * 0.12,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => select(key)}
            className="group relative rounded-2xl bg-card border border-border
                       overflow-hidden cursor-pointer
                       transition-[border-color,box-shadow] duration-300
                       hover:border-violet-700/60 hover:shadow-[var(--shadow-glow)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* Image region */}
            <div className="relative aspect-[4/3] bg-[oklch(0.09_0.005_285)] overflow-hidden">
              <Image
                src="/vehiclehoundinventorycar.webp"
                alt={label}
                fill
                sizes="(max-width: 640px) 100vw, 280px"
                className="object-contain p-4 transition-transform duration-500 ease-out
                           group-hover:-translate-y-1 group-hover:scale-[1.04]"
              />
            </div>

            {/* Label region */}
            <div className="px-5 py-5 text-center">
              <span className="text-overline text-muted-foreground">
                {overline}
              </span>
              <p className="text-heading-3 mt-1">{label}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
