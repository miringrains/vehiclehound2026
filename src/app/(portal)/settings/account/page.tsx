import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
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

  return <AccountSettings profile={profile} email={user.email ?? ""} />;
}
