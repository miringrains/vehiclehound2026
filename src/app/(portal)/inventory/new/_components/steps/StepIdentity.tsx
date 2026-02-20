"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ICON_STROKE_WIDTH, VEHICLE_STATUSES } from "@/lib/constants";
import { vehicleTypes } from "@/config/vehicle-options";
import { useWizard } from "../WizardContext";

export function StepIdentity() {
  const { data, setData, next } = useWizard();
  const [decoding, setDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);

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
    } catch {
      setDecodeError("Network error");
    } finally {
      setDecoding(false);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-heading-1 mb-1">Vehicle Identity</h2>
        <p className="text-body text-muted-foreground">
          Enter the VIN to auto-fill, or fill in manually.
        </p>
      </div>

      {/* VIN Decode */}
      <div className="space-y-2">
        <Label htmlFor="vin">VIN</Label>
        <div className="flex gap-2">
          <Input
            id="vin"
            placeholder="1HGBH41JXMN109186"
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
          <p className="text-caption text-destructive">{decodeError}</p>
        )}
      </div>

      {/* Core fields */}
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Year" type="number" placeholder="2024" value={data.year ?? ""} onChange={(v) => setData({ year: v ? Number(v) : null })} />
        <Field label="Make" placeholder="Toyota" value={data.make} onChange={(v) => setData({ make: v })} />
        <Field label="Model" placeholder="Camry" value={data.model} onChange={(v) => setData({ model: v })} />
        <Field label="Trim" placeholder="XSE" value={data.trim} onChange={(v) => setData({ trim: v })} />
      </div>

      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Vehicle Type</Label>
          <Select value={data.vehicle_type || undefined} onValueChange={(v) => setData({ vehicle_type: v })}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Field label="Doors" type="number" placeholder="4" value={data.doors ?? ""} onChange={(v) => setData({ doors: v ? Number(v) : null })} />
        <Field label="Stock #" placeholder="STK-001" value={data.stock_number} onChange={(v) => setData({ stock_number: v })} />
        <Field label="Mileage" type="number" placeholder="25000" value={data.mileage ?? ""} onChange={(v) => setData({ mileage: v ? Number(v) : null })} />
      </div>

      {/* Status */}
      <div className="max-w-xs">
        <Label>Status</Label>
        <Select value={String(data.status)} onValueChange={(v) => setData({ status: Number(v) as typeof data.status })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={String(VEHICLE_STATUSES.FOR_SALE)}>For Sale</SelectItem>
            <SelectItem value={String(VEHICLE_STATUSES.COMING_SOON)}>Coming Soon</SelectItem>
            <SelectItem value={String(VEHICLE_STATUSES.DREAM_BUILD)}>Dream Build</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={next}>
          Continue to Pricing
        </Button>
      </div>
    </div>
  );
}

function Field({
  label, placeholder, value, onChange, type = "text",
}: {
  label: string; placeholder: string; value: string | number;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
