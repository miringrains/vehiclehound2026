"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { BrowserFrame } from "./BrowserFrame";
import { DashboardDemo } from "./DashboardDemo";

const Aurora = dynamic(
  () => import("@/components/ui/aurora").then((m) => m.Aurora),
  { ssr: false }
);

const PORTAL = "https://portal.vehiclehound.com";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.02, delayChildren: 0.15 } },
};

const wordUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function AnimatedHeadline() {
  const line1Words = "The Modern Way To Manage".split(" ");

  return (
    <h1 className="text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] text-foreground sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem]">
      {/* Line 1 — word-by-word stagger */}
      <motion.span
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="block"
      >
        {line1Words.map((word, i) => (
          <motion.span key={i} variants={wordUp} className="inline-block">
            {word}&nbsp;
          </motion.span>
        ))}
      </motion.span>

      {/* Line 2 — single block fade-in with gradient */}
      <motion.span
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="block bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent"
      >
        Auto Sales, Leasing, And Leads.
      </motion.span>
    </h1>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const demoY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const demoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.93]);
  const demoRotate = useTransform(scrollYProgress, [0, 0.4], [3, 0]);
  const demoOpacity = useTransform(scrollYProgress, [0.55, 0.9], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[105vh] flex-col items-center overflow-hidden px-6 pt-36 pb-0 md:pt-40"
    >
      {/* Aurora backdrop */}
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

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[11px] font-medium text-violet-300/80">
            14-day free trial — no credit card required
          </span>
        </motion.div>

        {/* Headline */}
        <AnimatedHeadline />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base md:text-lg"
        >
          Running a dealership or brokerage is chaotic enough — your software
          shouldn&apos;t make it worse. VehicleHound puts your lease specials,
          retail inventory, CRM, and credit applications into one beautifully
          organized platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a
            href={`${PORTAL}/signup`}
            className="inline-flex h-11 items-center rounded-xl bg-violet-600 px-7 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-500 hover:shadow-violet-500/25"
          >
            Start 14-Day Free Trial
          </a>
          <a
            href="/pricing"
            className="inline-flex h-11 items-center rounded-xl border border-border/50 bg-card/30 px-7 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-violet-500/30 hover:text-foreground"
          >
            See Pricing
          </a>
        </motion.div>
      </div>

      {/* Wide dashboard demo — cut off at bottom, scroll-driven */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          y: demoY,
          scale: demoScale,
          opacity: demoOpacity,
        }}
        className="relative z-10 mt-14 w-[108vw] max-w-[1360px]"
      >
        <div style={{ perspective: "1200px" }}>
          <motion.div style={{ rotateX: demoRotate }}>
            <BrowserFrame url="portal.vehiclehound.com/dashboard">
              <DashboardDemo />
            </BrowserFrame>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
      </motion.div>
    </section>
  );
}
