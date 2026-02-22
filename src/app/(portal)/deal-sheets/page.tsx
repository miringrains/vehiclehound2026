import type { Metadata } from "next";
import { DealSheetList } from "./_components/DealSheetList";

export const metadata: Metadata = { title: "Deal Sheets" };

export default function DealSheetsPage() {
  return <DealSheetList />;
}
