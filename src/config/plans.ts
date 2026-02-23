export type PlanSlug = "starter" | "professional" | "enterprise";

export type PlanDefinition = {
  name: string;
  slug: PlanSlug;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxVehicles: number;
  maxUsers: number;
  features: string[];
};

export const plans: PlanDefinition[] = [
  {
    name: "Starter",
    slug: "starter",
    description: "Essential inventory management for small dealerships.",
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
  },
  {
    name: "Professional",
    slug: "professional",
    description:
      "Advanced tools and integrations for growing dealerships.",
    monthlyPrice: 34900,
    yearlyPrice: 335000,
    maxVehicles: 200,
    maxUsers: 5,
    features: [
      "inventory_management",
      "storefront",
      "credit_applications",
      "csv_import",
      "ai_descriptions",
      "ai_pricing",
      "reports_standard",
      "reports_ai",
      "webflow_integration",
      "widgets",
      "api_access",
    ],
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description:
      "Full platform access with unlimited capacity and priority support.",
    monthlyPrice: 64900,
    yearlyPrice: 623000,
    maxVehicles: -1,
    maxUsers: 20,
    features: [
      "inventory_management",
      "storefront",
      "credit_applications",
      "csv_import",
      "ai_descriptions",
      "ai_pricing",
      "reports_standard",
      "reports_ai",
      "webflow_integration",
      "widgets",
      "api_access",
      "vauto_import",
      "gwg_import",
      "homenet_feed",
      "priority_support",
      "ai_chat",
    ],
  },
];

export function getPlan(slug: PlanSlug): PlanDefinition | undefined {
  return plans.find((p) => p.slug === slug);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
