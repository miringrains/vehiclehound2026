"use client";

import { usePathname } from "next/navigation";
import { useDealership } from "@/hooks/use-dealership";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICON_STROKE_WIDTH, GRACE_PERIOD_DAYS } from "@/lib/constants";
import Link from "next/link";

const ALWAYS_ALLOWED = ["/billing", "/settings"];

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { data: dealership, isLoading } = useDealership();
  const pathname = usePathname();

  if (isLoading || !dealership) return <>{children}</>;
  if (dealership.is_free_account) return <>{children}</>;

  const isAllowedPath = ALWAYS_ALLOWED.some((p) => pathname.startsWith(p));
  if (isAllowedPath) return <>{children}</>;

  const status = dealership.subscription_status;

  if (status === "active" || status === "trialing") {
    if (status === "trialing" && dealership.trial_ends_at) {
      const trialEnd = new Date(dealership.trial_ends_at);
      const graceEnd = new Date(trialEnd.getTime() + GRACE_PERIOD_DAYS * 86_400_000);
      if (new Date() > graceEnd) {
        return <BlockedOverlay reason="trial_expired" />;
      }
    }
    return <>{children}</>;
  }

  if (status === "past_due") return <>{children}</>;

  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    return <BlockedOverlay reason="canceled" />;
  }

  if (!status) {
    if (dealership.trial_ends_at) {
      const trialEnd = new Date(dealership.trial_ends_at);
      const graceEnd = new Date(trialEnd.getTime() + GRACE_PERIOD_DAYS * 86_400_000);
      if (new Date() > graceEnd) {
        return <BlockedOverlay reason="trial_expired" />;
      }
    }
    return <>{children}</>;
  }

  return <>{children}</>;
}

function BlockedOverlay({ reason }: { reason: "trial_expired" | "canceled" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="mb-4 rounded-xl bg-destructive/10 p-4">
        <AlertTriangle size={28} strokeWidth={ICON_STROKE_WIDTH} className="text-destructive" />
      </div>
      <h2 className="text-heading-3 mb-2">
        {reason === "trial_expired" ? "Your trial has expired" : "Subscription inactive"}
      </h2>
      <p className="text-body-sm text-muted-foreground max-w-md mb-6">
        {reason === "trial_expired"
          ? "Your free trial period has ended. Subscribe to a plan to continue using Vehicle Hound."
          : "Your subscription is no longer active. Please resubscribe to regain access."}
      </p>
      <Button asChild>
        <Link href="/billing">View Plans</Link>
      </Button>
    </div>
  );
}
