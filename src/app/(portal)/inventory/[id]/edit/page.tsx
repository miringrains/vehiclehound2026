import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { VehicleForm } from "../../_components/VehicleForm";

export const metadata: Metadata = { title: "Edit Vehicle" };

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !vehicle) notFound();

  return <VehicleForm dealershipId={profile.dealership_id} vehicle={vehicle} />;
}
