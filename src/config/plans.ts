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
    description: "Everything you need to list and manage your inventory online.",
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
      "Up to 50 vehicles",
      "2 team members",
      "Inventory management",
      "Embeddable website widget",
      "Online credit applications",
      "CSV bulk import",
    ],
  },
  {
    name: "Professional",
    slug: "professional",
    description: "CRM, deal sheets, and analytics for dealerships ready to scale.",
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
      "Up to 200 vehicles",
      "5 team members",
      "Everything in Starter, plus:",
      "Customer CRM & notes",
      "Deal sheet builder & PDF export",
      "Email deal sheets to customers",
      "Analytics dashboard",
      "Email notifications",
    ],
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description: "Unlimited capacity with priority support for high-volume operations.",
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
      "Unlimited vehicles",
      "Up to 20 team members",
      "Everything in Professional, plus:",
      "API access",
      "Priority support",
      "Dedicated onboarding",
      "Custom integrations",
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
