import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { InventoryList } from "./_components/InventoryList";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
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

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select(
      "id, year, make, model, trim, stock_number, vin, status, inventory_type, online_price, sale_price, mileage, exterior_color, preview_image, created_at, lease_payment, lease_term, lease_annual_mileage, drive_type, fuel_type"
    )
    .eq("dealership_id", profile.dealership_id)
    .order("created_at", { ascending: false });

  return <InventoryList vehicles={vehicles ?? []} />;
}
