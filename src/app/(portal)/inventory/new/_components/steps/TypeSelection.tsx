"use client";

import { motion } from "framer-motion";
import { ShoppingCart, FileText } from "lucide-react";
import Image from "next/image";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { useWizard } from "../WizardContext";
import type { InventoryType } from "@/types/vehicle";

const types = [
  {
    key: "sale" as InventoryType,
    label: "For Sale",
    overline: "PURCHASE",
    description: "List a vehicle for direct purchase with full pricing control",
    Icon: ShoppingCart,
  },
  {
    key: "lease" as InventoryType,
    label: "Lease",
    overline: "LEASE TRANSFER",
    description: "Create a lease listing with monthly terms and mileage details",
    Icon: FileText,
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
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-overline text-primary mb-3">NEW LISTING</p>
        <h2 className="text-heading-1">What are you listing?</h2>
        <p className="text-body text-muted-foreground mt-2 max-w-md mx-auto">
          Choose the listing type to get started. You can always change this later.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 w-full max-w-xl">
        {types.map(({ key, label, overline, description, Icon }, i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.12 + i * 0.1,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => select(key)}
            className="group relative rounded-2xl bg-card border border-border
                       overflow-hidden cursor-pointer text-left
                       transition-[border-color,box-shadow] duration-300
                       hover:border-violet-700/60 hover:shadow-[var(--shadow-glow)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* Image region */}
            <div className="relative aspect-[4/3] bg-[oklch(0.09_0.005_285)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent z-10" />
              <Image
                src="/vehiclehoundinventorycar.webp"
                alt={label}
                fill
                sizes="(max-width: 640px) 100vw, 280px"
                className="object-contain p-4 transition-transform duration-500 ease-out
                           group-hover:-translate-y-1 group-hover:scale-[1.04]"
              />
            </div>

            {/* Content region */}
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Icon size={14} strokeWidth={ICON_STROKE_WIDTH} className="text-primary" />
                </div>
                <span className="text-overline text-muted-foreground">
                  {overline}
                </span>
              </div>
              <p className="text-heading-3">{label}</p>
              <p className="text-caption text-muted-foreground mt-1.5 leading-relaxed">
                {description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
