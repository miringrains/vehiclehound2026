import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { VehicleDetail } from "./_components/VehicleDetail";

export const metadata: Metadata = { title: "Vehicle Details" };

export default async function VehicleDetailPage({
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

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !vehicle) notFound();

  const { data: images } = await supabase
    .from("vehicle_images")
    .select("*")
    .eq("vehicle_id", id)
    .order("display_order", { ascending: true });

  return <VehicleDetail vehicle={vehicle} images={images ?? []} />;
}
