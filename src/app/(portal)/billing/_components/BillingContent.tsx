"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { plans, formatPrice, type PlanSlug } from "@/config/plans";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  currentPlan: PlanSlug;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
};

const PLAN_FEATURES_LABELS: Record<string, string> = {
  inventory_management: "Inventory Management",
  storefront: "Storefront & Widgets",
  credit_applications: "Credit Applications",
  csv_import: "CSV Import",
  ai_descriptions: "AI Descriptions",
  ai_pricing: "AI Pricing",
  reports_standard: "Analytics & Reports",
  reports_ai: "AI Reports",
  webflow_integration: "Webflow Integration",
  widgets: "Embeddable Widgets",
  api_access: "API Access",
  vauto_import: "vAuto Import",
  gwg_import: "GWG Import",
  homenet_feed: "HomeNet Feed",
  priority_support: "Priority Support",
  ai_chat: "AI Chat",
};

export function BillingContent({ currentPlan, subscriptionStatus, trialEndsAt }: Props) {
  const isTrialing = subscriptionStatus === "trialing";
  const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null;
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000)) : 0;
  const trialExpired = trialEnd ? trialEnd < new Date() : false;

  return (
    <div className="space-y-8">
      {isTrialing && (
        <div className={`rounded-xl border p-4 ${
          trialExpired ? "border-red-500/20 bg-red-500/5" : "border-primary/20 bg-primary/5"
        }`}>
          <p className="text-body-sm font-medium">
            {trialExpired
              ? "Your trial has expired. Choose a plan to continue."
              : `You're on a free trial with full access. ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.slug === currentPlan && !isTrialing;
          return (
            <div key={plan.slug} className={`rounded-xl border bg-card p-5 space-y-4 relative ${
              isCurrent ? "border-primary ring-1 ring-primary/20" : "border-border"
            }`}>
              {isCurrent && (
                <span className="absolute -top-2.5 left-4 text-[10px] font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Current Plan
                </span>
              )}
              <div>
                <h3 className="text-heading-3">{plan.name}</h3>
                <p className="text-caption text-muted-foreground mt-1">{plan.description}</p>
              </div>
              <div>
                <span className="text-heading-1">{formatPrice(plan.monthlyPrice)}</span>
                <span className="text-caption text-muted-foreground">/mo</span>
              </div>
              <div className="text-caption text-muted-foreground">
                {plan.maxVehicles === -1 ? "Unlimited" : plan.maxVehicles} vehicles, {plan.maxUsers} users
              </div>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-caption">
                    <Check size={12} strokeWidth={ICON_STROKE_WIDTH} className="text-primary shrink-0" />
                    {PLAN_FEATURES_LABELS[f] || f}
                  </li>
                ))}
              </ul>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button className="w-full" variant={isCurrent ? "outline" : "default"} disabled>
                        {isCurrent ? "Current Plan" : "Upgrade"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
