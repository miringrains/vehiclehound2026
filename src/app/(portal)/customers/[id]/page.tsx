import type { Metadata } from "next";
import { FeatureGate } from "@/components/shared/FeatureGate";
import { CustomerDetail } from "./_components/CustomerDetail";

export const metadata: Metadata = { title: "Customer" };

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <FeatureGate feature="crm">
      <CustomerDetail customerId={id} />
    </FeatureGate>
  );
}
