import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { IntegrationManager } from "./_components/IntegrationManager";

export const metadata: Metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id")
    .single();

  const { data: config } = await supabase
    .from("widget_configs")
    .select("*")
    .maybeSingle();

  return (
    <IntegrationManager
      initialConfig={config}
      dealershipId={profile?.dealership_id ?? ""}
    />
  );
}
