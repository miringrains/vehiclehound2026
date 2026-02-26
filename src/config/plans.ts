export type PlanSlug = "starter" | "professional" | "enterprise";

export const PLAN_ORDER: PlanSlug[] = ["starter", "professional", "enterprise"];

export type PlanDefinition = {
  name: string;
  slug: PlanSlug;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxVehicles: number;
  maxUsers: number;
  features: string[];
  highlights: string[];
};

export const plans: PlanDefinition[] = [
  {
    name: "Starter",
    slug: "starter",
    description: "Everything you need to get your inventory online.",
    monthlyPrice: 14900,
    yearlyPrice: 142800,
    maxVehicles: 50,
    maxUsers: 2,
    features: [
      "inventory_management",
      "storefront",
      "credit_applications",
      "csv_import",
    ],
    highlights: [
      "Up to 50 vehicles & 2 team members",
      "Dual inventory management (Lease & Retail)",
      "Embeddable website widgets",
      "Secure credit applications",
      "Branded storefront",
      "CSV bulk import",
    ],
  },
  {
    name: "Professional",
    slug: "professional",
    description: "For operations ready to streamline their sales process.",
    monthlyPrice: 34900,
    yearlyPrice: 335000,
    maxVehicles: 200,
    maxUsers: 5,
    features: [
      "inventory_management",
      "storefront",
      "credit_applications",
      "csv_import",
      "crm",
      "deal_sheets",
      "analytics",
      "email_notifications",
    ],
    highlights: [
      "Up to 200 vehicles & 5 team members",
      "Everything in Starter, plus:",
      "Full Customer CRM",
      "Deal sheet builder & PDF export",
      "Analytics dashboard",
      "Email notifications",
    ],
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description: "Unlimited capacity for high-volume brokers and lots.",
    monthlyPrice: 64900,
    yearlyPrice: 623000,
    maxVehicles: -1,
    maxUsers: 20,
    features: [
      "inventory_management",
      "storefront",
      "credit_applications",
      "csv_import",
      "crm",
      "deal_sheets",
      "analytics",
      "email_notifications",
      "api_access",
      "priority_support",
    ],
    highlights: [
      "Unlimited vehicles & up to 20 team members",
      "Everything in Professional, plus:",
      "API access & custom integrations",
      "Priority support",
      "Dedicated onboarding",
    ],
  },
];

export function getPlan(slug: PlanSlug): PlanDefinition | undefined {
  return plans.find((p) => p.slug === slug);
}

export function planIndex(slug: PlanSlug): number {
  return PLAN_ORDER.indexOf(slug);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
