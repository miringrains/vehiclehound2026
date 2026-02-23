import type { PlanSlug } from "./plans";

type PriceIds = {
  monthly: string;
  yearly: string;
};

export const PLAN_PRICE_IDS: Record<PlanSlug, PriceIds> = {
  starter: {
    monthly: "price_1RY6syALSnWaUcqdzrOLMVw4",
    yearly: "price_1RY6syALSnWaUcqdozmgnmHJ",
  },
  professional: {
    monthly: "price_1RY6uPALSnWaUcqdKElpMNfC",
    yearly: "price_1RY6uPALSnWaUcqdJfzBCS2f",
  },
  enterprise: {
    monthly: "price_1RY6w3ALSnWaUcqdn3o0ndKn",
    yearly: "price_1RY6w3ALSnWaUcqdAmS92yOC",
  },
};

export const WEBSITE_SETUP_PRICE_ID = "price_1RY728ALSnWaUcqdd51rmFA2";

const PRICE_TO_PLAN: Record<string, PlanSlug> = {};
for (const [slug, ids] of Object.entries(PLAN_PRICE_IDS)) {
  PRICE_TO_PLAN[ids.monthly] = slug as PlanSlug;
  PRICE_TO_PLAN[ids.yearly] = slug as PlanSlug;
}

export function planSlugFromPriceId(priceId: string): PlanSlug | null {
  return PRICE_TO_PLAN[priceId] ?? null;
}

export type BillingInterval = "monthly" | "yearly";

export function getPriceId(plan: PlanSlug, interval: BillingInterval): string {
  return PLAN_PRICE_IDS[plan][interval];
}

// TRIAL_DAYS and GRACE_PERIOD_DAYS are defined in @/lib/constants
