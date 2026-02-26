"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BrowserFrame } from "./BrowserFrame";

const themes = [
  { primary: "#7C3AED", name: "Platinum Motors", accent: "violet" },
  { primary: "#059669", name: "Green Valley Auto", accent: "emerald" },
  { primary: "#2563EB", name: "Pacific Motors", accent: "blue" },
];

const cards = [
  { name: "2025 BMW 330i", price: "$429/mo" },
  { name: "2026 Audi Q5", price: "$609/mo" },
  { name: "2025 Toyota Tacoma", price: "$249/mo" },
  { name: "2025 Mercedes C300", price: "$348/mo" },
];

export function StorefrontDemo() {
  const [themeIdx, setThemeIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(() => {
      setThemeIdx((i) => (i + 1) % themes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [inView]);

  const theme = themes[themeIdx];

  return (
    <div ref={ref}>
      <BrowserFrame url={`${theme.name.toLowerCase().replace(/\s+/g, "")}.vhlist.com`}>
        <div className="bg-background p-4 transition-colors duration-700">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="h-6 w-6 rounded-md transition-colors duration-700"
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-xs font-semibold text-foreground">{theme.name}</span>
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-10 rounded bg-muted/30" />
              <div className="h-2 w-10 rounded bg-muted/30" />
            </div>
          </div>

          {/* Hero Banner */}
          <motion.div
            className="mb-4 rounded-lg p-3 transition-colors duration-700"
            style={{ backgroundColor: `${theme.primary}15` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold text-foreground">Browse Our Inventory</div>
                <div className="text-[8px] text-muted-foreground">Find your next vehicle today</div>
              </div>
              <motion.div
                className="rounded-md px-2 py-1 text-[8px] font-medium text-white transition-colors duration-700"
                style={{ backgroundColor: theme.primary }}
              >
                Apply Now
              </motion.div>
            </div>
          </motion.div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-2 gap-2">
            {cards.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="overflow-hidden rounded-lg border border-border/30"
              >
                <div
                  className="h-12 transition-colors duration-700"
                  style={{ backgroundColor: `${theme.primary}10` }}
                />
                <div className="p-2">
                  <p className="text-[9px] font-medium text-foreground">{c.name}</p>
                  <p
                    className="text-[9px] font-semibold transition-colors duration-700"
                    style={{ color: theme.primary }}
                  >
                    {c.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrowserFrame>

      {/* Theme switcher dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {themes.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setThemeIdx(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i === themeIdx ? "scale-125" : "opacity-40"
            }`}
            style={{ backgroundColor: t.primary }}
            aria-label={`Theme: ${t.name}`}
          />
        ))}
      </div>
    </div>
  );
}
