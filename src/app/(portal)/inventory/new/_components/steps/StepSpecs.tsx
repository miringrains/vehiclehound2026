"use client";

import { useState } from "react";
import { X, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import {
  fuelTypes, transmissionStyles, driveTypes, titleStatuses,
} from "@/config/vehicle-options";
import { useWizard } from "../WizardContext";

export function StepSpecs() {
  const { data, setData, next } = useWizard();
  const isSale = data.inventory_type === "sale";
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
    <div className="space-y-6">
      {/* Colors & Drivetrain */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1.5">
            <Label>Exterior Color</Label>
            <Input
              placeholder="e.g. Alpine White, Obsidian Black"
              value={data.exterior_color}
              onChange={(e) => setData({ exterior_color: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Interior Color</Label>
            <Input
              placeholder="e.g. Cognac Leather, Black"
              value={data.interior_color}
              onChange={(e) => setData({ interior_color: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-5 pt-5 border-t border-border">
          <SelectField label="Fuel Type" value={data.fuel_type} options={[...fuelTypes]} onChange={(v) => setData({ fuel_type: v })} />
          <SelectField label="Transmission" value={data.transmission_style} options={[...transmissionStyles]} onChange={(v) => setData({ transmission_style: v })} />
          <SelectField label="Drive Type" value={data.drive_type} options={[...driveTypes]} onChange={(v) => setData({ drive_type: v })} />
        </div>
      </div>

      {/* Engine */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label>Horsepower</Label>
            <Input placeholder="203" value={data.engine_hp} onChange={(e) => setData({ engine_hp: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Cylinders</Label>
            <Input placeholder="4" value={data.engine_cylinders} onChange={(e) => setData({ engine_cylinders: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Displacement</Label>
            <Input placeholder="2.5L" value={data.engine_displacement} onChange={(e) => setData({ engine_displacement: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Title Status — sale only */}
      {isSale && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="max-w-xs">
            <SelectField label="Title Status" value={data.title_status} options={[...titleStatuses]} onChange={(v) => setData({ title_status: v })} />
          </div>
        </div>
      )}

      {/* Features */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-heading-4 mb-4">Features</h3>
        <div className="flex gap-3">
          <Input
            placeholder="Type a feature and press Enter"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={handleFeatureKeyDown}
          />
          <Button type="button" variant="outline" onClick={addFeature} className="shrink-0 gap-1.5">
            <Plus size={14} strokeWidth={ICON_STROKE_WIDTH} />
            Add
          </Button>
        </div>
        {data.features.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {data.features.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/8 border border-primary/15 px-3 py-1.5 text-caption text-primary"
              >
                {f}
                <button
                  type="button"
                  onClick={() => removeFeature(f)}
                  className="rounded-full p-0.5 hover:bg-primary/15 transition-colors"
                >
                  <X size={12} strokeWidth={ICON_STROKE_WIDTH} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={next} className="gap-2">
          Continue
          <ArrowRight size={16} strokeWidth={ICON_STROKE_WIDTH} />
        </Button>
      </div>
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
