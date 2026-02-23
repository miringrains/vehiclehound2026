import type { Metadata } from "next";
import { FeatureGate } from "@/components/shared/FeatureGate";
import { CustomerList } from "./_components/CustomerList";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <FeatureGate feature="crm">
      <CustomerList />
    </FeatureGate>
  );
}
