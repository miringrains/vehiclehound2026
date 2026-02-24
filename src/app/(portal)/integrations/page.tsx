import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { IntegrationManager } from "./_components/IntegrationManager";

export const metadata: Metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id")
    .single();

  const did = profile?.dealership_id ?? "";

  const { data: config } = await supabase
    .from("widget_configs")
    .select("*")
    .maybeSingle();

  const admin = createAdminClient();
  const { data: dealership } = did
    ? await admin.from("dealerships").select("slug, storefront_enabled").eq("id", did).single()
    : { data: null };

  return (
    <IntegrationManager
      initialConfig={config}
      dealershipId={did}
      storefrontSlug={dealership?.slug ?? null}
      storefrontEnabled={dealership?.storefront_enabled ?? false}
    />
  );
}
