import type { Metadata } from "next";
import { CreditAppForm } from "@/components/credit-app/CreditAppForm";

export const metadata: Metadata = {
  title: "Credit Application",
  description: "Apply for vehicle financing",
};

type Props = {
  params: Promise<{ dealershipId: string }>;
  searchParams: Promise<{ vehicle?: string; embed?: string }>;
};

export default async function PublicCreditAppPage({ params, searchParams }: Props) {
  const { dealershipId } = await params;
  const sp = await searchParams;
  const isEmbed = sp.embed === "true";

  return (
    <div className={isEmbed ? "p-4" : "min-h-screen bg-gray-50 py-12 px-4"}>
      {!isEmbed && (
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Credit Application</h1>
          <p className="text-sm text-gray-500 mt-1">Fill out the form below to apply for financing.</p>
        </div>
      )}
      <CreditAppForm
        dealershipId={dealershipId}
        vehicleId={sp.vehicle || null}
        embed={isEmbed}
      />
    </div>
  );
}
