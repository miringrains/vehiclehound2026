import type { PlanSlug } from "./plans";

export type FeatureName =
  | "inventory_management"
  | "storefront"
  | "credit_applications"
  | "csv_import"
  | "crm"
  | "deal_sheets"
  | "analytics"
  | "email_notifications"
  | "api_access"
  | "priority_support";

export const featureRequiredPlans: Record<FeatureName, PlanSlug[]> = {
  inventory_management: ["starter", "professional", "enterprise"],
  storefront: ["starter", "professional", "enterprise"],
  credit_applications: ["starter", "professional", "enterprise"],
  csv_import: ["starter", "professional", "enterprise"],
  crm: ["professional", "enterprise"],
  deal_sheets: ["professional", "enterprise"],
  analytics: ["professional", "enterprise"],
  email_notifications: ["professional", "enterprise"],
  api_access: ["enterprise"],
  priority_support: ["enterprise"],
};

export function isFeatureAvailable(
  feature: FeatureName,
  currentPlan: PlanSlug
): boolean {
  return featureRequiredPlans[feature].includes(currentPlan);
}
