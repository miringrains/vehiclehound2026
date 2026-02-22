import type { Metadata } from "next";
import { CustomerList } from "./_components/CustomerList";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return <CustomerList />;
}
