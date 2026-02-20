"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizard } from "../WizardContext";

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
    <div className="space-y-10">
      <div>
        <h2 className="text-heading-1 mb-1">Pricing</h2>
        <p className="text-body text-muted-foreground">
          {isSale
            ? "Set your asking price and dealer cost."
            : "Define the lease terms and fees."}
        </p>
      </div>

      {isSale ? (
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <PriceField label="Online Price" value={data.online_price} onChange={numChange("online_price")} placeholder="29,999" />
          <PriceField label="Sale Price" value={data.sale_price} onChange={numChange("sale_price")} placeholder="28,500" />
          <PriceField label="MSRP" value={data.msrp} onChange={numChange("msrp")} placeholder="32,000" />
          <PriceField label="Purchase Price" value={data.purchase_price} onChange={numChange("purchase_price")} placeholder="24,000" />
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <PriceField label="Monthly Payment" value={data.lease_payment} onChange={numChange("lease_payment")} placeholder="599" suffix="/mo" />
          <div className="space-y-1.5">
            <Label>Lease Term</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="36"
                value={data.lease_term ?? ""}
                onChange={numChange("lease_term")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">
                months
              </span>
            </div>
          </div>
          <PriceField label="MSRP" value={data.msrp} onChange={numChange("msrp")} placeholder="52,000" />
          <PriceField label="Broker Fee" value={data.broker_fee} onChange={numChange("broker_fee")} placeholder="1,995" />
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Lease Specification</Label>
            <Input
              placeholder="e.g. 10k miles/year, $0 down"
              value={data.lease_spec}
              onChange={strChange("lease_spec")}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5 max-w-sm">
        <Label>Location Detail</Label>
        <Input
          placeholder="e.g. Main Lot, Bay 4"
          value={data.location_detail}
          onChange={strChange("location_detail")}
        />
      </div>

      <div className="flex justify-end pt-4">
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
