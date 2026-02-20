"use client";

import { useState, useCallback, useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Copy,
  Check,
  Plus,
  Globe,
  Key,
  Trash2,
  Loader2,
  X,
  Eye,
  Palette,
  LinkIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { fadeUp } from "@/lib/motion";
import type { WidgetConfig } from "@/types/credit-application";

type Props = {
  initialConfig: WidgetConfig | null;
  dealershipId: string;
};

export function IntegrationManager({ initialConfig, dealershipId }: Props) {
  const [config, setConfig] = useState<WidgetConfig | null>(initialConfig);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(config?.name ?? "My Integration");
  const [primaryColor, setPrimaryColor] = useState(config?.config?.primaryColor ?? "#1a1d1e");
  const [hoverColor, setHoverColor] = useState(config?.config?.hoverColor ?? "#374151");
  const [showPricing, setShowPricing] = useState(config?.config?.showPricing ?? true);
  const [creditAppUrl, setCreditAppUrl] = useState(config?.config?.creditAppUrl ?? "");
  const [domainList, setDomainList] = useState<string[]>(config?.allowed_domains ?? []);
  const [domainInput, setDomainInput] = useState("");

  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "embed" | "preview">("settings");
  const domainInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/widget/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const { config: created } = await res.json();
      if (created) {
        setConfig(created);
        setName(created.name);
        setPrimaryColor(created.config?.primaryColor ?? "#1a1d1e");
        setHoverColor(created.config?.hoverColor ?? "#374151");
        setShowPricing(created.config?.showPricing ?? true);
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
          name,
          config: {
            primaryColor,
            hoverColor,
            showPricing,
            creditAppUrl,
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
      const parts = domainInput.split(",");
      parts.forEach(addDomain);
      setDomainInput("");
    }
  };

  const handleDomainBlur = () => {
    if (domainInput.trim()) {
      const parts = domainInput.split(",");
      parts.forEach(addDomain);
      setDomainInput("");
    }
  };

  const removeDomain = (domain: string) => {
    setDomainList((prev) => prev.filter((d) => d !== domain));
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const creditAppDefault = `${appUrl}/apply/${dealershipId}`;

  if (!config) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
        <PageHeader title="Integrations" description="Embed your inventory on any website" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-xl bg-muted p-4">
            <Code2 size={32} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No integration yet</h3>
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
  const creditAppEmbed = `<iframe src="${creditAppDefault}?embed=true" width="100%" height="800" frameborder="0"></iframe>`;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Integrations" description="Manage your website embed and configuration">
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : saved ? <Check size={14} className="mr-1.5 text-green-500" /> : null}
            {saved ? "Saved" : "Save Changes"}
          </Button>
        </div>
      </PageHeader>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 border-b">
        {([
          { key: "settings", label: "Settings", icon: Palette },
          { key: "embed", label: "Embed Codes", icon: Code2 },
          { key: "preview", label: "Preview", icon: Eye },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} strokeWidth={ICON_STROKE_WIDTH} />
            {label}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6 max-w-2xl">
          {/* General */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">General</h3>
            <div>
              <Label htmlFor="int-name">Integration Name</Label>
              <Input id="int-name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm" />
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</h3>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div>
                <Label htmlFor="pc">Button Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border cursor-pointer p-0.5"
                  />
                  <Input
                    id="pc"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="hc">Hover Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={hoverColor}
                    onChange={(e) => setHoverColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border cursor-pointer p-0.5"
                  />
                  <Input
                    id="hc"
                    value={hoverColor}
                    onChange={(e) => setHoverColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sp" checked={showPricing} onCheckedChange={(v) => setShowPricing(!!v)} />
              <Label htmlFor="sp" className="cursor-pointer text-sm">Show pricing on widgets</Label>
            </div>
          </div>

          {/* Credit App URL */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon size={12} strokeWidth={ICON_STROKE_WIDTH} />
              Credit Application
            </h3>
            <div>
              <Label htmlFor="ca-url">Custom Credit App URL</Label>
              <Input
                id="ca-url"
                value={creditAppUrl}
                onChange={(e) => setCreditAppUrl(e.target.value)}
                placeholder={creditAppDefault}
                className="max-w-md"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Leave empty to use default: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{creditAppDefault}</code>
              </p>
            </div>
          </div>

          {/* Allowed Domains */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={12} strokeWidth={ICON_STROKE_WIDTH} />
              Allowed Domains
            </h3>
            <p className="text-xs text-muted-foreground -mt-2">
              Restrict which domains can load your widget. Leave empty to allow all.
            </p>
            <div>
              <Input
                ref={domainInputRef}
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={handleDomainKeyDown}
                onBlur={handleDomainBlur}
                placeholder="Type a domain and press Enter (e.g. example.com)"
                className="max-w-md"
              />
            </div>
            {domainList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {domainList.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium"
                  >
                    <Globe size={11} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
                    {d}
                    <button
                      onClick={() => removeDomain(d)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                    >
                      <X size={11} strokeWidth={ICON_STROKE_WIDTH} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* API Key */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Key size={12} strokeWidth={ICON_STROKE_WIDTH} />
              API Key
            </h3>
            <div className="flex items-center gap-2 max-w-md">
              <code className="flex-1 text-xs font-mono bg-muted rounded-lg px-3 py-2.5 truncate select-all">
                {config.api_key}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(config.api_key, "apikey")}
              >
                {copied === "apikey" ? <Check size={14} className="text-green-500" /> : <Copy size={14} strokeWidth={ICON_STROKE_WIDTH} />}
              </Button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" />
              Delete Integration
            </Button>
          </div>
        </div>
      )}

      {/* Embed Codes Tab */}
      {activeTab === "embed" && (
        <div className="space-y-6 max-w-2xl">
          {/* Step 1 */}
          <div className="rounded-lg border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold shrink-0">1</span>
              <div>
                <h3 className="text-sm font-semibold">Inventory Page</h3>
                <p className="text-xs text-muted-foreground">Create a page on your website (e.g. <code className="bg-muted px-1 py-0.5 rounded text-[10px]">yoursite.com/inventory</code>) and paste this embed code.</p>
              </div>
            </div>
            <div className="relative">
              <pre className="text-[11px] font-mono bg-muted/70 rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all pr-20">
                {inventoryEmbed}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(inventoryEmbed, "inv")}
                className="absolute top-2 right-2 h-7 text-xs"
              >
                {copied === "inv" ? <Check size={12} className="mr-1 text-green-500" /> : <Copy size={12} className="mr-1" strokeWidth={ICON_STROKE_WIDTH} />}
                {copied === "inv" ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              When a user clicks a vehicle, they&apos;ll be directed to your vehicle details page. Set the <code className="bg-muted px-1 py-0.5 rounded text-[10px]">data-detail-url</code> attribute to your detail page path:
            </p>
            <pre className="text-[11px] font-mono bg-muted/70 rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all">
              {`<div id="vh-inventory"\n  data-api-key="${config.api_key}"\n  data-detail-url="/vehicle-details"></div>`}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold shrink-0">2</span>
              <div>
                <h3 className="text-sm font-semibold">Vehicle Details Page</h3>
                <p className="text-xs text-muted-foreground">Create a second page (e.g. <code className="bg-muted px-1 py-0.5 rounded text-[10px]">yoursite.com/vehicle-details</code>) and paste this embed code.</p>
              </div>
            </div>
            <div className="relative">
              <pre className="text-[11px] font-mono bg-muted/70 rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all pr-20">
                {detailEmbed}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(detailEmbed, "det")}
                className="absolute top-2 right-2 h-7 text-xs"
              >
                {copied === "det" ? <Check size={12} className="mr-1 text-green-500" /> : <Copy size={12} className="mr-1" strokeWidth={ICON_STROKE_WIDTH} />}
                {copied === "det" ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              The widget automatically reads <code className="bg-muted px-1 py-0.5 rounded text-[10px]">?id=</code> from the URL to load the correct vehicle. When users click a car on the inventory page, it navigates to <code className="bg-muted px-1 py-0.5 rounded text-[10px]">/vehicle-details?id=UUID</code> and the detail widget takes over.
            </p>
          </div>

          {/* Credit App */}
          <div className="rounded-lg border border-dashed p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold shrink-0">+</span>
              <div>
                <h3 className="text-sm font-semibold">Credit Application (Optional)</h3>
                <p className="text-xs text-muted-foreground">A &ldquo;Apply for Financing&rdquo; button appears on vehicle detail pages. Link it to your credit app page.</p>
              </div>
            </div>
            <div className="relative">
              <pre className="text-[11px] font-mono bg-muted/70 rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all pr-20">
                {creditAppEmbed}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(creditAppEmbed, "credit")}
                className="absolute top-2 right-2 h-7 text-xs"
              >
                {copied === "credit" ? <Check size={12} className="mr-1 text-green-500" /> : <Copy size={12} className="mr-1" strokeWidth={ICON_STROKE_WIDTH} />}
                {copied === "credit" ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Or use our hosted page directly: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{creditAppDefault}</code>
            </p>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Live preview of how your inventory widget will appear on an external site.
            </p>
          </div>
          <div className="rounded-xl border-2 border-dashed border-border/60 bg-white p-6 min-h-[400px]">
            <div className="space-y-4">
              {/* Mock search bar */}
              <div className="flex gap-2">
                <div className="flex-1 h-9 rounded-md border bg-white px-3 flex items-center text-xs text-muted-foreground">
                  Search vehicles...
                </div>
                <div className="h-9 w-[100px] rounded-md border bg-white px-3 flex items-center text-xs text-muted-foreground">
                  All Types
                </div>
                <div className="h-9 w-[100px] rounded-md border bg-white px-3 flex items-center text-xs text-muted-foreground">
                  Newest
                </div>
              </div>
              {/* Mock cards */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-300">Vehicle Image</span>
                    </div>
                    <div className="p-3 space-y-1.5">
                      <span
                        className="inline-block text-[9px] font-semibold uppercase tracking-wider text-white px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {i % 2 === 0 ? "Lease" : "Sale"}
                      </span>
                      <p className="text-sm font-semibold text-gray-900">2025 Vehicle Model</p>
                      <p className="text-xs text-gray-400">Trim · 12,000 mi · Color</p>
                      {showPricing && (
                        <p className="text-sm font-bold text-gray-900">
                          {i % 2 === 0 ? "$599/mo" : "$45,999"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Mock CTA */}
              <div className="flex justify-center pt-2">
                <button
                  className="text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: primaryColor }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = hoverColor; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = primaryColor; }}
                >
                  Apply for Financing
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Colors and pricing visibility update in real-time as you change settings.
          </p>
        </div>
      )}
    </motion.div>
  );
}

