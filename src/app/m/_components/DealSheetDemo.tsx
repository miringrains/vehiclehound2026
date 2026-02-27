"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Car, Send, FileDown, Star } from "lucide-react";

const options = [
  {
    label: "Option A",
    type: "Finance",
    term: "60 mo",
    vehicle: "2025 BMW 330i",
    monthly: 487,
    rows: [
      ["Selling Price", "$42,500"],
      ["Down Payment", "$5,000"],
      ["APR", "5.49%"],
      ["Amount Financed", "$39,425"],
      ["Total Cost", "$49,210"],
    ],
  },
  {
    label: "Option B",
    type: "Finance",
    term: "72 mo",
    vehicle: "2025 BMW 330i",
    monthly: 421,
    best: true,
    rows: [
      ["Selling Price", "$42,500"],
      ["Down Payment", "$5,000"],
      ["APR", "6.29%"],
      ["Amount Financed", "$39,425"],
      ["Total Cost", "$52,332"],
    ],
  },
  {
    label: "Option C",
    type: "Lease",
    term: "39 mo",
    vehicle: "2025 BMW 330i",
    monthly: 429,
    rows: [
      ["Selling Price", "$42,500"],
      ["Down Payment", "$3,000"],
      ["Mileage", "7,500/yr"],
      ["Residual", "58%"],
      ["Due at Signing", "$4,248"],
    ],
  },
];

function AnimatedPrice({ target, inView, delay }: { target: number; inView: boolean; delay: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start - delay * 1000;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const progress = Math.min(elapsed / 800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, inView, delay]);
  return <>${val}</>;
}

export function DealSheetDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [highlighted, setHighlighted] = useState(1);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setHighlighted((h) => (h + 1) % 3), 3000);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <div ref={ref} className="rounded-b-lg overflow-hidden bg-[#0a0a0c] p-4 md:p-5">
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-3 flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] font-medium text-white">Deal Comparison — John Smith</p>
          <p className="text-[7px] text-white/40">Created just now · 3 options</p>
        </div>
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1 rounded-md border border-white/[0.08] px-2 py-0.5 text-[7px] text-white/50">
            <FileDown className="h-2 w-2" />Export PDF
          </div>
          <div className="flex items-center gap-1 rounded-md bg-violet-600 px-2 py-0.5 text-[7px] text-white">
            <Send className="h-2 w-2" />Send to Customer
          </div>
        </div>
      </motion.div>

      {/* Option cards */}
      <div className="flex gap-2 overflow-hidden">
        {options.map((opt, i) => {
          const isActive = i === highlighted;
          return (
            <motion.div
              key={opt.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? {
                opacity: 1,
                y: 0,
                borderColor: isActive ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)",
              } : {}}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-w-0 flex-1 rounded-lg border bg-[#111113] overflow-hidden"
              onMouseEnter={() => setHighlighted(i)}
            >
              {/* "Lowest Monthly" badge */}
              {opt.best && isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5"
                >
                  <Star className="h-2 w-2 text-emerald-400" fill="currentColor" />
                  <span className="text-[6px] font-medium text-emerald-400">Lowest</span>
                </motion.div>
              )}

              {/* Card header */}
              <div className="border-b border-white/[0.06] px-3 py-2">
                <p className="text-[9px] font-medium text-white">{opt.label}</p>
                <p className="text-[7px] text-white/40">{opt.type} · {opt.term}</p>
              </div>

              <div className="p-3 space-y-2.5">
                {/* Vehicle */}
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-white/[0.05]">
                    <Car className="h-2.5 w-2.5 text-white/40" />
                  </div>
                  <p className="text-[8px] font-medium text-white/70">{opt.vehicle}</p>
                </div>

                {/* Monthly payment box */}
                <motion.div
                  animate={{
                    borderColor: isActive ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.08)",
                    backgroundColor: isActive ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.03)",
                  }}
                  transition={{ duration: 0.4 }}
                  className="rounded-md border py-2 text-center"
                >
                  <p className={`text-base font-medium tabular-nums transition-colors duration-300 ${isActive ? "text-violet-300" : "text-violet-400/70"}`}>
                    <AnimatedPrice target={opt.monthly} inView={inView} delay={0.8 + i * 0.15} />
                  </p>
                  <p className="text-[7px] text-white/30">per month</p>
                </motion.div>

                {/* Detail rows with stagger */}
                <div className="space-y-1">
                  {opt.rows.map(([label, value], ri) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 1.0 + i * 0.12 + ri * 0.05 }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[7px] text-white/35">{label}</span>
                      <span className="text-[7px] font-medium text-white/70 tabular-nums">{value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
