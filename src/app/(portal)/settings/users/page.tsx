import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserManagement } from "./_components/UserManagement";

export const metadata: Metadata = { title: "User Management" };

export default async function UsersPage() {
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
  const { data: users } = await admin
    .from("profiles")
    .select("id, name, email, dealership_role, joined_at, last_activity_at")
    .eq("dealership_id", profile.dealership_id)
    .order("joined_at", { ascending: true });

  return (
    <>
      <PageHeader title="User Management" description="Manage team members and invitations" />
      <UserManagement
        currentUserId={user.id}
        currentRole={profile.dealership_role}
        users={users ?? []}
        dealershipId={profile.dealership_id}
      />
    </>
  );
}
