import type { Metadata } from "next";
import { DealSheetDetail } from "./_components/DealSheetDetail";

export const metadata: Metadata = { title: "Deal Sheet" };

export default async function DealSheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DealSheetDetail dealSheetId={id} />;
}
