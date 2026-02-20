"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import {
  fuelTypes, transmissionStyles, driveTypes, titleStatuses, defaultColors,
} from "@/config/vehicle-options";
import { useWizard } from "../WizardContext";

export function StepSpecs() {
  const { data, setData, next } = useWizard();
  const [featureInput, setFeatureInput] = useState("");

  function addFeature() {
    const tag = featureInput.trim();
    if (tag && !data.features.includes(tag)) {
      setData({ features: [...data.features, tag] });
    }
    setFeatureInput("");
  }

  function removeFeature(tag: string) {
    setData({ features: data.features.filter((f) => f !== tag) });
  }

  function handleFeatureKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFeature();
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-heading-1 mb-1">Specs & Details</h2>
        <p className="text-body text-muted-foreground">
          Engine, drivetrain, colors, and features.
        </p>
      </div>

      {/* Engine & Drivetrain */}
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Horsepower" placeholder="203" value={data.engine_hp} onChange={(v) => setData({ engine_hp: v })} />
        <Field label="Cylinders" placeholder="4" value={data.engine_cylinders} onChange={(v) => setData({ engine_cylinders: v })} />
        <Field label="Displacement" placeholder="2.5L" value={data.engine_displacement} onChange={(v) => setData({ engine_displacement: v })} />

        <SelectField label="Fuel Type" value={data.fuel_type} options={[...fuelTypes]} onChange={(v) => setData({ fuel_type: v })} />
        <SelectField label="Transmission" value={data.transmission_style} options={[...transmissionStyles]} onChange={(v) => setData({ transmission_style: v })} />
        <SelectField label="Drive Type" value={data.drive_type} options={[...driveTypes]} onChange={(v) => setData({ drive_type: v })} />
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <h3 className="text-heading-4">Colors</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <ColorPicker
            label="Exterior"
            value={data.exterior_color}
            onChange={(v) => setData({ exterior_color: v })}
          />
          <ColorPicker
            label="Interior"
            value={data.interior_color}
            onChange={(v) => setData({ interior_color: v })}
          />
        </div>
      </div>

      {/* Title Status */}
      <div className="max-w-xs">
        <SelectField label="Title Status" value={data.title_status} options={[...titleStatuses]} onChange={(v) => setData({ title_status: v })} />
      </div>

      {/* Features */}
      <div className="space-y-3">
        <Label>Features</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Type a feature and press Enter"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={handleFeatureKeyDown}
          />
          <Button type="button" variant="outline" onClick={addFeature} className="shrink-0">
            Add
          </Button>
        </div>
        {data.features.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {data.features.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-caption text-primary"
              >
                {f}
                <button
                  type="button"
                  onClick={() => removeFeature(f)}
                  className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                >
                  <X size={12} strokeWidth={ICON_STROKE_WIDTH} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={next}>
          Continue to Photos
        </Button>
      </div>
    </div>
  );
}

function Field({
  label, placeholder, value, onChange,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function ColorPicker({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {defaultColors.map(({ label: colorLabel, hex }) => (
          <button
            key={hex}
            type="button"
            title={colorLabel}
            onClick={() => onChange(colorLabel)}
            className={cn(
              "h-8 w-8 rounded-full border-2 transition-all duration-150",
              value === colorLabel
                ? "border-primary scale-110 ring-2 ring-primary/30"
                : "border-border hover:scale-105"
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
      <Input
        placeholder="Or type a custom color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-48"
      />
    </div>
  );
}
