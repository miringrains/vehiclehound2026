"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

const TEMPLATE_HEADERS = [
  "Year", "Make", "Model", "Trim", "VIN", "Stock Number", "Mileage",
  "Online Price", "Sale Price", "MSRP", "Exterior Color", "Interior Color",
  "Body Style", "Doors", "Engine HP", "Cylinders", "Fuel Type",
  "Transmission", "Drive Type", "Description", "Inventory Type",
];

const EXAMPLE_ROW = [
  "2025", "Toyota", "Camry", "XSE", "4T1K61AK5RU000001", "STK-1234", "12500",
  "32000", "30500", "33500", "White", "Black",
  "Sedan", "4", "203", "4", "Gasoline",
  "Automatic", "FWD", "Low mileage, one owner", "sale",
];

function downloadTemplate() {
  const csv = [TEMPLATE_HEADERS.join(","), EXAMPLE_ROW.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vehiclehound-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function DownloadTemplateButton() {
  return (
    <Button variant="outline" size="sm" onClick={downloadTemplate}>
      <Download size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" />
      Download Template
    </Button>
  );
}
