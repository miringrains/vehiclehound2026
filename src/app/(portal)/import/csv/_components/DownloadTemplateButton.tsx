"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

const TEMPLATE_HEADERS = [
  "Year", "Make", "Model", "Trim", "VIN", "Stock Number", "Mileage",
  "Condition", "Inventory Type", "Online Price", "Sale Price", "MSRP",
  "Purchase Price", "Lease Payment", "Lease Term", "Lease Down Payment",
  "Lease Annual Mileage", "Exterior Color", "Interior Color",
  "Body Style", "Doors", "Engine HP", "Cylinders", "Fuel Type",
  "Transmission", "Drive Type", "Description", "Image URL",
];

const SALE_EXAMPLE = [
  "2025", "Toyota", "Camry", "XSE", "4T1K61AK5RU000001", "STK-1234", "12500",
  "used", "sale", "32000", "30500", "", "24000",
  "", "", "", "",
  "White", "Black", "Sedan", "4", "203", "4", "Gasoline",
  "Automatic", "FWD", "Low mileage one owner",
  "https://example.com/photo.jpg",
];

const LEASE_EXAMPLE = [
  "2026", "BMW", "X3", "xDrive30i", "", "STK-5678", "0",
  "new", "lease", "", "", "49545", "",
  "599", "36", "2999", "10000",
  "Alpine White", "Black", "SUV", "4", "255", "4", "Gasoline",
  "Automatic", "AWD", "Factory fresh lease special",
  "https://example.com/bmw.jpg",
];

function downloadTemplate() {
  const csv = [
    TEMPLATE_HEADERS.join(","),
    SALE_EXAMPLE.join(","),
    LEASE_EXAMPLE.join(","),
  ].join("\n");
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
