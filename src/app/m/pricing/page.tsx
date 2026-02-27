import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { PricingCards } from "../_components/PricingCards";
import { FinalCTA } from "../_components/FinalCTA";
import { ScrollReveal } from "../_components/ScrollReveal";
import { FAQ } from "./FAQ";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "No hidden setup fees, no bloated features. 14-day free trial, cancel anytime.",
};

type Row = {
  feature: string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
};

const comparison: Row[] = [
  { feature: "Vehicles", starter: "Up to 50", professional: "Up to 200", enterprise: "Unlimited" },
  { feature: "Team Members", starter: "2", professional: "5", enterprise: "20" },
  { feature: "Inventory Management", starter: true, professional: true, enterprise: true },
  { feature: "Embeddable Widgets", starter: true, professional: true, enterprise: true },
  { feature: "Branded Storefront", starter: true, professional: true, enterprise: true },
  { feature: "Credit Applications", starter: true, professional: true, enterprise: true },
  { feature: "CSV Bulk Import", starter: true, professional: true, enterprise: true },
  { feature: "Customer CRM", starter: false, professional: true, enterprise: true },
  { feature: "Deal Sheet Builder", starter: false, professional: true, enterprise: true },
  { feature: "Email Notifications", starter: false, professional: true, enterprise: true },
  { feature: "Analytics Dashboard", starter: false, professional: true, enterprise: true },
  { feature: "API Access", starter: false, professional: false, enterprise: true },
  { feature: "Priority Support", starter: false, professional: false, enterprise: true },
  { feature: "Dedicated Onboarding", starter: false, professional: false, enterprise: true },
  { feature: "Custom Integrations", starter: false, professional: false, enterprise: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm text-foreground">{value}</span>;
  }
  return value ? (
    <Check className="mx-auto h-4 w-4 text-violet-400" />
  ) : (
    <Minus className="mx-auto h-4 w-4 text-muted-foreground/30" />
  );
}

export default function PricingPage() {
  return (
    <>
      <section className="px-6 pt-32 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h1 className="text-4xl font-medium tracking-[-0.025em] text-foreground sm:text-[2.75rem]">
              Pricing that actually makes sense.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-lg text-muted-foreground">
              No hidden setup fees, no required onboarding calls, and no paying
              for bloated features you&apos;ll never use. 14-day free trial. Cancel anytime.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 pb-24">
        <PricingCards expanded />
      </section>

      {/* Feature Comparison */}
      <section className="border-t border-border/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-center text-2xl font-medium tracking-[-0.025em] text-foreground sm:text-3xl">
              Compare plans
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="py-3 text-left text-sm font-medium text-muted-foreground">
                      Feature
                    </th>
                    <th className="py-3 text-center text-sm font-medium text-muted-foreground">
                      Starter
                    </th>
                    <th className="py-3 text-center text-sm font-medium text-violet-400">
                      Professional
                    </th>
                    <th className="py-3 text-center text-sm font-medium text-muted-foreground">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.feature} className="border-b border-border/20">
                      <td className="py-3 text-sm text-foreground">{row.feature}</td>
                      <td className="py-3 text-center">
                        <Cell value={row.starter} />
                      </td>
                      <td className="py-3 text-center">
                        <Cell value={row.professional} />
                      </td>
                      <td className="py-3 text-center">
                        <Cell value={row.enterprise} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/30 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <h2 className="text-center text-2xl font-medium tracking-[-0.025em] text-foreground sm:text-3xl">
              Frequently asked questions
            </h2>
          </ScrollReveal>
          <div className="mt-10">
            <FAQ />
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
