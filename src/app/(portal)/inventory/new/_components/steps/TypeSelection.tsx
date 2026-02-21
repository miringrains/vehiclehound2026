"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useWizard } from "../WizardContext";
import type { InventoryType } from "@/types/vehicle";

const types = [
  { key: "sale" as InventoryType, label: "For Sale" },
  { key: "lease" as InventoryType, label: "Lease" },
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

      <div className="grid gap-5 sm:grid-cols-2 w-full max-w-2xl">
        {types.map(({ key, label }, i) => (
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
            {/* Car image on neutral background */}
            <div className="relative aspect-[3/2] bg-[oklch(0.95_0.005_280)] overflow-hidden">
              <Image
                src="/vehiclehoundinventorycar.webp"
                alt={label}
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-contain p-6 transition-transform duration-500 ease-out
                           group-hover:scale-[1.03]"
              />
            </div>

            {/* Label */}
            <div className="px-6 py-5 border-t border-border">
              <p className="text-heading-3">{label}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
