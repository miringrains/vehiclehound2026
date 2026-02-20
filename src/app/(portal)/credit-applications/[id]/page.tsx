import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreditAppDetail } from "./_components/CreditAppDetail";

export const metadata: Metadata = { title: "Application Detail" };

type Props = { params: Promise<{ id: string }> };

export default async function CreditApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: app } = await supabase
    .from("credit_applications")
    .select("*, vehicle:vehicles(year, make, model, trim, stock_number, inventory_type)")
    .eq("id", id)
    .single();

  if (!app) notFound();

  return <CreditAppDetail application={app} />;
}
