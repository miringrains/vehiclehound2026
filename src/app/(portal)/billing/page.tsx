import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { PageHeader } from "@/components/shared/PageHeader";
import { BillingContent } from "./_components/BillingContent";
import type { PlanSlug } from "@/config/plans";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id")
    .eq("id", user.id)
    .single();

  if (!profile?.dealership_id) redirect(routes.dashboard);

  const admin = createAdminClient();
  const { data: dealership } = await admin
    .from("dealerships")
    .select("plan, subscription_status, trial_ends_at")
    .eq("id", profile.dealership_id)
    .single();

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Manage your subscription" />
      <BillingContent
        currentPlan={(dealership?.plan ?? "starter") as PlanSlug}
        subscriptionStatus={dealership?.subscription_status ?? null}
        trialEndsAt={dealership?.trial_ends_at ?? null}
      />
    </div>
  );
}
