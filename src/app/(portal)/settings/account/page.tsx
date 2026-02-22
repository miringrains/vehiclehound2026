import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { PageHeader } from "@/components/shared/PageHeader";
import { AccountSettings } from "./_components/AccountSettings";

export const metadata: Metadata = { title: "Account Settings" };

export default async function AccountSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(routes.login);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(routes.login);

  return (
    <div className="space-y-6">
      <PageHeader title="Account Settings" description="Manage your personal account information" />
      <AccountSettings profile={profile} email={user.email ?? ""} />
    </div>
  );
}
