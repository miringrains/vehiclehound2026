"use client";

import { useState, useRef } from "react";
import { Loader2, Check, X, Plus, Trash2, Upload, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_DEAL_DEFAULTS, type DealDefaults, type CreditTier } from "@/lib/deal-calc";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

type Dealership = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  logo_url: string | null;
  credit_app_emails: string[];
  deal_defaults?: DealDefaults | null;
};

type Props = { dealership: Dealership };

export function DealershipSettings({ dealership }: Props) {
  const [form, setForm] = useState({
    name: dealership.name,
    phone: dealership.phone ?? "",
    address: dealership.address ?? "",
    city: dealership.city ?? "",
    state: dealership.state ?? "",
    zip: dealership.zip ?? "",
    website: dealership.website ?? "",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(dealership.logo_url);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [emails, setEmails] = useState<string[]>(dealership.credit_app_emails ?? []);
  const [emailInput, setEmailInput] = useState("");
  const [dealDefaults, setDealDefaults] = useState<DealDefaults>(
    dealership.deal_defaults ? { ...DEFAULT_DEAL_DEFAULTS, ...dealership.deal_defaults } : DEFAULT_DEAL_DEFAULTS
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }

    setUploadingLogo(true);
    try {
      const supabase = createClient();
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const filePath = `logos/${dealership.id}/logo-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("vehicle-images")
        .upload(filePath, file, { contentType: file.type, upsert: true });

      if (uploadErr) {
        toast.error("Upload failed: " + uploadErr.message);
        return;
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicle-images/${filePath}`;

      const res = await fetch("/api/dealership", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: publicUrl }),
      });
      if (!res.ok) {
        toast.error("Failed to save logo");
        return;
      }

      setLogoUrl(publicUrl);
      toast.success("Logo uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleLogoRemove() {
    const res = await fetch("/api/dealership", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logo_url: null }),
    });
    if (res.ok) {
      setLogoUrl(null);
      toast.success("Logo removed");
    }
  }

  const addEmail = () => {
    const e = emailInput.trim().toLowerCase();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      toast.error("Invalid email address");
      return;
    }
    if (emails.includes(e)) {
      toast.error("Email already added");
      return;
    }
    setEmails((prev) => [...prev, e]);
    setEmailInput("");
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Dealership name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dealership", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, credit_app_emails: emails, deal_defaults: dealDefaults }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setSaved(true);
      toast.success("Settings saved");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Logo */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-heading-4">Logo</h3>
        <div className="flex items-center gap-5">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-muted/40 overflow-hidden shrink-0">
            {logoUrl ? (
              <Image src={logoUrl} alt="Dealership logo" fill className="object-contain p-1.5" sizes="80px" />
            ) : (
              <ImageIcon size={24} className="text-muted-foreground" strokeWidth={ICON_STROKE_WIDTH} />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-caption text-muted-foreground">Appears on deal sheets, credit app PDFs, and more. Max 2MB.</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                {uploadingLogo ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Upload size={14} className="mr-1.5" strokeWidth={ICON_STROKE_WIDTH} />}
                {logoUrl ? "Change" : "Upload"}
              </Button>
              {logoUrl && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={handleLogoRemove}>
                  Remove
                </Button>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-heading-4">General</h3>
        <div>
          <Label htmlFor="name">Dealership Name *</Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input id="website" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" className="mt-1.5" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-heading-4">Address</h3>
        <div>
          <Label htmlFor="address">Street Address</Label>
          <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} className="mt-1.5" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>State</Label>
            <Select value={form.state} onValueChange={(v) => set("state", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="zip">Zip</Label>
            <Input id="zip" value={form.zip} onChange={(e) => set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))} className="mt-1.5" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-heading-4">Credit Application Notifications</h3>
        <p className="text-caption text-muted-foreground -mt-2">Email addresses that receive notifications when a credit application is submitted.</p>
        <div className="flex items-center gap-2">
          <Input
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
            placeholder="email@dealership.com"
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={addEmail}>
            <Plus size={14} strokeWidth={ICON_STROKE_WIDTH} />
          </Button>
        </div>
        {emails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {emails.map((e) => (
              <span key={e} className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-caption">
                {e}
                <button onClick={() => removeEmail(e)} className="text-muted-foreground hover:text-foreground">
                  <X size={12} strokeWidth={ICON_STROKE_WIDTH} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-heading-4">Deal Defaults</h3>
        <p className="text-caption text-muted-foreground -mt-2">
          Default values for new deal sheets. These pre-fill when creating deals.
        </p>

        {/* Credit Tiers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[0.8125rem] font-medium">Credit Tiers</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDealDefaults({
                  ...dealDefaults,
                  credit_tiers: [
                    ...dealDefaults.credit_tiers,
                    { name: `Tier ${dealDefaults.credit_tiers.length + 1}`, apr: 5.99, money_factor: 0.0015 },
                  ],
                })
              }
            >
              <Plus size={12} strokeWidth={ICON_STROKE_WIDTH} />
              Add Tier
            </Button>
          </div>
          <div className="space-y-2">
            {dealDefaults.credit_tiers.map((tier, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={tier.name}
                  onChange={(e) => {
                    const tiers = [...dealDefaults.credit_tiers];
                    tiers[idx] = { ...tier, name: e.target.value };
                    setDealDefaults({ ...dealDefaults, credit_tiers: tiers });
                  }}
                  placeholder="Tier name"
                  className="flex-1"
                />
                <div className="w-24">
                  <Input
                    type="number"
                    step="0.01"
                    value={tier.apr}
                    onChange={(e) => {
                      const tiers = [...dealDefaults.credit_tiers];
                      tiers[idx] = { ...tier, apr: Number(e.target.value) };
                      setDealDefaults({ ...dealDefaults, credit_tiers: tiers });
                    }}
                    placeholder="APR %"
                  />
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    step="0.0001"
                    value={tier.money_factor}
                    onChange={(e) => {
                      const tiers = [...dealDefaults.credit_tiers];
                      tiers[idx] = { ...tier, money_factor: Number(e.target.value) };
                      setDealDefaults({ ...dealDefaults, credit_tiers: tiers });
                    }}
                    placeholder="MF"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive shrink-0"
                  onClick={() => {
                    const tiers = dealDefaults.credit_tiers.filter((_, i) => i !== idx);
                    setDealDefaults({ ...dealDefaults, credit_tiers: tiers });
                  }}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-6 text-[0.6875rem] text-muted-foreground px-1">
            <span className="flex-1">Name</span>
            <span className="w-24">APR %</span>
            <span className="w-28">Money Factor</span>
            <span className="w-7" />
          </div>
        </div>

        {/* Default Fees */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Doc Fee</Label>
            <Input
              type="number"
              value={dealDefaults.doc_fee}
              onChange={(e) => setDealDefaults({ ...dealDefaults, doc_fee: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Title/Reg Fee</Label>
            <Input
              type="number"
              value={dealDefaults.title_reg_fee}
              onChange={(e) => setDealDefaults({ ...dealDefaults, title_reg_fee: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Tax Rate %</Label>
            <Input
              type="number"
              step="0.001"
              value={dealDefaults.default_tax_rate}
              onChange={(e) => setDealDefaults({ ...dealDefaults, default_tax_rate: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Default Terms */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Finance Term (months)</Label>
            <Input
              type="number"
              value={dealDefaults.default_finance_term}
              onChange={(e) => setDealDefaults({ ...dealDefaults, default_finance_term: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Lease Term (months)</Label>
            <Input
              type="number"
              value={dealDefaults.default_lease_term}
              onChange={(e) => setDealDefaults({ ...dealDefaults, default_lease_term: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Lease Defaults */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Annual Mileage</Label>
            <Input
              type="number"
              value={dealDefaults.default_annual_mileage}
              onChange={(e) => setDealDefaults({ ...dealDefaults, default_annual_mileage: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Acquisition Fee</Label>
            <Input
              type="number"
              value={dealDefaults.acquisition_fee}
              onChange={(e) => setDealDefaults({ ...dealDefaults, acquisition_fee: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Disposition Fee</Label>
            <Input
              type="number"
              value={dealDefaults.disposition_fee}
              onChange={(e) => setDealDefaults({ ...dealDefaults, disposition_fee: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label>Excess Mileage $/mi</Label>
          <Input
            type="number"
            step="0.01"
            value={dealDefaults.excess_mileage_charge}
            onChange={(e) => setDealDefaults({ ...dealDefaults, excess_mileage_charge: Number(e.target.value) })}
            className="mt-1.5 max-w-[200px]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : saved ? <Check size={14} className="mr-1.5 text-green-500" /> : null}
          {saved ? "Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
