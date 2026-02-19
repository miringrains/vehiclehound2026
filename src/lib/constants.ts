export const APP_NAME = "VehicleHound";
export const APP_DESCRIPTION =
  "AI-powered automotive dealership inventory management platform.";

export const ICON_STROKE_WIDTH = 1.75;

export const RATE_LIMITS = {
  creditApp: { max: 5, windowMs: 60_000 },
  apiToken: { max: 10, windowMs: 60_000 },
  general: { max: 60, windowMs: 60_000 },
  widgetApi: { max: 1000, windowMs: 3_600_000 },
} as const;

export const TRIAL_DAYS = 14;
export const MAX_DEFAULT_USERS = 4;

export const VIN_CACHE_TTL_MS = 3_600_000;

export const VEHICLE_STATUSES = {
  FOR_SALE: 1,
  SOLD: 0,
  COMING_SOON: 2,
  DREAM_BUILD: 3,
} as const;

export const VEHICLE_STATUS_LABELS: Record<number, string> = {
  [VEHICLE_STATUSES.FOR_SALE]: "For Sale",
  [VEHICLE_STATUSES.SOLD]: "Sold",
  [VEHICLE_STATUSES.COMING_SOON]: "Coming Soon",
  [VEHICLE_STATUSES.DREAM_BUILD]: "Dream Build",
};

export const INVENTORY_TYPES = {
  SALE: "sale",
  LEASE: "lease",
} as const;

export const CREDIT_APP_STATUSES = ["new", "reviewed", "approved", "denied"] as const;

export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
] as const;
