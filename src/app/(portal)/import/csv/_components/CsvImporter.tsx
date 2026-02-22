"use client";

import { useState, useCallback, useRef } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, AlertTriangle, Check, X, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { toast } from "sonner";

const VEHICLE_FIELDS: { value: string; label: string; required?: boolean }[] = [
  { value: "year", label: "Year", required: true },
  { value: "make", label: "Make", required: true },
  { value: "model", label: "Model", required: true },
  { value: "trim", label: "Trim" },
  { value: "vin", label: "VIN" },
  { value: "stock_number", label: "Stock Number" },
  { value: "mileage", label: "Mileage" },
  { value: "online_price", label: "Online Price" },
  { value: "sale_price", label: "Sale Price" },
  { value: "purchase_price", label: "Purchase Price" },
  { value: "msrp", label: "MSRP" },
  { value: "exterior_color", label: "Exterior Color" },
  { value: "interior_color", label: "Interior Color" },
  { value: "body_class", label: "Body Style" },
  { value: "doors", label: "Doors" },
  { value: "engine_hp", label: "Engine HP" },
  { value: "engine_cylinders", label: "Cylinders" },
  { value: "fuel_type", label: "Fuel Type" },
  { value: "transmission_style", label: "Transmission" },
  { value: "drive_type", label: "Drive Type" },
  { value: "description", label: "Description" },
  { value: "title_status", label: "Title Status" },
  { value: "location_detail", label: "Location" },
  { value: "inventory_type", label: "Inventory Type (sale/lease)" },
  { value: "lease_payment", label: "Lease Payment" },
  { value: "lease_term", label: "Lease Term" },
  { value: "lease_down_payment", label: "Lease Down Payment" },
  { value: "lease_annual_mileage", label: "Lease Annual Mileage" },
  { value: "broker_fee", label: "Broker Fee" },
  { value: "taxes_and_fees", label: "Taxes & Fees" },
];

const FUZZY_MAP: Record<string, string> = {
  year: "year", yr: "year",
  make: "make", manufacturer: "make", brand: "make",
  model: "model",
  trim: "trim", trimlevel: "trim", "trim level": "trim",
  vin: "vin", "vin number": "vin", "vin#": "vin",
  stock: "stock_number", "stock number": "stock_number", "stock#": "stock_number", stocknumber: "stock_number", stk: "stock_number",
  mileage: "mileage", miles: "mileage", odometer: "mileage",
  price: "online_price", "online price": "online_price", "list price": "online_price", "asking price": "online_price",
  "sale price": "sale_price", saleprice: "sale_price", "selling price": "sale_price",
  "purchase price": "purchase_price", cost: "purchase_price",
  msrp: "msrp", "sticker price": "msrp",
  "exterior color": "exterior_color", exterior: "exterior_color", "ext color": "exterior_color", color: "exterior_color",
  "interior color": "interior_color", interior: "interior_color", "int color": "interior_color",
  body: "body_class", "body style": "body_class", "body type": "body_class", bodyclass: "body_class",
  doors: "doors",
  engine: "engine_hp", hp: "engine_hp", horsepower: "engine_hp",
  cylinders: "engine_cylinders", cyl: "engine_cylinders",
  fuel: "fuel_type", "fuel type": "fuel_type",
  transmission: "transmission_style", trans: "transmission_style",
  drive: "drive_type", "drive type": "drive_type", drivetrain: "drive_type",
  description: "description", desc: "description", notes: "description",
  "title status": "title_status", title: "title_status",
  location: "location_detail",
  type: "inventory_type", "inventory type": "inventory_type",
};

type Stage = "upload" | "mapping" | "review";

type RowError = { row: number; field: string; message: string };

function autoMap(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const used = new Set<string>();

  for (const h of headers) {
    const norm = h.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    const match = FUZZY_MAP[norm] || FUZZY_MAP[norm.replace(/\s+/g, "")] || FUZZY_MAP[norm.replace(/_/g, " ")];
    if (match && !used.has(match)) {
      mapping[h] = match;
      used.add(match);
    }
  }
  return mapping;
}

function validateRows(rows: Record<string, string>[], mapping: Record<string, string>): RowError[] {
  const errors: RowError[] = [];
  const vinsSeen = new Set<string>();
  const requiredFields = ["year", "make", "model"];
  const reverseMap: Record<string, string> = {};
  for (const [csvCol, field] of Object.entries(mapping)) {
    reverseMap[field] = csvCol;
  }

  for (let i = 0; i < rows.length; i++) {
    for (const rf of requiredFields) {
      const col = reverseMap[rf];
      if (!col || !rows[i][col]?.trim()) {
        errors.push({ row: i, field: rf, message: `Missing ${rf}` });
      }
    }

    const vinCol = reverseMap.vin;
    if (vinCol) {
      const vin = rows[i][vinCol]?.trim().toUpperCase();
      if (vin) {
        if (vinsSeen.has(vin)) {
          errors.push({ row: i, field: "vin", message: "Duplicate VIN in file" });
        }
        vinsSeen.add(vin);
      }
    }
  }
  return errors;
}

function mapRow(row: Record<string, string>, mapping: Record<string, string>): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const [csvCol, field] of Object.entries(mapping)) {
    const val = row[csvCol]?.trim();
    if (val) mapped[field] = val;
  }
  return mapped;
}

export function CsvImporter() {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<RowError[]>([]);
  const [skippedRows, setSkippedRows] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: { row: number; message: string }[] } | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<"skip" | "overwrite">("skip");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.replace(/^\uFEFF/, "").trim(),
      complete: (res) => {
        if (!res.data || res.data.length === 0) {
          toast.error("CSV file is empty");
          return;
        }
        if (res.data.length > 2000) {
          toast.error("Maximum 2000 rows supported");
          return;
        }
        const data = res.data as Record<string, string>[];
        const hdrs = res.meta.fields ?? [];
        setFileName(file.name);
        setHeaders(hdrs);
        setRows(data);
        setMapping(autoMap(hdrs));
        setStage("mapping");
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const setColumnMapping = (csvCol: string, field: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (field === "__none") {
        delete next[csvCol];
      } else {
        for (const [k, v] of Object.entries(next)) {
          if (v === field) delete next[k];
        }
        next[csvCol] = field;
      }
      return next;
    });
  };

  const goToReview = () => {
    const mappedFields = new Set(Object.values(mapping));
    if (!mappedFields.has("year") || !mappedFields.has("make") || !mappedFields.has("model")) {
      toast.error("Year, Make, and Model must be mapped");
      return;
    }
    setErrors(validateRows(rows, mapping));
    setSkippedRows(new Set());
    setStage("review");
  };

  const validRowCount = rows.filter((_, i) => {
    if (skippedRows.has(i)) return false;
    return !errors.some((e) => e.row === i);
  }).length;

  const handleImport = async () => {
    setImporting(true);
    try {
      const vehicles = rows
        .map((row, i) => {
          if (skippedRows.has(i)) return null;
          if (errors.some((e) => e.row === i)) return null;
          return mapRow(row, mapping);
        })
        .filter(Boolean);

      const res = await fetch("/api/vehicles/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicles, mode: duplicateMode }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Import failed");
        return;
      }

      const data = await res.json();
      setResult(data);
      toast.success(`Imported ${data.imported} vehicles`);
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setStage("upload");
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setErrors([]);
    setSkippedRows(new Set());
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto py-16 text-center">
        <div className="mb-4 rounded-full bg-green-500/10 p-4 inline-flex">
          <Check size={32} className="text-green-500" />
        </div>
        <h2 className="text-heading-2 mb-2">Import Complete</h2>
        <p className="text-body-sm text-muted-foreground mb-6">
          {result.imported} imported, {result.skipped} skipped
          {result.errors.length > 0 && `, ${result.errors.length} errors`}
        </p>
        {result.errors.length > 0 && (
          <div className="text-left mb-6 rounded-lg border border-border bg-card p-4 max-h-48 overflow-y-auto">
            {result.errors.map((e, i) => (
              <p key={i} className="text-caption text-red-400">Row {e.row}: {e.message}</p>
            ))}
          </div>
        )}
        <Button onClick={reset}>Import Another File</Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {stage === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-16 text-center transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <Upload size={32} strokeWidth={ICON_STROKE_WIDTH} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-body-sm font-medium mb-1">Drop your CSV file here</p>
              <p className="text-caption text-muted-foreground">or click to browse. Max 5MB, 2000 rows.</p>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
            </div>
          </motion.div>
        )}

        {stage === "mapping" && (
          <motion.div key="mapping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
                <span className="text-body-sm font-medium">{fileName}</span>
                <span className="text-caption text-muted-foreground">{rows.length} rows</span>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>Start Over</Button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h3 className="text-heading-4">Map Columns</h3>
                <p className="text-caption text-muted-foreground mt-0.5">Match your CSV columns to vehicle fields. Year, Make, Model are required.</p>
              </div>
              <div className="divide-y divide-border">
                {headers.map((h) => {
                  const mapped = mapping[h];
                  const previewVals = rows.slice(0, 3).map((r) => r[h]).filter(Boolean).join(", ");
                  return (
                    <div key={h} className="flex items-center gap-3 px-5 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium truncate">{h}</p>
                        {previewVals && (
                          <p className="text-caption text-muted-foreground truncate">{previewVals}</p>
                        )}
                      </div>
                      <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                      <div className="w-48 shrink-0">
                        <Select value={mapped || "__none"} onValueChange={(v) => setColumnMapping(h, v)}>
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">-- Skip --</SelectItem>
                            {VEHICLE_FIELDS.map((f) => {
                              const inUse = Object.values(mapping).includes(f.value) && mapping[h] !== f.value;
                              return (
                                <SelectItem key={f.value} value={f.value} disabled={inUse}>
                                  {f.label}{f.required ? " *" : ""}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <Button onClick={goToReview}>
                Continue to Review
                <ArrowRight size={14} strokeWidth={ICON_STROKE_WIDTH} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {stage === "review" && (
          <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-heading-3">Review Import</h3>
                <p className="text-caption text-muted-foreground mt-0.5">
                  {validRowCount} of {rows.length} rows ready to import
                  {errors.length > 0 && ` \u2022 ${errors.length} issues found`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStage("mapping")}>Back</Button>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 mb-5 flex items-start gap-3">
                <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-body-sm font-medium text-yellow-500">Some rows have issues</p>
                  <p className="text-caption text-muted-foreground">Rows with errors will be skipped. You can also manually skip rows.</p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card overflow-hidden mb-5">
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-caption">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground w-10">#</th>
                      {Object.entries(mapping).map(([csvCol, field]) => (
                        <th key={csvCol} className="px-3 py-2 text-left font-medium text-muted-foreground">
                          {VEHICLE_FIELDS.find((f) => f.value === field)?.label ?? field}
                        </th>
                      ))}
                      <th className="px-3 py-2 w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.slice(0, 100).map((row, i) => {
                      const rowErrors = errors.filter((e) => e.row === i);
                      const isSkipped = skippedRows.has(i);
                      const hasError = rowErrors.length > 0;
                      return (
                        <tr key={i} className={`${isSkipped ? "opacity-30" : ""} ${hasError ? "bg-red-500/5" : ""}`}>
                          <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                          {Object.keys(mapping).map((csvCol) => (
                            <td key={csvCol} className="px-3 py-1.5 max-w-[150px] truncate">
                              {row[csvCol] || <span className="text-muted-foreground/40">--</span>}
                            </td>
                          ))}
                          <td className="px-3 py-1.5">
                            {!hasError && (
                              <button
                                onClick={() => setSkippedRows((prev) => {
                                  const next = new Set(prev);
                                  next.has(i) ? next.delete(i) : next.add(i);
                                  return next;
                                })}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {isSkipped ? <Check size={14} /> : <X size={14} />}
                              </button>
                            )}
                            {hasError && (
                              <span className="text-red-400 text-[10px]">{rowErrors[0].message}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length > 100 && (
                <div className="px-3 py-2 border-t border-border text-caption text-muted-foreground text-center">
                  Showing first 100 of {rows.length} rows
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-caption text-muted-foreground">Existing VINs:</span>
                <Select value={duplicateMode} onValueChange={(v: "skip" | "overwrite") => setDuplicateMode(v)}>
                  <SelectTrigger className="w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip</SelectItem>
                    <SelectItem value="overwrite">Overwrite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleImport} disabled={importing || validRowCount === 0}>
                {importing && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                Import {validRowCount} Vehicle{validRowCount !== 1 ? "s" : ""}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
