import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { CsvImporter } from "./_components/CsvImporter";

export const metadata: Metadata = { title: "CSV Import" };

export default function CsvImportPage() {
  return (
    <>
      <PageHeader
        title="CSV Import"
        description="Bulk import vehicles from a CSV file"
      />
      <CsvImporter />
    </>
  );
}
