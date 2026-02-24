import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { IntegrationManager } from "./_components/IntegrationManager";

export const metadata: Metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id")
    .eq("id", user?.id ?? "")
    .single();

  const did = profile?.dealership_id ?? "";

  const { data: config } = await supabase
    .from("widget_configs")
    .select("*")
    .maybeSingle();

  let storefrontSlug: string | null = null;
  let storefrontEnabled = false;

  if (did) {
    const admin = createAdminClient();
    const { data: dealership, error } = await admin
      .from("dealerships")
      .select("slug, storefront_enabled")
      .eq("id", did)
      .single();

    if (error) {
      console.error("[integrations] Failed to fetch dealership:", error.message);
    } else if (dealership) {
      storefrontSlug = dealership.slug;
      storefrontEnabled = dealership.storefront_enabled === true;
    }
  }

  return (
    <IntegrationManager
      initialConfig={config}
      dealershipId={did}
      storefrontSlug={storefrontSlug}
      storefrontEnabled={storefrontEnabled}
    />
  );
}
