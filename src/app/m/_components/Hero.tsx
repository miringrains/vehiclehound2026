"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplitText } from "./SplitText";
import { BrowserFrame } from "./BrowserFrame";
import { DashboardDemo } from "./DashboardDemo";

const Aurora = dynamic(
  () => import("@/components/ui/aurora").then((m) => m.Aurora),
  { ssr: false }
);

const PORTAL = "https://portal.vehiclehound.com";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const demoY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const demoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);
  const demoRotate = useTransform(scrollYProgress, [0, 0.4], [2, 0]);
  const demoOpacity = useTransform(scrollYProgress, [0.6, 1], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[110vh] flex-col items-center overflow-hidden px-6 pt-32 pb-0"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background" />
        <Aurora
          colorStops={["#3A29FF", "#7C3AED", "#4F46E5"]}
          speed={0.5}
          amplitude={1.4}
          blend={0.7}
          className="absolute inset-0 opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-medium text-violet-300">
            14-day free trial — no credit card required
          </span>
        </motion.div>

        <SplitText
          text="The modern way to manage"
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          as="h1"
        />
        <SplitText
          text="auto sales, leasing, and leads."
          className="mt-1 text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-300 to-violet-500 bg-clip-text text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
          as="span"
          delay={0.3}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Running a dealership or brokerage is chaotic enough — your software
          shouldn&apos;t make it worse. VehicleHound puts your lease specials,
          retail inventory, CRM, and credit applications into one beautifully
          organized platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a
            href={`${PORTAL}/signup`}
            className="inline-flex h-12 items-center rounded-xl bg-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/30"
          >
            Start 14-Day Free Trial
          </a>
          <a
            href="/pricing"
            className="inline-flex h-12 items-center rounded-xl border border-border/60 bg-card/40 px-8 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-violet-500/40 hover:text-foreground"
          >
            See Pricing
          </a>
        </motion.div>
      </div>

      {/* Wide, cut-off dashboard demo with scroll-driven animation */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          y: demoY,
          scale: demoScale,
          opacity: demoOpacity,
          perspective: "1200px",
        }}
        className="relative z-10 mt-16 w-[110vw] max-w-[1400px] px-4 sm:w-[105vw]"
      >
        <motion.div style={{ rotateX: demoRotate }}>
          <BrowserFrame url="portal.vehiclehound.com/dashboard">
            <DashboardDemo />
          </BrowserFrame>
          {/* Gradient fade at bottom to sell the "cut off" effect */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
