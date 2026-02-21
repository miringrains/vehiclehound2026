"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Check, ArrowRight } from "lucide-react";
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
  animate: { opacity: 1, height: "auto", marginTop: 28 },
  exit: { opacity: 0, height: 0, marginTop: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

function SectionCard({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-start gap-3 px-6 pt-5 pb-4">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
          {number}
        </span>
        <div className="min-w-0">
          <h3 className="text-heading-4">{title}</h3>
          {subtitle && (
            <p className="text-caption text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="border-t border-border px-6 py-5">
        {children}
      </div>
    </div>
  );
}

export function StepIdentity() {
  const { data, setData, next } = useWizard();
  const isSale = data.inventory_type === "sale";

  const [makes, setMakes] = useState<string[]>([]);
  const [popularMakeCount, setPopularMakeCount] = useState(0);
  const [models, setModels] = useState<string[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [decoding, setDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decoded, setDecoded] = useState(false);

  useEffect(() => {
    if (!data.year) { setMakes([]); return; }
    let cancelled = false;
    setLoadingMakes(true);
    fetch(`/api/vehicles/makes?year=${data.year}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setMakes(json.makes || []);
          setPopularMakeCount(json.popular_count || 0);
        }
      })
      .catch(() => { if (!cancelled) setMakes([]); })
      .finally(() => { if (!cancelled) setLoadingMakes(false); });
    return () => { cancelled = true; };
  }, [data.year]);

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
      if (!res.ok) { setDecodeError(json.error || "Decode failed"); return; }
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

  return (
    <div className="space-y-0">
      {/* Step header */}
      <div className="mb-8">
        <p className="text-overline text-primary mb-2">STEP 1 OF 4</p>
        <h2 className="text-heading-1 mb-1">
          {isSale ? "Vehicle Details" : "Lease Vehicle"}
        </h2>
        <p className="text-body text-muted-foreground">
          {isSale
            ? "Start with the year, then select make and model."
            : "Select the vehicle year, make, and model for the lease listing."}
        </p>
      </div>

      {/* Vehicle Selection */}
      <SectionCard number="01" title="Vehicle Selection" subtitle="Year, make, model, and trim">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Select value={data.year ? String(data.year) : undefined} onValueChange={handleYearChange}>
              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Make</Label>
            <Combobox
              value={data.make}
              onValueChange={handleMakeChange}
              options={makes}
              placeholder="Select make"
              searchPlaceholder="Type to filter..."
              emptyText={loadingMakes ? "Loading..." : "No makes found."}
              loading={loadingMakes}
              disabled={!data.year}
              popularCount={popularMakeCount}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Model</Label>
            <Combobox
              value={data.model}
              onValueChange={handleModelChange}
              options={models}
              placeholder={data.make ? "Select model" : "Select make first"}
              searchPlaceholder="Type to filter..."
              emptyText={loadingModels ? "Loading..." : "No models found."}
              loading={loadingModels}
              disabled={!data.make}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Trim</Label>
            <Input
              placeholder="e.g. XSE, Sport"
              value={data.trim}
              onChange={(e) => setData({ trim: e.target.value })}
              disabled={!data.model}
            />
          </div>
        </div>
      </SectionCard>

      {/* VIN Decode (sale only) */}
      <AnimatePresence>
        {isSale && hasVehicle && (
          <motion.div {...reveal}>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                    02
                  </span>
                  <div>
                    <h3 className="text-heading-4">VIN Decode</h3>
                    <p className="text-caption text-muted-foreground mt-0.5">Optional — auto-fills specs from the VIN</p>
                  </div>
                </div>
                {decoded && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                    <Check size={12} strokeWidth={ICON_STROKE_WIDTH} /> Decoded
                  </span>
                )}
              </div>
              <div className="border-t border-border px-6 py-5">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter 17-character VIN"
                    value={data.vin}
                    onChange={(e) => setData({ vin: e.target.value.toUpperCase() })}
                    maxLength={17}
                    className="font-mono tracking-wider"
                  />
                  <Button type="button" variant="outline" onClick={handleDecode} disabled={decoding || data.vin.length !== 17} className="shrink-0 gap-2">
                    {decoding ? <LoadingSpinner size={16} /> : <Search size={16} strokeWidth={ICON_STROKE_WIDTH} />}
                    Decode
                  </Button>
                </div>
                {decodeError && <p className="text-caption text-destructive mt-2">{decodeError}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Additional Details */}
      <AnimatePresence>
        {hasVehicle && (
          <motion.div {...reveal}>
            <SectionCard
              number={isSale ? "03" : "02"}
              title="Additional Details"
              subtitle="Vehicle type, status, and other info"
            >
              {isSale ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
                    <div className="space-y-1.5">
                      <Label>Vehicle Type</Label>
                      <Select value={data.vehicle_type || undefined} onValueChange={(v) => setData({ vehicle_type: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{vehicleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Doors</Label>
                      <Select value={data.doors ? String(data.doors) : undefined} onValueChange={(v) => setData({ doors: Number(v) })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{[2, 3, 4, 5].map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Stock #</Label>
                      <Input placeholder="STK-001" value={data.stock_number} onChange={(e) => setData({ stock_number: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Mileage</Label>
                      <Input type="number" placeholder="25,000" value={data.mileage ?? ""} onChange={(e) => setData({ mileage: e.target.value ? Number(e.target.value) : null })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select value={String(data.status)} onValueChange={(v) => setData({ status: Number(v) as typeof data.status })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={String(VEHICLE_STATUSES.AVAILABLE)}>Available</SelectItem>
                          <SelectItem value={String(VEHICLE_STATUSES.PENDING)}>Pending</SelectItem>
                          <SelectItem value={String(VEHICLE_STATUSES.IN_TRANSIT)}>In Transit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <Label>Vehicle Type</Label>
                    <Select value={data.vehicle_type || undefined} onValueChange={(v) => setData({ vehicle_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{vehicleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Doors</Label>
                    <Select value={data.doors ? String(data.doors) : undefined} onValueChange={(v) => setData({ doors: Number(v) })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{[2, 3, 4, 5].map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={String(data.status)} onValueChange={(v) => setData({ status: Number(v) as typeof data.status })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={String(VEHICLE_STATUSES.AVAILABLE)}>Available</SelectItem>
                        <SelectItem value={String(VEHICLE_STATUSES.PENDING)}>Pending</SelectItem>
                        <SelectItem value={String(VEHICLE_STATUSES.IN_TRANSIT)}>In Transit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasVehicle && (
          <motion.div {...reveal} className="flex justify-end pt-2">
            <Button size="lg" onClick={next} className="gap-2">
              Continue to Pricing
              <ArrowRight size={16} strokeWidth={ICON_STROKE_WIDTH} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
