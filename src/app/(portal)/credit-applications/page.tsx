import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CreditAppList } from "./_components/CreditAppList";

export const metadata: Metadata = { title: "Credit Applications" };

export default async function CreditApplicationsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("credit_applications")
    .select(
      "id, first_name, last_name, email, phone, status, vehicle_id, created_at, updated_at, vehicle:vehicles(year, make, model, stock_number)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(0, 19);

  const applications = (data ?? []).map((row) => ({
    ...row,
    vehicle: Array.isArray(row.vehicle) ? row.vehicle[0] ?? null : row.vehicle ?? null,
  }));

  return (
    <CreditAppList
      initialApplications={applications}
      initialTotal={count ?? 0}
    />
  );
}
