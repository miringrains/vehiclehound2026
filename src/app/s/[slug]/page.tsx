import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { StorefrontInventory } from "./_components/StorefrontInventory";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("dealerships").select("name").eq("slug", slug).single();
  return {
    title: data ? `${data.name} – Inventory` : "Inventory",
    description: data ? `Browse the full vehicle inventory at ${data.name}` : "Vehicle inventory",
  };
}

export default async function StorefrontInventoryPage({ params }: Props) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: dealership } = await admin
    .from("dealerships")
    .select("id, storefront_enabled")
    .eq("slug", slug)
    .single();

  if (!dealership || !dealership.storefront_enabled) notFound();

  const { data: widgetConfig } = await admin
    .from("widget_configs")
    .select("config")
    .eq("dealership_id", dealership.id)
    .eq("status", "active")
    .single();

  const cfg = widgetConfig?.config ?? {};
  const showPricing = cfg.showPricing !== false;

  const selectFields = [
    "id", "year", "make", "model", "trim", "stock_number",
    "inventory_type", "vehicle_type", "mileage", "exterior_color",
    "preview_image", "status", "created_at",
    "online_price", "sale_price", "lease_payment", "lease_term", "msrp",
  ].join(", ");

  const { data: vehicles } = await admin
    .from("vehicles")
    .select(selectFields)
    .eq("dealership_id", dealership.id)
    .eq("status", 1)
    .order("created_at", { ascending: false });

  return (
    <StorefrontInventory
      vehicles={(vehicles ?? []) as unknown as Record<string, unknown>[]}
      slug={slug}
      showPricing={showPricing}
      primaryColor={cfg.primaryColor || "#1a1d1e"}
    />
  );
}
