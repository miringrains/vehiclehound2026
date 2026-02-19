import type { PlanSlug } from "./plans";

export type FeatureName =
  | "inventory_management"
  | "storefront"
  | "credit_applications"
  | "csv_import"
  | "ai_descriptions"
  | "ai_pricing"
  | "reports_standard"
  | "reports_ai"
  | "webflow_integration"
  | "widgets"
  | "api_access"
  | "vauto_import"
  | "gwg_import"
  | "homenet_feed"
  | "priority_support"
  | "ai_chat";

export const featureRequiredPlans: Record<FeatureName, PlanSlug[]> = {
  inventory_management: ["starter", "professional", "enterprise"],
  storefront: ["starter", "professional", "enterprise"],
  credit_applications: ["starter", "professional", "enterprise"],
  csv_import: ["starter", "professional", "enterprise"],
  ai_descriptions: ["professional", "enterprise"],
  ai_pricing: ["professional", "enterprise"],
  reports_standard: ["professional", "enterprise"],
  reports_ai: ["professional", "enterprise"],
  webflow_integration: ["professional", "enterprise"],
  widgets: ["professional", "enterprise"],
  api_access: ["professional", "enterprise"],
  vauto_import: ["enterprise"],
  gwg_import: ["enterprise"],
  homenet_feed: ["enterprise"],
  priority_support: ["enterprise"],
  ai_chat: ["enterprise"],
};

export function isFeatureAvailable(
  feature: FeatureName,
  currentPlan: PlanSlug
): boolean {
  return featureRequiredPlans[feature].includes(currentPlan);
}
