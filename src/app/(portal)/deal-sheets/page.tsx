import type { Metadata } from "next";
import { FeatureGate } from "@/components/shared/FeatureGate";
import { DealSheetList } from "./_components/DealSheetList";

export const metadata: Metadata = { title: "Deal Sheets" };

export default function DealSheetsPage() {
  return (
    <FeatureGate feature="deal_sheets">
      <DealSheetList />
    </FeatureGate>
  );
}
