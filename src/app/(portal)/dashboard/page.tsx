import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { VEHICLE_STATUSES } from "@/lib/constants";
import { DashboardContent } from "./_components/DashboardContent";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(routes.login);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, dealerships(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.dealership_id) {
    redirect(routes.login);
  }

  const dealershipId = profile.dealership_id;

  const [totalRes, forSaleRes, recentRes, soldRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("dealership_id", dealershipId),
    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("dealership_id", dealershipId)
      .eq("status", VEHICLE_STATUSES.AVAILABLE),
    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("dealership_id", dealershipId)
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ),
    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("dealership_id", dealershipId)
      .eq("status", VEHICLE_STATUSES.SOLD),
  ]);

  const { data: recentVehicles } = await supabase
    .from("vehicles")
    .select("id, year, make, model, trim, status, online_price, preview_image, created_at")
    .eq("dealership_id", dealershipId)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = {
    total: totalRes.count ?? 0,
    forSale: forSaleRes.count ?? 0,
    recentlyAdded: recentRes.count ?? 0,
    sold: soldRes.count ?? 0,
  };

  return (
    <DashboardContent
      stats={stats}
      recentVehicles={recentVehicles ?? []}
      dealership={profile.dealerships}
      profile={profile}
    />
  );
}
