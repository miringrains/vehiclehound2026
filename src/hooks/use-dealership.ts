"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PlanSlug } from "@/config/plans";

type DealershipData = {
  id: string;
  name: string;
  plan: PlanSlug;
  subscription_status: string | null;
  trial_ends_at: string | null;
  max_users: number;
  active_users_count: number;
  is_free_account: boolean;
  stripe_customer_id: string | null;
};

async function fetchDealership(): Promise<DealershipData | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id")
    .eq("id", user.id)
    .single();

  if (!profile?.dealership_id) return null;

  const { data } = await supabase
    .from("dealerships")
    .select("id, name, plan, subscription_status, trial_ends_at, max_users, active_users_count, is_free_account, stripe_customer_id")
    .eq("id", profile.dealership_id)
    .single();

  return data as DealershipData | null;
}

export function useDealership() {
  return useQuery({
    queryKey: ["dealership"],
    queryFn: fetchDealership,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useTrialStatus() {
  const { data: dealership } = useDealership();
  if (!dealership) return null;
  if (dealership.is_free_account) return null;

  const isTrialing = dealership.subscription_status === "trialing";
  if (!isTrialing) return null;

  const endsAt = dealership.trial_ends_at ? new Date(dealership.trial_ends_at) : null;
  const now = new Date();
  const expired = endsAt ? endsAt < now : false;
  const daysLeft = endsAt ? Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / 86_400_000)) : 0;

  return { isTrialing, expired, daysLeft, endsAt };
}
