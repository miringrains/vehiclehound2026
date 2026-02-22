import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { CsvImporter } from "./_components/CsvImporter";
import { DownloadTemplateButton } from "./_components/DownloadTemplateButton";

export const metadata: Metadata = { title: "CSV Import" };

export default function CsvImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CSV Import"
        description="Bulk import vehicles from a CSV file"
      >
        <DownloadTemplateButton />
      </PageHeader>
      <CsvImporter />
    </div>
  );
}
