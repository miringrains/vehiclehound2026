"use client";

import { Lock } from "lucide-react";
import { useDealership } from "@/hooks/use-dealership";
import { isFeatureAvailable, type FeatureName } from "@/config/features";
import type { PlanSlug } from "@/config/plans";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

type Props = {
  feature: FeatureName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function FeatureGate({ feature, children, fallback }: Props) {
  const { data: dealership, isLoading } = useDealership();

  if (isLoading) return <>{children}</>;

  if (!dealership) return <>{children}</>;

  if (dealership.is_free_account) return <>{children}</>;
  if (dealership.subscription_status === "trialing") return <>{children}</>;

  const plan = (dealership.plan || "starter") as PlanSlug;
  if (isFeatureAvailable(feature, plan)) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-card">
      <div className="mb-3 rounded-lg bg-muted p-3">
        <Lock size={20} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
      </div>
      <p className="text-body-sm font-medium mb-1">Feature not available</p>
      <p className="text-caption text-muted-foreground max-w-xs">
        Upgrade your plan to access this feature.
      </p>
    </div>
  );
}
