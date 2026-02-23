"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ExternalLink, Loader2, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { plans, formatPrice, type PlanSlug } from "@/config/plans";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { toast } from "sonner";
import { Aurora } from "@/components/ui/aurora";
import type { BillingInterval } from "@/config/stripe-prices";

type Props = {
  currentPlan: PlanSlug;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  isFreeAccount: boolean;
  hasStripeCustomer: boolean;
  isOwner: boolean;
};

const TIER_AURORA: Record<PlanSlug, [string, string, string]> = {
  starter: ["#6D28D9", "#7C3AED", "#8B5CF6"],
  professional: ["#3A29FF", "#5850EC", "#7C3AED"],
  enterprise: ["#1E1B4B", "#3730A3", "#4F46E5"],
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

export function BillingContent({
  currentPlan,
  subscriptionStatus,
  trialEndsAt,
  isFreeAccount,
  hasStripeCustomer,
  isOwner,
}: Props) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const isTrialing = subscriptionStatus === "trialing";
  const isActive = subscriptionStatus === "active";
  const isPastDue = subscriptionStatus === "past_due";
  const isCanceled = subscriptionStatus === "canceled";
  const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null;
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000)) : 0;
  const trialExpired = trialEnd ? trialEnd < new Date() : false;

  async function handleCheckout(planSlug: PlanSlug) {
    if (!isOwner) {
      toast.error("Only the dealership owner can manage billing");
      return;
    }
    setLoadingPlan(planSlug);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug, interval }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to start checkout");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handlePortal() {
    if (!isOwner) {
      toast.error("Only the dealership owner can manage billing");
      return;
    }
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to open billing portal");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingPortal(false);
    }
  }

  if (isFreeAccount) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield size={20} className="text-primary" strokeWidth={ICON_STROKE_WIDTH} />
          </div>
          <div>
            <p className="text-heading-4">Free Account</p>
            <p className="text-body-sm text-muted-foreground">
              This account has full platform access at no charge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status banners */}
      {isTrialing && (
        <div className={`rounded-xl border p-4 ${
          trialExpired ? "border-red-500/20 bg-red-500/5" : "border-primary/20 bg-primary/5"
        }`}>
          <p className="text-body-sm font-medium">
            {trialExpired
              ? "Your trial has expired. Choose a plan to continue using Vehicle Hound."
              : `You're on a free trial with full access. ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining.`}
          </p>
        </div>
      )}

      {isPastDue && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-body-sm font-medium text-red-400">
            Your payment has failed. Please update your payment method to avoid service interruption.
          </p>
        </div>
      )}

      {isCanceled && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-body-sm font-medium text-yellow-500">
            Your subscription has been canceled. Choose a plan to reactivate.
          </p>
        </div>
      )}

      {/* Manage subscription button for active subscribers */}
      {(isActive || isPastDue) && hasStripeCustomer && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
          <div>
            <p className="text-heading-4 capitalize">{currentPlan} Plan</p>
            <p className="text-caption text-muted-foreground mt-0.5">
              {isActive ? "Active subscription" : "Payment issue — update payment method"}
            </p>
          </div>
          <Button onClick={handlePortal} disabled={loadingPortal} variant="outline" className="gap-2">
            {loadingPortal ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} strokeWidth={ICON_STROKE_WIDTH} />}
            Manage Subscription
          </Button>
        </div>
      )}

      {/* Interval toggle */}
      {(!isActive || isCanceled) && (
        <>
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setInterval("monthly")}
                className={`px-5 py-2 text-body-sm font-medium rounded-md transition-all ${
                  interval === "monthly"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval("yearly")}
                className={`px-5 py-2 text-body-sm font-medium rounded-md transition-all ${
                  interval === "yearly"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <span className="ml-1.5 text-[10px] font-semibold text-primary">Save ~20%</span>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan, idx) => {
              const isCurrent = plan.slug === currentPlan && isActive;
              const price = interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
              const perMonth = interval === "yearly" ? Math.round(price / 12) : price;
              const isLoading = loadingPlan === plan.slug;
              const isPopular = idx === 1;

              return (
                <PricingCard
                  key={plan.slug}
                  name={plan.name}
                  slug={plan.slug}
                  description={plan.description}
                  perMonth={perMonth}
                  totalPrice={interval === "yearly" ? price : undefined}
                  interval={interval}
                  maxVehicles={plan.maxVehicles}
                  maxUsers={plan.maxUsers}
                  features={plan.features}
                  isCurrent={isCurrent}
                  isPopular={isPopular}
                  isLoading={isLoading}
                  anyLoading={!!loadingPlan}
                  isOwner={isOwner}
                  isTrialing={isTrialing}
                  isCanceled={isCanceled}
                  subscriptionStatus={subscriptionStatus}
                  onCheckout={handleCheckout}
                  colorStops={TIER_AURORA[plan.slug]}
                />
              );
            })}
          </div>
        </>
      )}

      {!isOwner && (
        <p className="text-caption text-muted-foreground text-center">
          Only the dealership owner can manage billing.
        </p>
      )}
    </div>
  );
}

type PricingCardProps = {
  name: string;
  slug: PlanSlug;
  description: string;
  perMonth: number;
  totalPrice?: number;
  interval: BillingInterval;
  maxVehicles: number;
  maxUsers: number;
  features: string[];
  isCurrent: boolean;
  isPopular: boolean;
  isLoading: boolean;
  anyLoading: boolean;
  isOwner: boolean;
  isTrialing: boolean;
  isCanceled: boolean;
  subscriptionStatus: string | null;
  onCheckout: (slug: PlanSlug) => void;
  colorStops: [string, string, string];
};

function PricingCard({
  name,
  slug,
  description,
  perMonth,
  totalPrice,
  interval,
  maxVehicles,
  maxUsers,
  features,
  isCurrent,
  isPopular,
  isLoading,
  anyLoading,
  isOwner,
  isTrialing,
  isCanceled,
  subscriptionStatus,
  onCheckout,
  colorStops,
}: PricingCardProps) {
  const auroraRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-shadow hover:shadow-lg ${
        isCurrent
          ? "border-primary ring-1 ring-primary/20"
          : isPopular
            ? "border-primary/40"
            : "border-border"
      }`}
    >
      {/* Header section */}
      <div className="p-6 pb-0 space-y-4 flex-1">
        {/* Name + badge row */}
        <div className="flex items-center justify-between">
          <h3 className="text-heading-3">{name}</h3>
          {isPopular && !isCurrent && (
            <span className="text-[10px] font-semibold tracking-wide uppercase bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
              Popular
            </span>
          )}
          {isCurrent && (
            <span className="text-[10px] font-semibold tracking-wide uppercase bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
              Current
            </span>
          )}
        </div>

        <p className="text-caption text-muted-foreground leading-relaxed">{description}</p>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Price */}
        <div className="pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[2.25rem] font-bold tracking-tight leading-none">{formatPrice(perMonth)}</span>
            <span className="text-body-sm text-muted-foreground">/ month</span>
          </div>
          {interval === "yearly" && totalPrice && (
            <p className="text-[11px] text-muted-foreground mt-1">
              {formatPrice(totalPrice)}/yr billed annually
            </p>
          )}
        </div>

        {/* Capacity */}
        <p className="text-caption text-muted-foreground">
          {maxVehicles === -1 ? "Unlimited" : maxVehicles} vehicles &middot; {maxUsers} users
        </p>

        {/* Features */}
        <ul className="space-y-2 pb-6">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-caption">
              <Check size={14} strokeWidth={2.5} className="text-primary shrink-0 mt-0.5" />
              <span>{PLAN_FEATURES_LABELS[f] || f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Aurora footer + CTA */}
      <div className="relative h-[72px] mt-auto overflow-hidden">
        {/* Aurora background */}
        <div ref={auroraRef} className="absolute inset-0 opacity-80">
          {mounted && (
            <Aurora
              colorStops={colorStops}
              speed={0.3}
              amplitude={1.0}
              blend={0.7}
            />
          )}
        </div>

        {/* CTA button */}
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          {isCurrent ? (
            <span className="text-body-sm font-medium text-white/80">Current Plan</span>
          ) : (
            <button
              onClick={() => onCheckout(slug)}
              disabled={anyLoading || !isOwner}
              className="flex items-center gap-2 text-body-sm font-semibold text-white transition-all hover:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              {isTrialing || isCanceled || !subscriptionStatus
                ? "Subscribe this plan"
                : "Upgrade"}
              {!isLoading && <ArrowRight size={16} strokeWidth={ICON_STROKE_WIDTH} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
