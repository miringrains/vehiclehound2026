"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";
import { GradientText } from "./GradientText";
import { BrowserFrame } from "./BrowserFrame";
import { DashboardDemo } from "./DashboardDemo";

const Aurora = dynamic(
  () => import("@/components/ui/aurora").then((m) => m.Aurora),
  { ssr: false }
);

const PORTAL = "https://portal.vehiclehound.com";

export function Hero() {
  return (
    <section className="relative flex min-h-[100vh] flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20">
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

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
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
          text="Sell more cars."
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          as="h1"
        />
        <div className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <GradientText from="#A78BFA" to="#7C3AED">
            Manage less stuff.
          </GradientText>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          The all-in-one platform for independent dealerships. Manage inventory,
          collect credit applications, and put your vehicles on any website — in minutes.
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
            Start Free Trial
          </a>
          <a
            href="/pricing"
            className="inline-flex h-12 items-center rounded-xl border border-border/60 bg-card/40 px-8 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-violet-500/40 hover:text-foreground"
          >
            See Pricing
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 w-full max-w-4xl"
          style={{ perspective: "1200px" }}
        >
          <div style={{ transform: "rotateX(2deg)" }}>
            <BrowserFrame url="portal.vehiclehound.com/dashboard">
              <DashboardDemo />
            </BrowserFrame>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
