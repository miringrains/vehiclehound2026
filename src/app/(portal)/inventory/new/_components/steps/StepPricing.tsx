"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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

export function StepPricing() {
  const { data, setData, next } = useWizard();
  const isSale = data.inventory_type === "sale";

  function numChange(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setData({ [key]: v ? Number(v) : null });
    };
  }

  function strChange(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setData({ [key]: e.target.value });
    };
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-1 mb-1">Pricing</h2>
        <p className="text-body text-muted-foreground">
          {isSale
            ? "Set your asking prices and dealer cost."
            : "Define the lease terms, payment, and fees."}
        </p>
      </div>

      {isSale ? (
        /* ─── SALE PRICING ─── */
        <>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-heading-4 mb-5">Customer Pricing</h3>
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <PriceField label="List / Online Price" value={data.online_price} onChange={numChange("online_price")} placeholder="29,999" />
              <PriceField label="Sale Price" value={data.sale_price} onChange={numChange("sale_price")} placeholder="28,500" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-heading-4 mb-5">Dealer Cost</h3>
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <PriceField label="MSRP" value={data.msrp} onChange={numChange("msrp")} placeholder="32,000" />
              <PriceField label="Purchase Price" value={data.purchase_price} onChange={numChange("purchase_price")} placeholder="24,000" />
            </div>
          </div>
        </>
      ) : (
        /* ─── LEASE PRICING ─── */
        <>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-heading-4 mb-5">Lease Terms</h3>
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <PriceField label="Monthly Payment" value={data.lease_payment} onChange={numChange("lease_payment")} placeholder="599" suffix="/mo" />

              <div className="space-y-1.5">
                <Label>Lease Term</Label>
                <Select
                  value={data.lease_term ? String(data.lease_term) : undefined}
                  onValueChange={(v) => setData({ lease_term: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {TERM_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Allowed Mileage</Label>
                <Select
                  value={data.lease_annual_mileage ? String(data.lease_annual_mileage) : undefined}
                  onValueChange={(v) => setData({ lease_annual_mileage: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mileage" />
                  </SelectTrigger>
                  <SelectContent>
                    {MILEAGE_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <PriceField label="Down Payment" value={data.lease_down_payment} onChange={numChange("lease_down_payment")} placeholder="2,500" />
              <PriceField label="MSRP" value={data.msrp} onChange={numChange("msrp")} placeholder="52,000" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-heading-4 mb-5">Fees</h3>
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <PriceField label="Broker Fee" value={data.broker_fee} onChange={numChange("broker_fee")} placeholder="1,995" />
              <PriceField label="Taxes & Fees" value={data.taxes_and_fees} onChange={numChange("taxes_and_fees")} placeholder="450" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-heading-4 mb-5">Lease Specification</h3>
            <div className="space-y-1.5">
              <Label>Additional Details</Label>
              <Input
                placeholder="e.g. Tier 1 credit required, 1st payment due at signing"
                value={data.lease_spec}
                onChange={strChange("lease_spec")}
              />
            </div>
          </div>
        </>
      )}

      {/* Location */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="max-w-sm space-y-1.5">
          <Label>Location Detail</Label>
          <Input
            placeholder="e.g. Main Lot, Bay 4"
            value={data.location_detail}
            onChange={strChange("location_detail")}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button size="lg" onClick={next}>
          Continue to Details
        </Button>
      </div>
    </div>
  );
}

function PriceField({
  label, value, onChange, placeholder, suffix,
}: {
  label: string; value: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        <Input
          type="number"
          step="0.01"
          placeholder={placeholder}
          value={value ?? ""}
          onChange={onChange}
          className="pl-7"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
