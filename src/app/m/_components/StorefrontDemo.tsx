"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const themes = [
  { name: "Midnight Violet", primary: "#7c3aed", bg: "#0a0a0c", card: "#111113", text: "#ffffff" },
  { name: "Deep Navy", primary: "#2563eb", bg: "#0b1120", card: "#111827", text: "#ffffff" },
  { name: "Emerald Dark", primary: "#059669", bg: "#0a0c0a", card: "#111311", text: "#ffffff" },
];

const cars = [
  { title: "2025 BMW 330i", sub: "Alpine White · 7,500 mi", price: "$429/mo" },
  { title: "2025 Mercedes C300", sub: "Obsidian Black · 7,500 mi", price: "$348/mo" },
  { title: "2026 BMW X5 sDrive40i", sub: "Phytonic Blue · 7,500 mi", price: "$829/mo" },
];

export function StorefrontDemo() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % themes.length), 3500);
    return () => clearInterval(t);
  }, []);
  const theme = themes[idx];

  return (
    <div className="rounded-b-lg overflow-hidden" style={{ background: theme.bg, transition: "background 0.6s" }}>
      <div className="p-4 md:p-5" style={{ minHeight: 300 }}>
        {/* Storefront header */}
        <motion.div className="mb-4 flex items-center justify-between" layout>
          <div>
            <p className="text-[11px] font-semibold text-white">Platinum Auto Group</p>
            <p className="text-[8px]" style={{ color: theme.primary, transition: "color 0.6s" }}>
              Branded Storefront
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-md px-2.5 py-1 text-[8px] text-white/60 border" style={{ borderColor: `${theme.primary}33`, transition: "border-color 0.6s" }}>
              Inventory
            </div>
            <div className="rounded-md px-2.5 py-1 text-[8px] text-white" style={{ background: theme.primary, transition: "background 0.6s" }}>
              Apply for Credit
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="mb-3 flex gap-2">
          <div className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[8px] text-white/30">
            Search inventory...
          </div>
          <div className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-[8px] text-white/30">
            All Types
          </div>
        </div>

        {/* Vehicle cards */}
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence mode="wait">
            {cars.map((car, i) => (
              <motion.div
                key={`${theme.name}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-lg overflow-hidden border border-white/[0.06]"
                style={{ background: theme.card, transition: "background 0.6s" }}
              >
                <div className="h-16 w-full" style={{ background: `linear-gradient(135deg, ${theme.primary}22, ${theme.bg})` }} />
                <div className="p-2">
                  <p className="text-[8px] font-semibold text-white">{car.title}</p>
                  <p className="text-[7px] text-white/40">{car.sub}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-[9px] font-semibold text-white">{car.price}</p>
                    <span className="rounded px-1.5 py-0.5 text-[7px]" style={{ background: `${theme.primary}22`, color: theme.primary, transition: "all 0.6s" }}>
                      Lease
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Theme switcher indicator */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {themes.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setIdx(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 16 : 8,
                background: i === idx ? theme.primary : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
