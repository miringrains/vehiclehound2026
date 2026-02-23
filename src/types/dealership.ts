export type Dealership = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  storefront_enabled: boolean;
  credit_app_emails: string[];
  max_users: number;
  active_users_count: number;
  plan: string;
  subscription_status: string | null;
  is_free_account: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DealershipRole = "owner" | "manager" | "user";
export type SystemRole = "sa" | "a" | "user";
