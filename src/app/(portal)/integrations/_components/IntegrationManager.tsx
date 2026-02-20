"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Copy,
  Check,
  Plus,
  Settings2,
  Globe,
  Key,
  Trash2,
  RefreshCw,
  Loader2,
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

  const [name, setName] = useState(config?.name ?? "My Integration");
  const [primaryColor, setPrimaryColor] = useState(config?.config?.primaryColor ?? "#1a1d1e");
  const [hoverColor, setHoverColor] = useState(config?.config?.hoverColor ?? "#374151");
  const [showPricing, setShowPricing] = useState(config?.config?.showPricing ?? true);
  const [creditAppUrl, setCreditAppUrl] = useState(config?.config?.creditAppUrl ?? "");
  const [domains, setDomains] = useState<string>(
    (config?.allowed_domains ?? []).join(", ")
  );

  const [copied, setCopied] = useState<string | null>(null);

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
        setDomains((created.allowed_domains ?? []).join(", "));
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
          allowed_domains: domains
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
        }),
      });
      const { config: updated } = await res.json();
      if (updated) setConfig(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this integration? This will break any active embeds.")) return;
    await fetch("/api/widget/config", { method: "DELETE" });
    setConfig(null);
  };

  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

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
            Create an integration to get embed codes for your inventory and vehicle detail pages.
          </p>
          <Button onClick={handleCreate} disabled={creating} size="lg">
            {creating ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Plus size={16} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" />}
            Create Integration
          </Button>
        </div>
      </motion.div>
    );
  }

  const inventoryEmbed = `<div id="vh-inventory" data-api-key="${config.api_key}"></div>\n<script src="${appUrl}/widgets/inventory-widget.js"></script>`;
  const detailEmbed = `<div id="vh-vehicle" data-api-key="${config.api_key}"></div>\n<script src="${appUrl}/widgets/vehicle-detail-widget.js"></script>`;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Integrations" description="Manage your website integration and embed codes" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings */}
        <Section icon={Settings2} title="Configuration">
          <div className="space-y-4">
            <div>
              <Label htmlFor="int-name">Integration Name</Label>
              <Input id="int-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    id="primary-color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="hover-color">Hover Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={hoverColor}
                    onChange={(e) => setHoverColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    id="hover-color"
                    value={hoverColor}
                    onChange={(e) => setHoverColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-pricing"
                checked={showPricing}
                onCheckedChange={(v) => setShowPricing(!!v)}
              />
              <Label htmlFor="show-pricing" className="cursor-pointer">Show pricing on widgets</Label>
            </div>
            <div>
              <Label htmlFor="credit-url">Credit Application URL</Label>
              <Input
                id="credit-url"
                value={creditAppUrl}
                onChange={(e) => setCreditAppUrl(e.target.value)}
                placeholder={creditAppDefault}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Leave empty to use default: {creditAppDefault}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600">
                <Trash2 size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Section>

        {/* Domains */}
        <Section icon={Globe} title="Allowed Domains">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Restrict which domains can use your embed. Leave empty to allow all domains.
            </p>
            <div>
              <Label htmlFor="domains">Domains (comma-separated)</Label>
              <Input
                id="domains"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                placeholder="example.com, shop.example.com"
              />
            </div>
          </div>
        </Section>

        {/* API Key */}
        <Section icon={Key} title="API Key">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-muted rounded px-3 py-2 truncate">
                {config.api_key}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(config.api_key, "apikey")}
              >
                {copied === "apikey" ? <Check size={14} className="text-green-500" /> : <Copy size={14} strokeWidth={ICON_STROKE_WIDTH} />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Keep this key private. It is used in your embed codes to authenticate requests.
            </p>
          </div>
        </Section>

        {/* Embed Codes */}
        <Section icon={Code2} title="Embed Codes">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-semibold">Inventory List</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => copyToClipboard(inventoryEmbed, "inv")}
                >
                  {copied === "inv" ? <Check size={12} className="mr-1 text-green-500" /> : <Copy size={12} className="mr-1" strokeWidth={ICON_STROKE_WIDTH} />}
                  Copy
                </Button>
              </div>
              <pre className="text-[11px] font-mono bg-muted rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                {inventoryEmbed}
              </pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-semibold">Vehicle Detail</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => copyToClipboard(detailEmbed, "det")}
                >
                  {copied === "det" ? <Check size={12} className="mr-1 text-green-500" /> : <Copy size={12} className="mr-1" strokeWidth={ICON_STROKE_WIDTH} />}
                  Copy
                </Button>
              </div>
              <pre className="text-[11px] font-mono bg-muted rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                {detailEmbed}
              </pre>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Paste these snippets into any HTML page. The vehicle detail widget reads the <code>id</code> query parameter from the URL automatically, or you can set <code>data-vehicle-id</code> directly.
            </p>
          </div>
        </Section>
      </div>
    </motion.div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Code2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
