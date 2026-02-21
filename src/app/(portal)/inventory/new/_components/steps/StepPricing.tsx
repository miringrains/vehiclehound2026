"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { useWizard } from "../WizardContext";

const MILEAGE_OPTIONS = [
  { value: 7500, label: "7,500 mi/yr" },
  { value: 10000, label: "10,000 mi/yr" },
  { value: 12000, label: "12,000 mi/yr" },
  { value: 15000, label: "15,000 mi/yr" },
];

const TERM_OPTIONS = [
  { value: 24, label: "24 months" },
  { value: 27, label: "27 months" },
  { value: 30, label: "30 months" },
  { value: 33, label: "33 months" },
  { value: 36, label: "36 months" },
  { value: 39, label: "39 months" },
  { value: 42, label: "42 months" },
  { value: 48, label: "48 months" },
];

const LOCATION_OPTIONS = [
  "National",
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

export function StepPricing() {
  const { data, setData, next } = useWizard();
  const isSale = data.inventory_type === "sale";
  const [errors, setErrors] = useState<Record<string, string>>({});

  function numChange(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setData({ [key]: v ? Number(v) : null });
      setErrors((prev) => ({ ...prev, [key]: "" }));
    };
  }

  function validateAndContinue() {
    if (!isSale) {
      const errs: Record<string, string> = {};
      if (!data.lease_payment) errs.lease_payment = "Required";
      if (!data.lease_term) errs.lease_term = "Required";
      if (!data.lease_annual_mileage) errs.lease_annual_mileage = "Required";
      if (!data.lease_down_payment && data.lease_down_payment !== 0) errs.lease_down_payment = "Required";
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
    }
    next();
  }

  return (
    <div className="space-y-7">
      {/* Step header */}
      <div>
        <p className="text-overline text-primary mb-2">STEP 2 OF 4</p>
        <h2 className="text-heading-1 mb-1">Pricing</h2>
        <p className="text-body text-muted-foreground">
          {isSale
            ? "Set your asking prices and dealer cost."
            : "Define the lease terms and payment."}
        </p>
      </div>

      {isSale ? (
        <>
          {/* Customer Pricing */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-start gap-3 px-6 pt-5 pb-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                01
              </span>
              <div>
                <h3 className="text-heading-4">Customer Pricing</h3>
                <p className="text-caption text-muted-foreground mt-0.5">What the buyer sees</p>
              </div>
            </div>
            <div className="border-t border-border px-6 py-5">
              <div className="grid grid-cols-2 gap-6">
                <PriceField label="List / Online Price" value={data.online_price} onChange={numChange("online_price")} placeholder="29,999" />
                <PriceField label="Sale Price" value={data.sale_price} onChange={numChange("sale_price")} placeholder="28,500" />
              </div>
            </div>
          </div>

          {/* Dealer Cost */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-start gap-3 px-6 pt-5 pb-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground mt-0.5">
                02
              </span>
              <div>
                <h3 className="text-heading-4">Dealer Cost</h3>
                <p className="text-caption text-muted-foreground mt-0.5">Internal pricing — not shown to customers</p>
              </div>
            </div>
            <div className="border-t border-border px-6 py-5">
              <div className="grid grid-cols-2 gap-6">
                <PriceField label="MSRP" value={data.msrp} onChange={numChange("msrp")} placeholder="32,000" />
                <PriceField label="Purchase Price" value={data.purchase_price} onChange={numChange("purchase_price")} placeholder="24,000" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-start gap-3 px-6 pt-5 pb-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
              01
            </span>
            <div>
              <h3 className="text-heading-4">Lease Terms</h3>
              <p className="text-caption text-muted-foreground mt-0.5">Monthly payment, term length, and mileage</p>
            </div>
          </div>
          <div className="border-t border-border px-6 py-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Monthly Payment <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number" step="0.01" placeholder="599"
                    value={data.lease_payment ?? ""}
                    onChange={numChange("lease_payment")}
                    className="pl-7"
                  />
                </div>
                {errors.lease_payment && <p className="text-caption text-destructive">{errors.lease_payment}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Term <span className="text-destructive">*</span></Label>
                <Select
                  value={data.lease_term ? String(data.lease_term) : undefined}
                  onValueChange={(v) => { setData({ lease_term: Number(v) }); setErrors((p) => ({ ...p, lease_term: "" })); }}
                >
                  <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                  <SelectContent>
                    {TERM_OPTIONS.map((t) => <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.lease_term && <p className="text-caption text-destructive">{errors.lease_term}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Mileage <span className="text-destructive">*</span></Label>
                <Select
                  value={data.lease_annual_mileage ? String(data.lease_annual_mileage) : undefined}
                  onValueChange={(v) => { setData({ lease_annual_mileage: Number(v) }); setErrors((p) => ({ ...p, lease_annual_mileage: "" })); }}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {MILEAGE_OPTIONS.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.lease_annual_mileage && <p className="text-caption text-destructive">{errors.lease_annual_mileage}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Due at Signing <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number" step="0.01" placeholder="2,999"
                    value={data.lease_down_payment ?? ""}
                    onChange={numChange("lease_down_payment")}
                    className="pl-7"
                  />
                </div>
                {errors.lease_down_payment && <p className="text-caption text-destructive">{errors.lease_down_payment}</p>}
              </div>
            </div>

            <div className="border-t border-border mt-5 pt-5">
              <div className="grid grid-cols-2 gap-6">
                <PriceField label="MSRP" value={data.msrp} onChange={numChange("msrp")} placeholder="52,000" />
                <PriceField label="Taxes & Fees" value={data.taxes_and_fees} onChange={numChange("taxes_and_fees")} placeholder="450" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-start gap-3 px-6 pt-5 pb-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground mt-0.5">
            {isSale ? "03" : "02"}
          </span>
          <div>
            <h3 className="text-heading-4">Location</h3>
            <p className="text-caption text-muted-foreground mt-0.5">Where is this vehicle available?</p>
          </div>
        </div>
        <div className="border-t border-border px-6 py-5">
          <div className="max-w-xs">
            <div className="space-y-1.5">
              <Label>State / Region</Label>
              <Select
                value={data.location_detail || undefined}
                onValueChange={(v) => setData({ location_detail: v })}
              >
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button size="lg" onClick={validateAndContinue} className="gap-2">
          Continue to Details
          <ArrowRight size={16} strokeWidth={ICON_STROKE_WIDTH} />
        </Button>
      </div>
    </div>
  );
}

function PriceField({
  label, value, onChange, placeholder,
}: {
  label: string; value: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
        <Input type="number" step="0.01" placeholder={placeholder} value={value ?? ""} onChange={onChange} className="pl-7" />
      </div>
    </div>
  );
}
