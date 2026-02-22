import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { PageHeader } from "@/components/shared/PageHeader";
import { DealershipSettings } from "./_components/DealershipSettings";

export const metadata: Metadata = { title: "Dealership Settings" };

export default async function DealershipSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id, dealership_role")
    .eq("id", user.id)
    .single();

  if (!profile?.dealership_id || !["owner", "manager"].includes(profile.dealership_role)) {
    redirect(routes.dashboard);
  }

  const admin = createAdminClient();
  const { data: dealership } = await admin
    .from("dealerships")
    .select("*")
    .eq("id", profile.dealership_id)
    .single();

  if (!dealership) redirect(routes.dashboard);

  return (
    <div className="space-y-6">
      <PageHeader title="Dealership Settings" description="Manage your dealership information" />
      <DealershipSettings dealership={dealership} />
    </div>
  );
}
