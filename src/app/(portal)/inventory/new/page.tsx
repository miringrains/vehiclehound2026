import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { VehicleForm } from "../_components/VehicleForm";

export const metadata: Metadata = { title: "Add Vehicle" };

export default async function NewVehiclePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(routes.login);

  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id")
    .eq("id", user.id)
    .single();

  if (!profile?.dealership_id) redirect(routes.login);

  return <VehicleForm dealershipId={profile.dealership_id} />;
}
