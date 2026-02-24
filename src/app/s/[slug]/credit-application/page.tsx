import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { CreditAppForm } from "@/components/credit-app/CreditAppForm";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ vehicle?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("dealerships").select("name").eq("slug", slug).single();
  return {
    title: data ? `Credit Application – ${data.name}` : "Credit Application",
    description: "Apply for vehicle financing",
  };
}

export default async function StorefrontCreditAppPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const admin = createAdminClient();

  const { data: dealership } = await admin
    .from("dealerships")
    .select("id, name, storefront_enabled")
    .eq("slug", slug)
    .single();

  if (!dealership || !dealership.storefront_enabled) notFound();

  const { data: widgetConfig } = await admin
    .from("widget_configs")
    .select("config")
    .eq("dealership_id", dealership.id)
    .eq("status", "active")
    .single();

  const showCreditApp = widgetConfig?.config?.showCreditApp !== false;
  if (!showCreditApp) notFound();

  let vehicleLabel: string | undefined;
  if (sp.vehicle) {
    const { data: v } = await admin
      .from("vehicles")
      .select("year, make, model, trim")
      .eq("id", sp.vehicle)
      .eq("dealership_id", dealership.id)
      .single();
    if (v) vehicleLabel = `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`;
  }

  return (
    <div>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Credit Application</h1>
          <p style={{ fontSize: 13, color: "var(--sf-text-muted)", marginTop: 4 }}>
            Apply for financing{vehicleLabel ? ` for the ${vehicleLabel}` : ""} at {dealership.name}
          </p>
        </div>
        <CreditAppForm
          dealershipId={dealership.id}
          vehicleId={sp.vehicle || null}
          vehicleLabel={vehicleLabel}
        />
      </div>
    </div>
  );
}
