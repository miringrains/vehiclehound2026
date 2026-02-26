"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BrowserFrame } from "./BrowserFrame";

const CODE_LINES = [
  '<div id="vh-inventory"></div>',
  "<script",
  '  src="https://vehiclehound.com/widgets/inventory-widget.js"',
  '  data-api-key="vhk_live_abc123..."',
  "></script>",
];

const fakeCards = [
  { name: "2025 BMW 330i", price: "$429/mo", color: "bg-blue-900/30" },
  { name: "2026 Audi Q5", price: "$609/mo", color: "bg-emerald-900/30" },
  { name: "2025 Mercedes C300", price: "$348/mo", color: "bg-violet-900/30" },
];

function TypingCode({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < CODE_LINES.length) {
        setLines((prev) => [...prev, CODE_LINES[i]]);
        i++;
      } else {
        clearInterval(timer);
        onDone();
      }
    }, 300);
    return () => clearInterval(timer);
  }, [inView, onDone]);

  return (
    <div
      ref={ref}
      className="rounded-lg border border-border/40 bg-[#0d0d12] p-4 font-mono text-[11px] leading-relaxed"
    >
      <div className="mb-2 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-red-500/50" />
        <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
        <span className="h-2 w-2 rounded-full bg-green-500/50" />
      </div>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-violet-300"
        >
          <span className="mr-3 select-none text-muted-foreground/40">
            {String(i + 1).padStart(2, " ")}
          </span>
          {line}
        </motion.div>
      ))}
      {lines.length > 0 && lines.length < CODE_LINES.length && (
        <span className="inline-block h-3.5 w-1.5 animate-pulse bg-violet-400" />
      )}
    </div>
  );
}

export function WidgetDemo() {
  const [showCards, setShowCards] = useState(false);

  return (
    <div className="space-y-6">
      <TypingCode onDone={() => setShowCards(true)} />

      <BrowserFrame url="www.yourdealer.com/inventory">
        <div className="bg-background/80 p-4">
          <div className="mb-3 h-3 w-32 rounded bg-muted/40" />
          <div className="grid grid-cols-3 gap-3">
            {fakeCards.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                animate={showCards ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden rounded-lg border border-border/30"
              >
                <div className={`h-14 ${c.color}`} />
                <div className="space-y-1 p-2">
                  <div className="text-[10px] font-medium text-foreground">{c.name}</div>
                  <div className="text-[10px] text-violet-400">{c.price}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrowserFrame>
    </div>
  );
}
