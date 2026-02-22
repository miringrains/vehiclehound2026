import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { InsightsContent } from "./_components/InsightsContent";

export const metadata: Metadata = { title: "Insights" };

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Insights" description="Track how visitors interact with your inventory" />
      <InsightsContent />
    </div>
  );
}
