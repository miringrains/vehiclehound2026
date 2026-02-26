"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const vehicles = [
  { year: 2025, make: "BMW", model: "330i", price: "$429/mo", img: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", color: "Alpine White" },
  { year: 2025, make: "Mercedes", model: "C300", price: "$348/mo", img: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", color: "Obsidian Black" },
  { year: 2026, make: "BMW", model: "X5 sDrive40i", price: "$829/mo", img: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)", color: "Phytonic Blue" },
];

const codeSnippet = `<script src="https://portal.vehiclehound.com
  /widgets/inventory-widget.js">
</script>
<div id="vh-inventory"
  data-dealer-id="your-id">
</div>`;

function TypingCode() {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCharCount((c) => {
        if (c >= codeSnippet.length) {
          clearInterval(timer);
          return c;
        }
        return c + 1;
      });
    }, 25);
    return () => clearInterval(timer);
  }, []);

  return (
    <pre className="text-[9px] leading-relaxed text-emerald-400 font-mono whitespace-pre-wrap">
      {codeSnippet.slice(0, charCount)}
      <span className="animate-pulse text-white">|</span>
    </pre>
  );
}

export function WidgetDemo() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % vehicles.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-b-lg overflow-hidden bg-white">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Code side */}
        <div className="bg-[#0a0a0c] p-4 md:p-5 flex flex-col justify-center border-r border-white/[0.06]">
          <p className="mb-1 text-[9px] font-medium text-violet-400 uppercase tracking-widest">Embed Code</p>
          <p className="mb-3 text-[10px] text-white/50">Two lines. Paste into any site.</p>
          <div className="rounded-lg border border-white/[0.08] bg-[#111113] p-3">
            <TypingCode />
          </div>
        </div>

        {/* Result — fake dealer website with widget */}
        <div className="bg-[#f8f8f8] p-4 md:p-5 flex flex-col">
          <p className="mb-1 text-[9px] font-medium text-violet-600 uppercase tracking-widest">Result on dealer site</p>
          <p className="mb-3 text-[10px] text-[oklch(0.44_0.02_280)]">Widget adapts to any website.</p>
          <div className="flex-1 rounded-lg border border-[oklch(0.91_0.005_280)] bg-white p-3 overflow-hidden">
            {/* Fake site header */}
            <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="h-3 w-16 rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-2 w-8 rounded bg-gray-100" />
                <div className="h-2 w-8 rounded bg-gray-100" />
                <div className="h-2 w-8 rounded bg-gray-100" />
              </div>
            </div>
            {/* Inventory cards */}
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {vehicles.map((v, i) => (
                  <motion.div
                    key={`${v.model}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: i === active ? 1 : 0.6, y: 0, scale: i === active ? 1 : 0.98 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2 rounded-md border border-gray-100 p-1.5"
                  >
                    <div
                      className="h-8 w-12 shrink-0 rounded"
                      style={{ background: v.img }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-semibold text-gray-900 truncate">
                        {v.year} {v.make} {v.model}
                      </p>
                      <p className="text-[7px] text-gray-400">{v.color}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-semibold text-gray-900">{v.price}</p>
                      <p className="text-[7px] text-violet-500">Lease</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
