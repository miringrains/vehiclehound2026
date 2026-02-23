import type { Metadata } from "next";
import { FeatureGate } from "@/components/shared/FeatureGate";
import { DealSheetBuilder } from "./_components/DealSheetBuilder";

export const metadata: Metadata = { title: "New Deal Sheet" };

export default function NewDealSheetPage() {
  return (
    <FeatureGate feature="deal_sheets">
      <DealSheetBuilder />
    </FeatureGate>
  );
}
