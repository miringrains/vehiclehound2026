"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ICON_STROKE_WIDTH, VEHICLE_STATUSES } from "@/lib/constants";
import { vehicleTypes } from "@/config/vehicle-options";
import { useWizard } from "../WizardContext";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR + 1 - i);

const reveal = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: { opacity: 1, height: "auto", marginTop: 24 },
  exit: { opacity: 0, height: 0, marginTop: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

export function StepIdentity() {
  const { data, setData, next } = useWizard();
  const isSale = data.inventory_type === "sale";

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // VIN decode state (sale only)
  const [decoding, setDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decoded, setDecoded] = useState(false);

  // Fetch makes when year changes
  useEffect(() => {
    if (!data.year) { setMakes([]); return; }
    let cancelled = false;
    setLoadingMakes(true);
    fetch(`/api/vehicles/makes?year=${data.year}`)
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setMakes(json.makes || []); })
      .catch(() => { if (!cancelled) setMakes([]); })
      .finally(() => { if (!cancelled) setLoadingMakes(false); });
    return () => { cancelled = true; };
  }, [data.year]);

  // Fetch models when make changes
  useEffect(() => {
    if (!data.make || !data.year) { setModels([]); return; }
    let cancelled = false;
    setLoadingModels(true);
    fetch(`/api/vehicles/models?make=${encodeURIComponent(data.make)}&year=${data.year}`)
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setModels(json.models || []); })
      .catch(() => { if (!cancelled) setModels([]); })
      .finally(() => { if (!cancelled) setLoadingModels(false); });
    return () => { cancelled = true; };
  }, [data.make, data.year]);

  // Clear downstream when upstream changes
  const handleYearChange = useCallback((year: string) => {
    setData({ year: year ? Number(year) : null, make: "", model: "", trim: "" });
    setDecoded(false);
  }, [setData]);

  const handleMakeChange = useCallback((make: string) => {
    setData({ make, model: "", trim: "" });
    setDecoded(false);
  }, [setData]);

  const handleModelChange = useCallback((model: string) => {
    setData({ model, trim: "" });
    setDecoded(false);
  }, [setData]);

  async function handleDecode() {
    if (!data.vin || data.vin.length !== 17) {
      setDecodeError("VIN must be 17 characters");
      return;
    }
    setDecoding(true);
    setDecodeError(null);

    try {
      const res = await fetch(`/api/vin/${data.vin}`);
      const json = await res.json();

      if (!res.ok) {
        setDecodeError(json.error || "Decode failed");
        return;
      }

      const d = json.decoded as Record<string, string | number | null>;
      setData({
        year: (d.year as number) ?? data.year,
        make: (d.make as string) ?? data.make,
        model: (d.model as string) ?? data.model,
        trim: (d.trim as string) ?? data.trim,
        series: (d.series as string) ?? data.series,
        vehicle_type: (d.vehicle_type as string) ?? data.vehicle_type,
        body_class: (d.body_class as string) ?? data.body_class,
        doors: (d.doors as number) ?? data.doors,
        engine_hp: (d.engine_hp as string) ?? data.engine_hp,
        engine_cylinders: (d.engine_cylinders as string) ?? data.engine_cylinders,
        engine_displacement: (d.engine_displacement as string) ?? data.engine_displacement,
        fuel_type: (d.fuel_type as string) ?? data.fuel_type,
        transmission_style: (d.transmission_style as string) ?? data.transmission_style,
        drive_type: (d.drive_type as string) ?? data.drive_type,
      });
      setDecoded(true);
    } catch {
      setDecodeError("Network error");
    } finally {
      setDecoding(false);
    }
  }

  const hasVehicle = !!(data.year && data.make && data.model);
  const canProceed = hasVehicle;

  return (
    <div className="space-y-0">
      <div className="mb-10">
        <h2 className="text-heading-1 mb-1">
          {isSale ? "Vehicle Details" : "Lease Vehicle"}
        </h2>
        <p className="text-body text-muted-foreground">
          {isSale
            ? "Start with the year, then select make and model."
            : "Select the vehicle year, make, and model for the lease listing."}
        </p>
      </div>

      {/* ─── Section 1: Vehicle Selection (progressive) ─── */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-heading-4 mb-5">Vehicle Selection</h3>

        {/* Row 1: Year */}
        <div className="max-w-[200px]">
          <Label>Year</Label>
          <Select
            value={data.year ? String(data.year) : undefined}
            onValueChange={handleYearChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Make + Model (unlocks after year) */}
        <AnimatePresence>
          {data.year && (
            <motion.div {...reveal} className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Make</Label>
                <Combobox
                  value={data.make}
                  onValueChange={handleMakeChange}
                  options={makes}
                  placeholder="Search makes..."
                  searchPlaceholder="Type to filter makes..."
                  emptyText={loadingMakes ? "Loading..." : "No makes found."}
                  loading={loadingMakes}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Model</Label>
                <Combobox
                  value={data.model}
                  onValueChange={handleModelChange}
                  options={models}
                  placeholder={data.make ? "Search models..." : "Select a make first"}
                  searchPlaceholder="Type to filter models..."
                  emptyText={loadingModels ? "Loading..." : "No models found."}
                  loading={loadingModels}
                  disabled={!data.make}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 3: Trim (unlocks after model) */}
        <AnimatePresence>
          {data.model && (
            <motion.div {...reveal} className="max-w-sm">
              <div className="space-y-1.5">
                <Label>Trim</Label>
                <Input
                  placeholder="e.g. XSE, Sport, Limited"
                  value={data.trim}
                  onChange={(e) => setData({ trim: e.target.value })}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Section 2: VIN Decode (sale only, unlocks after vehicle selected) ─── */}
      <AnimatePresence>
        {isSale && hasVehicle && (
          <motion.div {...reveal}>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-heading-4">VIN Decode</h3>
                  <p className="text-caption text-muted-foreground">Optional — auto-fills specs from the VIN.</p>
                </div>
                {decoded && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <Check size={12} strokeWidth={ICON_STROKE_WIDTH} />
                    Decoded
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter 17-character VIN"
                  value={data.vin}
                  onChange={(e) => setData({ vin: e.target.value.toUpperCase() })}
                  maxLength={17}
                  className="font-mono tracking-wider"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDecode}
                  disabled={decoding || data.vin.length !== 17}
                  className="shrink-0 gap-2"
                >
                  {decoding ? (
                    <LoadingSpinner size={16} />
                  ) : (
                    <Search size={16} strokeWidth={ICON_STROKE_WIDTH} />
                  )}
                  Decode
                </Button>
              </div>
              {decodeError && (
                <p className="text-caption text-destructive mt-2">{decodeError}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Section 3: Additional Details (unlocks after vehicle selected) ─── */}
      <AnimatePresence>
        {hasVehicle && (
          <motion.div {...reveal}>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-heading-4 mb-5">Additional Details</h3>
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Vehicle Type</Label>
                  <Select
                    value={data.vehicle_type || undefined}
                    onValueChange={(v) => setData({ vehicle_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Doors</Label>
                  <Select
                    value={data.doors ? String(data.doors) : undefined}
                    onValueChange={(v) => setData({ doors: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5].map((d) => (
                        <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isSale && (
                  <>
                    <div className="space-y-1.5">
                      <Label>Stock #</Label>
                      <Input
                        placeholder="STK-001"
                        value={data.stock_number}
                        onChange={(e) => setData({ stock_number: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Mileage</Label>
                      <Input
                        type="number"
                        placeholder="25,000"
                        value={data.mileage ?? ""}
                        onChange={(e) => setData({ mileage: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={String(data.status)}
                    onValueChange={(v) => setData({ status: Number(v) as typeof data.status })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(VEHICLE_STATUSES.FOR_SALE)}>
                        {isSale ? "For Sale" : "Available"}
                      </SelectItem>
                      <SelectItem value={String(VEHICLE_STATUSES.COMING_SOON)}>Coming Soon</SelectItem>
                      <SelectItem value={String(VEHICLE_STATUSES.DREAM_BUILD)}>Dream Build</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue */}
      <AnimatePresence>
        {canProceed && (
          <motion.div {...reveal} className="flex justify-end pt-2">
            <Button size="lg" onClick={next}>
              Continue to Pricing
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
