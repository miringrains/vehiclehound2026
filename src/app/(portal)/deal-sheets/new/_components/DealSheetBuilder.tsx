"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Copy,
  Trash2,
  Download,
  Save,
  Search,
  Car,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import {
  DealOption,
  DealDefaults,
  CreditTier,
  DEFAULT_DEAL_DEFAULTS,
  createBlankOption,
  calculateFinance,
  calculateLease,
} from "@/lib/deal-calc";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";

type CustomerOption = {
  id: string;
  first_name: string;
  last_name: string;
};

type VehicleOption = {
  id: string;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  stock_number?: string | null;
  online_price?: number | null;
  sale_price?: number | null;
  msrp?: number | null;
  mileage?: number | null;
  vin?: string | null;
  exterior_color?: string | null;
};

function fmtMoney(v: number) {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtMoneyShort(v: number) {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function OptionCard({
  option,
  onChange,
  onRemove,
  onDuplicate,
  defaults,
  canRemove,
}: {
  option: DealOption;
  onChange: (opt: DealOption) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  defaults: DealDefaults;
  canRemove: boolean;
}) {
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleResults, setVehicleResults] = useState<VehicleOption[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const result = useMemo(() => {
    return option.type === "finance"
      ? calculateFinance(option)
      : calculateLease(option);
  }, [option]);

  const monthly = "monthly_payment" in result ? result.monthly_payment : 0;

  const searchVehicles = useCallback(async (q: string) => {
    const params = new URLSearchParams({ limit: "6" });
    if (q.trim()) params.set("search", q);
    const res = await fetch(`/api/vehicles?${params}`);
    if (res.ok) {
      const data = await res.json();
      setVehicleResults(data.vehicles || []);
    }
  }, []);

  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => searchVehicles(vehicleSearch), vehicleSearch ? 300 : 0);
      return () => clearTimeout(t);
    }
  }, [vehicleSearch, searchVehicles, showSearch]);

  const selectVehicle = (v: VehicleOption) => {
    const selling = v.online_price || v.sale_price || 0;
    const msrp = v.msrp || selling;
    onChange({
      ...option,
      vehicle_id: v.id,
      vehicle_snapshot: {
        year: v.year,
        make: v.make,
        model: v.model,
        trim: v.trim,
        vin: v.vin,
        stock_number: v.stock_number,
        mileage: v.mileage,
        exterior_color: v.exterior_color,
        msrp: v.msrp,
      },
      selling_price: selling,
      msrp,
    });
    setShowSearch(false);
    setVehicleSearch("");
    setVehicleResults([]);
  };

  const numField = (label: string, key: keyof DealOption, opts?: { prefix?: string; step?: string }) => (
    <div>
      <Label className="text-[0.6875rem] text-muted-foreground">{label}</Label>
      <div className="relative mt-1">
        {opts?.prefix && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[0.8125rem] text-muted-foreground">
            {opts.prefix}
          </span>
        )}
        <Input
          type="number"
          step={opts?.step || "1"}
          value={option[key] as number}
          onChange={(e) => onChange({ ...option, [key]: Number(e.target.value) })}
          className={opts?.prefix ? "pl-5" : ""}
        />
      </div>
    </div>
  );

  const snap = option.vehicle_snapshot;

  return (
    <Card className="min-w-[280px] flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Input
            value={option.label}
            onChange={(e) => onChange({ ...option, label: e.target.value })}
            className="h-7 w-28 text-[0.8125rem] font-semibold"
          />
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} title="Duplicate">
            <Copy size={13} />
          </Button>
          {canRemove && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove} title="Remove">
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehicle selector */}
        <div>
          {snap ? (
            <div className="flex items-center gap-2 rounded-lg border border-border p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Car size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.8125rem] font-medium truncate">
                  {snap.year} {snap.make} {snap.model}
                </p>
                <p className="text-[0.6875rem] text-muted-foreground truncate">
                  {snap.trim} {snap.stock_number && `· #${snap.stock_number}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[0.6875rem]"
                onClick={() => setShowSearch(true)}
              >
                Change
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setShowSearch(true)}
            >
              <Search size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-2" />
              Select Vehicle
            </Button>
          )}

          {showSearch && (
            <div className="mt-2 rounded-lg border border-border p-2">
              <Input
                placeholder="Search inventory..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                autoFocus
              />
              {vehicleResults.length > 0 && (
                <div className="mt-1.5 max-h-36 overflow-y-auto space-y-0.5">
                  {vehicleResults.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => selectVehicle(v)}
                      className="w-full text-left rounded-md px-2.5 py-1.5 text-[0.8125rem] hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">
                        {v.year} {v.make} {v.model}
                      </span>
                      {v.trim && <span className="text-muted-foreground"> {v.trim}</span>}
                      {v.stock_number && <span className="text-muted-foreground"> · #{v.stock_number}</span>}
                    </button>
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 w-full text-[0.6875rem]"
                onClick={() => { setShowSearch(false); setVehicleSearch(""); setVehicleResults([]); }}
              >
                Close
              </Button>
            </div>
          )}
        </div>

        {/* Type toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["finance", "lease"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ ...option, type: t })}
              className={`flex-1 px-3 py-1.5 text-[0.8125rem] font-medium capitalize transition-colors ${
                option.type === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Monthly payment result */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
          <p className="text-heading-1 text-primary">{fmtMoney(monthly)}</p>
          <p className="text-[0.6875rem] text-muted-foreground">
            per month · {option.type === "finance" ? `${option.term_months}mo` : `${option.lease_term}mo`}
          </p>
          {option.type === "finance" && "amount_financed" in result && (
            <p className="text-[0.6875rem] text-muted-foreground mt-1">
              {fmtMoneyShort(result.amount_financed)} financed · {fmtMoneyShort(result.total_cost)} total
            </p>
          )}
          {option.type === "lease" && "due_at_signing" in result && (
            <p className="text-[0.6875rem] text-muted-foreground mt-1">
              {fmtMoneyShort(result.due_at_signing)} due at signing
            </p>
          )}
        </div>

        {/* Price fields */}
        <div className="grid grid-cols-2 gap-2">
          {numField("Selling Price", "selling_price", { prefix: "$" })}
          {numField("MSRP", "msrp", { prefix: "$" })}
          {numField("Down Payment", "down_payment", { prefix: "$" })}
          {numField("Trade Value", "trade_value", { prefix: "$" })}
          {numField("Trade Payoff", "trade_payoff", { prefix: "$" })}
          {numField("Rebates", "rebates", { prefix: "$" })}
        </div>

        {/* Fees */}
        <div className="grid grid-cols-2 gap-2">
          {numField("Doc Fee", "doc_fee", { prefix: "$" })}
          {numField("Title/Reg Fee", "title_reg_fee", { prefix: "$" })}
          {numField("Tax Rate %", "tax_rate", { step: "0.001" })}
          {numField("Other Fees", "other_fees", { prefix: "$" })}
        </div>

        {/* Type-specific fields */}
        {option.type === "finance" ? (
          <div className="grid grid-cols-2 gap-2">
            {numField("APR %", "apr", { step: "0.01" })}
            {numField("Term (months)", "term_months")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {numField("Money Factor", "money_factor", { step: "0.0001" })}
            {numField("Residual %", "residual_pct", { step: "1" })}
            {numField("Lease Term", "lease_term")}
            {numField("Annual Mileage", "annual_mileage")}
            {numField("Acquisition Fee", "acquisition_fee", { prefix: "$" })}
            {numField("Security Deposit", "security_deposit", { prefix: "$" })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DealSheetBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCustomerId = searchParams.get("customer");

  const [defaults, setDefaults] = useState<DealDefaults>(DEFAULT_DEAL_DEFAULTS);
  const [selectedTier, setSelectedTier] = useState<CreditTier | null>(null);
  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(prefilledCustomerId);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [options, setOptions] = useState<DealOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load dealership defaults
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/dealership");
      if (res.ok) {
        const { dealership } = await res.json();
        if (dealership?.deal_defaults) {
          setDefaults({ ...DEFAULT_DEAL_DEFAULTS, ...dealership.deal_defaults });
        }
      }
    })();
  }, []);

  // Initialize first option once defaults load
  useEffect(() => {
    if (options.length === 0) {
      const tier = defaults.credit_tiers?.[0] || null;
      setSelectedTier(tier);
      setOptions([createBlankOption("opt_1", "Option A", defaults, tier)]);
    }
  }, [defaults]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load prefilled customer
  useEffect(() => {
    if (prefilledCustomerId) {
      (async () => {
        const res = await fetch(`/api/customers/${prefilledCustomerId}`);
        if (res.ok) {
          const { customer } = await res.json();
          setSelectedCustomer({
            id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
          });
          setTitle(`Deal Sheet - ${customer.first_name} ${customer.last_name} - ${new Date().toLocaleDateString()}`);
        }
      })();
    }
  }, [prefilledCustomerId]);

  const searchCustomers = useCallback(async (q: string) => {
    if (!q.trim()) { setCustomerResults([]); return; }
    const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}&limit=6`);
    if (res.ok) {
      const data = await res.json();
      setCustomerResults(data.customers?.map((c: CustomerOption) => ({
        id: c.id, first_name: c.first_name, last_name: c.last_name,
      })) || []);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchCustomers(customerSearch), 300);
    return () => clearTimeout(t);
  }, [customerSearch, searchCustomers]);

  const handleTierChange = (tierName: string) => {
    const tier = defaults.credit_tiers.find((t) => t.name === tierName) || null;
    setSelectedTier(tier);
    if (tier) {
      setOptions((prev) =>
        prev.map((o) => ({
          ...o,
          credit_tier: tier.name,
          apr: o.type === "finance" ? tier.apr : o.apr,
          money_factor: o.type === "lease" ? tier.money_factor : o.money_factor,
        }))
      );
    }
  };

  const handleOptionChange = (idx: number, opt: DealOption) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? opt : o)));
  };

  const addOption = () => {
    if (options.length >= 4) return;
    const labels = ["A", "B", "C", "D"];
    const newOpt = createBlankOption(
      `opt_${Date.now()}`,
      `Option ${labels[options.length] || String(options.length + 1)}`,
      defaults,
      selectedTier
    );
    setOptions([...options, newOpt]);
  };

  const duplicateOption = (idx: number) => {
    if (options.length >= 4) return;
    const labels = ["A", "B", "C", "D"];
    const dup = {
      ...options[idx],
      id: `opt_${Date.now()}`,
      label: `Option ${labels[options.length] || String(options.length + 1)}`,
    };
    setOptions([...options, dup]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      customer_id: customerId,
      title: title || `Deal Sheet - ${new Date().toLocaleDateString()}`,
      options,
      status: "draft",
    };
    const res = await fetch("/api/deal-sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { deal_sheet } = await res.json();
      router.push(`/deal-sheets/${deal_sheet.id}`);
    }
    setSaving(false);
  };

  const handleSaveAndDownload = async () => {
    setGenerating(true);
    const body = {
      customer_id: customerId,
      title: title || `Deal Sheet - ${new Date().toLocaleDateString()}`,
      options,
      status: "draft",
    };
    const res = await fetch("/api/deal-sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { deal_sheet } = await res.json();
      const pdfRes = await fetch(`/api/deal-sheets/${deal_sheet.id}/pdf`, { method: "POST" });
      if (pdfRes.ok) {
        const blob = await pdfRes.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `deal-sheet-${deal_sheet.id.slice(0, 8)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      router.push(`/deal-sheets/${deal_sheet.id}`);
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={16} strokeWidth={ICON_STROKE_WIDTH} />
        </Button>
        <div className="flex-1">
          <PageHeader title="New Deal Sheet">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} disabled={saving}>
                <Save size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" />
                {saving ? "Saving..." : "Save Draft"}
              </Button>
              <Button onClick={handleSaveAndDownload} disabled={generating}>
                <Download size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" />
                {generating ? "Generating..." : "Generate PDF"}
              </Button>
            </div>
          </PageHeader>
        </div>
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        {/* Top config */}
        <Card>
          <CardContent className="pt-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Customer */}
              <div>
                <Label>Customer</Label>
                <div className="mt-1.5">
                  {selectedCustomer ? (
                    <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
                      <span className="text-[0.8125rem] flex-1">
                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[0.6875rem]"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setCustomerId(null);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        placeholder="Search customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                      {customerResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-background shadow-lg max-h-48 overflow-y-auto">
                          {customerResults.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCustomerId(c.id);
                                setCustomerSearch("");
                                setCustomerResults([]);
                                if (!title) {
                                  setTitle(`Deal Sheet - ${c.first_name} ${c.last_name} - ${new Date().toLocaleDateString()}`);
                                }
                              }}
                              className="w-full text-left px-3 py-2 text-[0.8125rem] hover:bg-muted transition-colors"
                            >
                              {c.first_name} {c.last_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="mt-1.5"
                />
              </div>

              {/* Credit tier */}
              <div>
                <Label>Credit Tier</Label>
                <Select
                  value={selectedTier?.name || ""}
                  onValueChange={handleTierChange}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaults.credit_tiers.map((t) => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.name} — {t.apr}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Options grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex gap-4 overflow-x-auto pb-2"
      >
        {options.map((opt, idx) => (
          <motion.div key={opt.id} variants={staggerItem} className="min-w-[280px] flex-1">
            <OptionCard
              option={opt}
              onChange={(o) => handleOptionChange(idx, o)}
              onRemove={() => removeOption(idx)}
              onDuplicate={() => duplicateOption(idx)}
              defaults={defaults}
              canRemove={options.length > 1}
            />
          </motion.div>
        ))}

        {options.length < 4 && (
          <motion.div variants={staggerItem} className="min-w-[200px] flex items-stretch">
            <button
              onClick={addOption}
              className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-foreground/20 transition-colors p-8 text-muted-foreground hover:text-foreground"
            >
              <Plus size={24} strokeWidth={ICON_STROKE_WIDTH} />
              <span className="text-[0.8125rem] font-medium">Add Option</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
