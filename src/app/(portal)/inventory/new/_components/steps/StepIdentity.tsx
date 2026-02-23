"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Check, ArrowRight, ArrowLeft, Zap } from "lucide-react";
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
  const { data, setData, next, back } = useWizard();
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
    const vin = data.vin.trim().toUpperCase();
    if (!vin || vin.length !== 17) {
      setDecodeError("VIN must be 17 characters");
      return;
    }
    setDecoding(true);
    setDecodeError(null);
    try {
      const res = await fetch(`/api/vin/${vin}`);
      const json = await res.json();
      if (!res.ok) { setDecodeError(json.error || "Decode failed"); return; }
      const d = json.decoded as Record<string, string | number | null>;
      setData({
        vin,
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

  function handleVinKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && data.vin.length === 17 && !decoding) {
      e.preventDefault();
      handleDecode();
    }
  }

  const hasVehicle = !!(data.year && data.make && data.model);

  return (
    <div className="space-y-6">
      {/* VIN-first flow for sale vehicles */}
      {isSale && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} strokeWidth={ICON_STROKE_WIDTH} className="text-primary" />
            <h3 className="text-heading-4">VIN Lookup</h3>
            {decoded && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
                <Check size={11} /> Decoded
              </span>
            )}
          </div>
          <p className="text-[0.8125rem] text-muted-foreground mb-3">
            Enter the VIN to auto-fill vehicle details, or skip and fill in manually below.
          </p>
          <div className="flex gap-3">
            <Input
              placeholder="Enter 17-character VIN"
              value={data.vin}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
                setData({ vin: v });
                setDecoded(false);
                setDecodeError(null);
              }}
              onKeyDown={handleVinKeyDown}
              maxLength={17}
              className="font-mono tracking-wider"
              autoFocus
            />
            <Button
              type="button"
              onClick={handleDecode}
              disabled={decoding || data.vin.length !== 17}
              className="shrink-0 gap-2"
            >
              {decoding ? <LoadingSpinner size={16} /> : <Search size={16} strokeWidth={ICON_STROKE_WIDTH} />}
              {decoding ? "Decoding..." : "Decode"}
            </Button>
          </div>
          {decodeError && <p className="text-caption text-destructive mt-2">{decodeError}</p>}
          {data.vin.length > 0 && data.vin.length < 17 && (
            <p className="text-[0.6875rem] text-muted-foreground mt-1.5">
              {17 - data.vin.length} character{17 - data.vin.length !== 1 ? "s" : ""} remaining
            </p>
          )}

          {/* Decoded summary */}
          <AnimatePresence>
            {decoded && hasVehicle && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 rounded-lg bg-muted/40 border border-border/50 p-3"
              >
                <p className="text-[0.8125rem] font-medium">
                  {data.year} {data.make} {data.model}
                  {data.trim && <span className="font-normal text-muted-foreground"> {data.trim}</span>}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-[0.6875rem] text-muted-foreground">
                  {data.vehicle_type && <span>{data.vehicle_type}</span>}
                  {data.engine_hp && <span>{data.engine_hp} HP</span>}
                  {data.engine_cylinders && <span>{data.engine_cylinders} cyl</span>}
                  {data.fuel_type && <span>{data.fuel_type}</span>}
                  {data.transmission_style && <span>{data.transmission_style}</span>}
                  {data.drive_type && <span>{data.drive_type}</span>}
                  {data.doors && <span>{data.doors} doors</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Vehicle Selection — manual entry or to override decoded values */}
      <div className="rounded-xl border border-border bg-card p-6">
        {isSale && (
          <p className="text-[0.75rem] text-muted-foreground mb-4">
            {decoded ? "Review and adjust the decoded details if needed." : "Or enter vehicle details manually."}
          </p>
        )}
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
      </div>

      {/* VIN field for lease vehicles (non-prominent, in the details section) */}

      {/* Additional Details */}
      <AnimatePresence>
        {hasVehicle && (
          <motion.div {...reveal}>
            <div className="rounded-xl border border-border bg-card p-6">
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
                  {/* VIN field if not already entered above */}
                  {!data.vin && (
                    <div className="space-y-1.5">
                      <Label>VIN</Label>
                      <Input
                        placeholder="17-character VIN (optional)"
                        value={data.vin}
                        onChange={(e) => setData({ vin: e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "") })}
                        maxLength={17}
                        className="font-mono tracking-wider max-w-md"
                      />
                    </div>
                  )}
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
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-3">
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
                  <div className="space-y-1.5">
                    <Label>VIN</Label>
                    <Input
                      placeholder="17-character VIN (optional)"
                      value={data.vin}
                      onChange={(e) => setData({ vin: e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "") })}
                      maxLength={17}
                      className="font-mono tracking-wider max-w-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasVehicle && (
          <motion.div {...reveal} className="flex justify-between">
            <Button variant="outline" size="lg" onClick={back} className="gap-2">
              <ArrowLeft size={16} strokeWidth={ICON_STROKE_WIDTH} />
              Back
            </Button>
            <Button size="lg" onClick={next} className="gap-2">
              Continue
              <ArrowRight size={16} strokeWidth={ICON_STROKE_WIDTH} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
