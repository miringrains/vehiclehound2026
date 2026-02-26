"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Code2,
  Copy,
  Check,
  Plus,
  Globe,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  Store,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FeatureGate } from "@/components/shared/FeatureGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";
import { toast } from "sonner";
import type { WidgetConfig } from "@/types/credit-application";
import { WidgetPreview } from "./WidgetPreview";

type RadiusPreset = "sharp" | "rounded" | "soft";

type Props = {
  initialConfig: WidgetConfig | null;
  dealershipId: string;
  storefrontSlug: string | null;
  storefrontEnabled: boolean;
};

const RADIUS_OPTIONS: { value: RadiusPreset; label: string; px: number }[] = [
  { value: "sharp", label: "Sharp", px: 4 },
  { value: "rounded", label: "Rounded", px: 12 },
  { value: "soft", label: "Soft", px: 20 },
];

export function IntegrationManager({ initialConfig, dealershipId, storefrontSlug, storefrontEnabled: initialStorefrontEnabled }: Props) {
  const router = useRouter();
  const [config, setConfig] = useState<WidgetConfig | null>(initialConfig);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sfEnabled, setSfEnabled] = useState(initialStorefrontEnabled);
  const [sfToggling, setSfToggling] = useState(false);

  const [primaryColor, setPrimaryColor] = useState(config?.config?.primaryColor ?? "#1a1d1e");
  const [backgroundColor, setBackgroundColor] = useState(config?.config?.backgroundColor ?? "#ffffff");
  const [borderRadius, setBorderRadius] = useState<RadiusPreset>(config?.config?.borderRadius ?? "rounded");
  const [showPricing, setShowPricing] = useState(config?.config?.showPricing ?? true);
  const [showCreditApp, setShowCreditApp] = useState(config?.config?.showCreditApp ?? true);
  const [creditAppUrl, setCreditAppUrl] = useState(config?.config?.creditAppUrl ?? "");
  const [domainList, setDomainList] = useState<string[]>(config?.allowed_domains ?? []);
  const [domainInput, setDomainInput] = useState("");

  const [copied, setCopied] = useState<string | null>(null);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/widget/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Website Widget" }),
      });
      const { config: created } = await res.json();
      if (created) {
        setConfig(created);
        setPrimaryColor(created.config?.primaryColor ?? "#1a1d1e");
        setBackgroundColor(created.config?.backgroundColor ?? "#ffffff");
        setBorderRadius(created.config?.borderRadius ?? "rounded");
        setShowPricing(created.config?.showPricing ?? true);
        setShowCreditApp(created.config?.showCreditApp ?? true);
        setCreditAppUrl(created.config?.creditAppUrl ?? "");
        setDomainList(created.allowed_domains ?? []);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/widget/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            primaryColor,
            backgroundColor,
            showPricing,
            showCreditApp,
            creditAppUrl,
            borderRadius,
            itemsPerPage: config.config?.itemsPerPage ?? 12,
            defaultSort: config.config?.defaultSort ?? "newest",
          },
          allowed_domains: domainList,
        }),
      });
      const { config: updated } = await res.json();
      if (updated) setConfig(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this integration? Active embeds will stop working.")) return;
    await fetch("/api/widget/config", { method: "DELETE" });
    setConfig(null);
  };

  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const cleanDomain = (raw: string): string => {
    let d = raw.trim().toLowerCase();
    d = d.replace(/^https?:\/\//, "");
    d = d.replace(/^www\./, "");
    d = d.replace(/\/.*$/, "");
    d = d.replace(/:\d+$/, "");
    return d;
  };

  const addDomain = (raw: string) => {
    const cleaned = cleanDomain(raw);
    if (!cleaned || domainList.includes(cleaned)) return;
    setDomainList((prev) => [...prev, cleaned]);
  };

  const handleDomainKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      domainInput.split(",").forEach(addDomain);
      setDomainInput("");
    }
  };

  const handleDomainBlur = () => {
    if (domainInput.trim()) {
      domainInput.split(",").forEach(addDomain);
      setDomainInput("");
    }
  };

  const removeDomain = (domain: string) => {
    setDomainList((prev) => prev.filter((d) => d !== domain));
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const creditAppDefault = `${appUrl}/apply/${dealershipId}`;

  const handleStorefrontToggle = async (enabled: boolean) => {
    setSfToggling(true);
    try {
      const res = await fetch("/api/dealership/storefront", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update storefront");
        return;
      }
      setSfEnabled(data.storefront_enabled);
      router.refresh();
      toast.success(data.storefront_enabled ? "Storefront enabled" : "Storefront disabled");
    } catch {
      toast.error("Failed to update storefront");
    } finally {
      setSfToggling(false);
    }
  };

  const storefrontUrl = storefrontSlug ? `${storefrontSlug}.vhlist.com` : null;

  /* ─── Empty state ─── */
  if (!config) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
        <PageHeader title="Integrations" description="Embed your inventory on any website" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-xl bg-muted p-4">
            <Code2 size={32} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
          </div>
          <h3 className="text-heading-3 mb-1">No integration yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Create an integration to generate embed codes for your inventory and vehicle detail pages.
          </p>
          <Button onClick={handleCreate} disabled={creating} size="lg">
            {creating ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Plus size={16} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" />}
            Create Integration
          </Button>
        </div>
      </motion.div>
    );
  }

  const inventoryEmbed = `<div id="vh-inventory" data-api-key="${config.api_key}" data-detail-url="/vehicle-details"></div>\n<script src="${appUrl}/widgets/inventory-widget.js"></script>`;
  const detailEmbed = `<div id="vh-vehicle" data-api-key="${config.api_key}"></div>\n<script src="${appUrl}/widgets/vehicle-detail-widget.js"></script>`;
  const creditAppEmbed = `<div id="vh-credit-app" data-api-key="${config.api_key}"></div>\n<script src="${appUrl}/widgets/credit-app-widget.js"></script>`;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Integrations" description="Customize and embed your inventory widget">
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : saved ? <Check size={14} className="mr-1.5 text-green-500" /> : null}
          {saved ? "Saved" : "Save Changes"}
        </Button>
      </PageHeader>

      {/* ─── Storefront + Embed cards ─── */}
      <FeatureGate feature="storefront">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Storefront card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Store size={16} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
              <h3 className="text-heading-4">VHList Storefront</h3>
            </div>
            <p className="text-caption text-muted-foreground">
              A standalone inventory page at{" "}
              {storefrontUrl ? (
                <span className="font-medium text-foreground">{storefrontUrl}</span>
              ) : (
                <span className="text-muted-foreground">yourname.vhlist.com</span>
              )}
              . Share the link directly with customers — no website needed.
            </p>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <Switch
                  checked={sfEnabled}
                  onCheckedChange={handleStorefrontToggle}
                  disabled={sfToggling}
                />
                <span className="text-caption">{sfEnabled ? "Active" : "Inactive"}</span>
              </div>
            </div>
            {sfEnabled && storefrontUrl && (
              <a
                href={`https://${storefrontUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs font-medium text-green-500 hover:bg-green-500/15 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                {storefrontUrl}
                <ExternalLink size={11} strokeWidth={ICON_STROKE_WIDTH} className="ml-auto" />
              </a>
            )}
            {!storefrontSlug && (
              <p className="text-[11px] text-amber-500">
                Set your storefront slug in{" "}
                <a href="/settings/dealership" className="underline">Dealership Settings</a>
                {" "}to enable this feature.
              </p>
            )}
          </div>

          {/* Embed card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Code2 size={16} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
              <h3 className="text-heading-4">Embed Widget</h3>
            </div>
            <p className="text-caption text-muted-foreground">
              Add your inventory to your existing website. Copy the embed code and paste it into your site&apos;s HTML.
            </p>
            <p className="text-caption text-muted-foreground pt-1">Configure embed styles and codes below.</p>
          </div>
        </div>
      </FeatureGate>

      {/* ─── Split layout ─── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: settings */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-5">
          {/* Colors */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <div className="space-y-3">
              <h3 className="text-heading-4">Accent Color</h3>
              <p className="text-caption text-muted-foreground -mt-1.5">Buttons and interactive elements</p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="font-mono text-xs max-w-[120px]"
                />
              </div>
            </div>

            <div className="border-t border-border pt-5 space-y-3">
              <h3 className="text-heading-4">Background</h3>
              <p className="text-caption text-muted-foreground -mt-1.5">Page background — text and surfaces adjust automatically</p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor }}
                  />
                </div>
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="font-mono text-xs max-w-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Corner Radius */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-heading-4">Corner Radius</h3>
            <div className="grid grid-cols-3 gap-2">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBorderRadius(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-3 transition-all",
                    borderRadius === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div
                    className="w-10 h-8 border-2 border-foreground/70"
                    style={{ borderRadius: opt.px }}
                  />
                  <span className="text-caption">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display toggles */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-heading-4">Show Pricing</h3>
                <p className="text-caption text-muted-foreground mt-0.5">Display prices on vehicle cards</p>
              </div>
              <Switch checked={showPricing} onCheckedChange={setShowPricing} />
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-heading-4">Credit Application</h3>
                  <p className="text-caption text-muted-foreground mt-0.5">Apply for Financing button on vehicle details</p>
                </div>
                <Switch checked={showCreditApp} onCheckedChange={setShowCreditApp} />
              </div>
            </div>
          </div>

          {/* Advanced — collapsible */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center justify-between w-full p-5 text-left"
            >
              <h3 className="text-heading-4">Advanced</h3>
              <ChevronDown
                size={16}
                strokeWidth={ICON_STROKE_WIDTH}
                className={cn("text-muted-foreground transition-transform", advancedOpen && "rotate-180")}
              />
            </button>
            {advancedOpen && (
              <div className="px-5 pb-5 space-y-5 border-t border-border pt-5">
                {/* Credit App URL */}
                <div className="space-y-1.5">
                  <Label>Credit App URL</Label>
                  <Input
                    value={creditAppUrl}
                    onChange={(e) => setCreditAppUrl(e.target.value)}
                    placeholder={creditAppDefault}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave empty for default
                  </p>
                </div>

                {/* Domains */}
                <div className="space-y-2">
                  <Label>Allowed Domains</Label>
                  <p className="text-[11px] text-muted-foreground -mt-1">
                    Leave empty to allow all domains
                  </p>
                  <Input
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={handleDomainKeyDown}
                    onBlur={handleDomainBlur}
                    placeholder="example.com"
                  />
                  {domainList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {domainList.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-medium"
                        >
                          <Globe size={10} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
                          {d}
                          <button
                            onClick={() => removeDomain(d)}
                            className="ml-0.5 rounded p-0.5 hover:bg-foreground/10 transition-colors"
                          >
                            <X size={10} strokeWidth={ICON_STROKE_WIDTH} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" />
            Delete Integration
          </Button>
        </div>

        {/* Right: preview + embed codes */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Live preview */}
          <WidgetPreview
            primaryColor={primaryColor}
            backgroundColor={backgroundColor}
            borderRadius={borderRadius}
            showPricing={showPricing}
          />

          {/* Embed codes — collapsible */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setEmbedOpen(!embedOpen)}
              className="flex items-center justify-between w-full p-5 text-left"
            >
              <div className="flex items-center gap-2">
                <Code2 size={16} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
                <h3 className="text-heading-4">Embed Codes</h3>
              </div>
              <ChevronDown
                size={16}
                strokeWidth={ICON_STROKE_WIDTH}
                className={cn("text-muted-foreground transition-transform", embedOpen && "rotate-180")}
              />
            </button>
            {embedOpen && (
              <div className="px-5 pb-5 space-y-4 border-t border-border pt-5">
                {/* Inventory widget */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Inventory Page</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(inventoryEmbed, "inv")}
                      className="h-7 text-xs"
                    >
                      {copied === "inv" ? <Check size={12} className="mr-1 text-green-500" /> : <Copy size={12} className="mr-1" strokeWidth={ICON_STROKE_WIDTH} />}
                      {copied === "inv" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <pre className="text-[11px] font-mono bg-muted rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all">
                    {inventoryEmbed}
                  </pre>
                </div>

                {/* Detail widget */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Vehicle Detail Page</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(detailEmbed, "det")}
                      className="h-7 text-xs"
                    >
                      {copied === "det" ? <Check size={12} className="mr-1 text-green-500" /> : <Copy size={12} className="mr-1" strokeWidth={ICON_STROKE_WIDTH} />}
                      {copied === "det" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <pre className="text-[11px] font-mono bg-muted rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all">
                    {detailEmbed}
                  </pre>
                </div>

                {/* Credit app widget */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Credit Application</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(creditAppEmbed, "ca")}
                      className="h-7 text-xs"
                    >
                      {copied === "ca" ? <Check size={12} className="mr-1 text-green-500" /> : <Copy size={12} className="mr-1" strokeWidth={ICON_STROKE_WIDTH} />}
                      {copied === "ca" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <pre className="text-[11px] font-mono bg-muted rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all">
                    {creditAppEmbed}
                  </pre>
                  <p className="text-[11px] text-muted-foreground">
                    Standalone credit application — not tied to a specific vehicle
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
