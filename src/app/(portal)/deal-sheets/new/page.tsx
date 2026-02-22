import type { Metadata } from "next";
import { DealSheetBuilder } from "./_components/DealSheetBuilder";

export const metadata: Metadata = { title: "New Deal Sheet" };

export default function NewDealSheetPage() {
  return <DealSheetBuilder />;
}
