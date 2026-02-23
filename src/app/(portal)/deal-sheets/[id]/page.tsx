import type { Metadata } from "next";
import { FeatureGate } from "@/components/shared/FeatureGate";
import { DealSheetDetail } from "./_components/DealSheetDetail";

export const metadata: Metadata = { title: "Deal Sheet" };

export default async function DealSheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <FeatureGate feature="deal_sheets">
      <DealSheetDetail dealSheetId={id} />
    </FeatureGate>
  );
}
