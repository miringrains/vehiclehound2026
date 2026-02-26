"use client";

import { ScrollReveal } from "./ScrollReveal";
import type { LucideIcon } from "lucide-react";

type Highlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type FeatureShowcaseProps = {
  id?: string;
  badge: string;
  title: React.ReactNode;
  description: string;
  highlights: Highlight[];
  demo: React.ReactNode;
  reversed?: boolean;
};

export function FeatureShowcase({
  id,
  badge,
  title,
  description,
  highlights,
  demo,
  reversed = false,
}: FeatureShowcaseProps) {
  return (
    <section id={id} className="relative px-6 py-24 md:py-32 lg:py-40">
      <div
        className={`mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row lg:gap-20 ${
          reversed ? "lg:flex-row-reverse" : ""
        }`}
      >
        <div className="flex-1 space-y-6 lg:max-w-lg">
          <ScrollReveal>
            <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
              {badge}
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </ScrollReveal>

          <div className="space-y-4 pt-4">
            {highlights.map((h, i) => (
              <ScrollReveal key={h.title} delay={0.2 + i * 0.08}>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <h.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {h.title}
                    </h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {h.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal
          className="w-full flex-1"
          delay={0.2}
          direction={reversed ? "left" : "right"}
        >
          {demo}
        </ScrollReveal>
      </div>
    </section>
  );
}
