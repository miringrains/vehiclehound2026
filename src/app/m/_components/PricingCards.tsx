"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { plans, formatPrice } from "@/config/plans";
import { ScrollReveal } from "./ScrollReveal";

const PORTAL = "https://portal.vehiclehound.com";

type PricingCardsProps = {
  expanded?: boolean;
};

export function PricingCards({ expanded = false }: PricingCardsProps) {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="space-y-10">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}
        >
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            annual ? "bg-violet-600" : "bg-border"
          }`}
          aria-label="Toggle billing period"
        >
          <motion.div
            layout
            className="absolute top-0.5 h-6 w-6 rounded-full bg-white"
            style={{ left: annual ? "calc(100% - 1.625rem)" : "0.125rem" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span
          className={`text-sm transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}
        >
          Annual
        </span>
        {annual && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
          >
            Save ~20%
          </motion.span>
        )}
      </div>

      {/* Cards */}
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const popular = plan.slug === "professional";
          const price = annual ? plan.yearlyPrice / 12 : plan.monthlyPrice;

          return (
            <ScrollReveal key={plan.slug} delay={i * 0.1}>
              <div
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  popular
                    ? "border-violet-500/50 bg-violet-500/5 shadow-lg shadow-violet-500/10"
                    : "border-border/40 bg-card/40"
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-semibold text-white">
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mt-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={annual ? "annual" : "monthly"}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-4xl font-bold tracking-tight text-foreground">
                        {formatPrice(Math.round(price))}
                      </span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </motion.div>
                  </AnimatePresence>
                  {annual && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatPrice(plan.yearlyPrice)} billed annually
                    </p>
                  )}
                </div>

                <a
                  href={`${PORTAL}/signup`}
                  className={`mt-6 flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    popular
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : "border border-border/60 bg-card/60 text-foreground hover:border-violet-500/40"
                  }`}
                >
                  Start Free Trial
                </a>

                <ul className="mt-6 space-y-3 border-t border-border/30 pt-6">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                      <span className="text-sm text-muted-foreground">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {expanded && (
        <p className="text-center text-sm text-muted-foreground">
          All plans include a 14-day free trial. No credit card required.
        </p>
      )}
    </div>
  );
}
