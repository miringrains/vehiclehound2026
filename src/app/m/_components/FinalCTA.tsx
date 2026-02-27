"use client";

import dynamic from "next/dynamic";
import { ScrollReveal } from "./ScrollReveal";

const Aurora = dynamic(
  () => import("@/components/ui/aurora").then((m) => m.Aurora),
  { ssr: false }
);

const PORTAL = "https://portal.vehiclehound.com";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background" />
        <Aurora
          colorStops={["#3A29FF", "#7C3AED", "#4F46E5"]}
          speed={0.4}
          amplitude={1.0}
          blend={0.6}
          className="absolute inset-0 opacity-30"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-[530] tracking-[-0.05em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            Ready To Drop The Outdated Software?
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mt-4 text-lg text-muted-foreground">
            Get your inventory perfectly organized, look incredible to your
            buyers, and keep every lead in one place. Start your free trial
            today. Setup takes minutes, not months.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={`${PORTAL}/signup`}
              className="inline-flex h-12 items-center rounded-xl bg-violet-600 px-8 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/30"
            >
              Start Free Trial
            </a>
            <a
              href="/pricing"
              className="inline-flex h-12 items-center rounded-xl border border-border/60 bg-card/40 px-8 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-violet-500/40 hover:text-foreground"
            >
              See Pricing
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
