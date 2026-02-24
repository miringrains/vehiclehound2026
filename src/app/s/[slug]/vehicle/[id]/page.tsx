import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { StorefrontVehicle } from "../../_components/StorefrontVehicle";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const admin = createAdminClient();

  const { data: dealership } = await admin.from("dealerships").select("id, name").eq("slug", slug).single();
  if (!dealership) return { title: "Vehicle Not Found" };

  const { data: vehicle } = await admin
    .from("vehicles")
    .select("year, make, model, trim, preview_image, online_price, sale_price")
    .eq("id", id)
    .eq("dealership_id", dealership.id)
    .single();

  if (!vehicle) return { title: "Vehicle Not Found" };

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""} – ${dealership.name}`;
  const price = vehicle.online_price || vehicle.sale_price;
  const description = `${title}${price ? ` • $${price.toLocaleString()}` : ""} – Available at ${dealership.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(vehicle.preview_image ? { images: [{ url: vehicle.preview_image }] } : {}),
    },
  };
}

export default async function StorefrontVehiclePage({ params }: Props) {
  const { slug, id } = await params;
  const admin = createAdminClient();

  const { data: dealership } = await admin
    .from("dealerships")
    .select("id, phone, storefront_enabled")
    .eq("slug", slug)
    .single();

  if (!dealership || !dealership.storefront_enabled) notFound();

  const { data: vehicle } = await admin
    .from("vehicles")
    .select("*, images:vehicle_images(id, file_path, display_order)")
    .eq("id", id)
    .eq("dealership_id", dealership.id)
    .single();

  if (!vehicle) notFound();

  const { data: widgetConfig } = await admin
    .from("widget_configs")
    .select("config, api_key")
    .eq("dealership_id", dealership.id)
    .eq("status", "active")
    .single();

  const cfg = widgetConfig?.config ?? {};
  const showPricing = cfg.showPricing !== false;
  const showCreditApp = cfg.showCreditApp !== false;

  if (!showPricing) {
    vehicle.online_price = null;
    vehicle.sale_price = null;
    vehicle.purchase_price = null;
    vehicle.msrp = null;
    vehicle.lease_payment = null;
  }

  const images = (vehicle.images ?? [])
    .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
    .map((img: { file_path: string }) => {
      const { data } = admin.storage.from("vehicle-images").getPublicUrl(img.file_path);
      return data.publicUrl;
    });

  return (
    <StorefrontVehicle
      vehicle={vehicle}
      images={images}
      slug={slug}
      showPricing={showPricing}
      showCreditApp={showCreditApp}
      phone={dealership.phone}
      primaryColor={cfg.primaryColor || "#1a1d1e"}
      dealershipId={dealership.id}
      apiKey={widgetConfig?.api_key || null}
    />
  );
}
