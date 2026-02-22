"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Plus,
  FileSpreadsheet,
  X,
  Send,
  ExternalLink,
  Car,
  Pencil,
  Check,
  Calendar,
  Search,
  ChevronRight,
  Tag,
  Clock,
  UserCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
import { Textarea } from "@/components/ui/textarea";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { formatDate, formatRelative } from "@/lib/utils/format-date";
import { formatCurrencyDollars } from "@/lib/utils/format-currency";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";

const STATUS_OPTIONS = ["lead", "contacted", "negotiating", "sold", "lost"];
const STATUS_VARIANT_MAP: Record<string, "default" | "outline" | "accent"> = {
  lead: "default",
  contacted: "outline",
  negotiating: "accent",
  sold: "accent",
  lost: "outline",
};
const SOURCE_OPTIONS = ["walk-in", "phone", "web", "credit-app", "referral", "other"];

type Note = {
  id: string;
  text: string;
  created_at: string;
  created_by_name: string;
};

type Vehicle = {
  id: string;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  stock_number?: string | null;
  preview_image?: string | null;
  online_price?: number | null;
  sale_price?: number | null;
};

type DealSheet = {
  id: string;
  title?: string | null;
  status: string;
  options?: unknown[];
  created_at: string;
};

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  status: string;
  source?: string | null;
  notes?: Note[];
  vehicle_interests?: string[];
  credit_app_id?: string | null;
  assigned_to?: string | null;
  created_at: string;
};

function InfoRow({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-start gap-3 py-2">
      <Icon size={14} strokeWidth={ICON_STROKE_WIDTH} className="mt-0.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-[0.8125rem] truncate">{value}</p>
      </div>
    </div>
  );
  if (href) {
    return <a href={href} className="block hover:bg-muted/40 -mx-2 px-2 rounded-md transition-colors">{content}</a>;
  }
  return content;
}

export function CustomerDetail({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dealSheets, setDealSheets] = useState<DealSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleResults, setVehicleResults] = useState<Vehicle[]>([]);

  const fetchCustomer = useCallback(async () => {
    const res = await fetch(`/api/customers/${customerId}`);
    if (!res.ok) {
      router.push("/customers");
      return;
    }
    const data = await res.json();
    setCustomer(data.customer);
    setVehicles(data.vehicles || []);
    setDealSheets(data.deal_sheets || []);
    setForm(data.customer);
    setLoading(false);
  }, [customerId, router]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditing(false);
    await fetchCustomer();
    setSaving(false);
  };

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchCustomer();
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    await fetch(`/api/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: noteText }),
    });
    setNoteText("");
    await fetchCustomer();
    setAddingNote(false);
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    const updated = (customer?.vehicle_interests || []).filter((v) => v !== vehicleId);
    await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicle_interests: updated }),
    });
    fetchCustomer();
  };

  const handleAddVehicle = async (vehicleId: string) => {
    const current = customer?.vehicle_interests || [];
    if (current.includes(vehicleId)) return;
    await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicle_interests: [...current, vehicleId] }),
    });
    setShowVehiclePicker(false);
    setVehicleSearch("");
    setVehicleResults([]);
    fetchCustomer();
  };

  const searchVehicles = useCallback(async (q: string) => {
    const params = new URLSearchParams({ limit: "8" });
    if (q.trim()) params.set("search", q);
    const res = await fetch(`/api/vehicles?${params}`);
    if (res.ok) {
      const data = await res.json();
      setVehicleResults(data.vehicles || []);
    }
  }, []);

  useEffect(() => {
    if (showVehiclePicker) {
      const t = setTimeout(() => searchVehicles(vehicleSearch), vehicleSearch ? 300 : 0);
      return () => clearTimeout(t);
    }
  }, [vehicleSearch, searchVehicles, showVehiclePicker]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!customer) return null;

  const notes = Array.isArray(customer.notes) ? customer.notes : [];
  const fullAddress = [customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/customers")} className="shrink-0">
          <ArrowLeft size={16} strokeWidth={ICON_STROKE_WIDTH} />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-[0.875rem] font-semibold uppercase tracking-wide text-foreground/60">
              {customer.first_name[0]}{customer.last_name[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-heading-1 truncate">{customer.first_name} {customer.last_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={customer.status} variant={STATUS_VARIANT_MAP[customer.status]} />
                {customer.source && <span className="text-[0.6875rem] text-muted-foreground capitalize">via {customer.source}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => router.push(`/deal-sheets/new?customer=${customerId}`)}>
            <FileSpreadsheet size={14} strokeWidth={ICON_STROKE_WIDTH} />
            Deal Sheet
          </Button>
          <Select value={customer.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px] h-8 text-[0.75rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Left column — Contact & Quick Actions */}
        <motion.div variants={staggerItem} className="lg:col-span-1 space-y-4">
          {/* Contact card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[0.8125rem]">Contact</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setEditing(!editing)}
              >
                {editing ? <X size={13} /> : <Pencil size={13} />}
              </Button>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[0.6875rem]">First Name</Label>
                        <Input value={form.first_name || ""} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-[0.6875rem]">Last Name</Label>
                        <Input value={form.last_name || ""} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[0.6875rem]">Email</Label>
                      <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-[0.6875rem]">Phone</Label>
                      <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-[0.6875rem]">Address</Label>
                      <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[0.6875rem]">City</Label>
                        <Input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-[0.6875rem]">State</Label>
                        <Input value={form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-[0.6875rem]">Zip</Label>
                        <Input value={form.zip || ""} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[0.6875rem]">Source</Label>
                      <Select value={form.source || ""} onValueChange={(v) => setForm({ ...form, source: v })}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {SOURCE_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1" onClick={handleSave} disabled={saving}>
                        <Check size={13} className="mr-1" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditing(false); setForm(customer); }}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-border">
                    {customer.email && <InfoRow icon={Mail} label="Email" value={customer.email} href={`mailto:${customer.email}`} />}
                    {customer.phone && <InfoRow icon={Phone} label="Phone" value={customer.phone} href={`tel:${customer.phone}`} />}
                    {fullAddress && <InfoRow icon={MapPin} label="Address" value={fullAddress} />}
                    {customer.source && <InfoRow icon={Tag} label="Source" value={customer.source} />}
                    <InfoRow icon={Calendar} label="Added" value={formatDate(customer.created_at)} />
                    {!customer.email && !customer.phone && !fullAddress && (
                      <p className="py-3 text-[0.8125rem] text-muted-foreground text-center">
                        No contact info —{" "}
                        <button onClick={() => setEditing(true)} className="text-primary underline underline-offset-2">add some</button>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-2 rounded-md px-3 py-2 text-[0.8125rem] hover:bg-muted transition-colors">
                  <Mail size={14} className="text-muted-foreground" />
                  Send Email
                </a>
              )}
              {customer.phone && (
                <a href={`tel:${customer.phone}`} className="flex items-center gap-2 rounded-md px-3 py-2 text-[0.8125rem] hover:bg-muted transition-colors">
                  <Phone size={14} className="text-muted-foreground" />
                  Call Customer
                </a>
              )}
              <button
                onClick={() => router.push(`/deal-sheets/new?customer=${customerId}`)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[0.8125rem] hover:bg-muted transition-colors text-left"
              >
                <FileSpreadsheet size={14} className="text-muted-foreground" />
                Create Deal Sheet
              </button>
              {customer.credit_app_id && (
                <button
                  onClick={() => router.push(`/credit-applications/${customer.credit_app_id}`)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[0.8125rem] hover:bg-muted transition-colors text-left"
                >
                  <ExternalLink size={14} className="text-muted-foreground" />
                  View Credit Application
                </button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Center column — Activity / Notes */}
        <motion.div variants={staggerItem} className="lg:col-span-1 space-y-4">
          <Card className="flex flex-col" style={{ minHeight: "400px" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-[0.8125rem]">Activity & Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Note input */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[56px] text-[0.8125rem] pr-10 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote();
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleAddNote}
                    disabled={addingNote || !noteText.trim()}
                    className="absolute right-1.5 bottom-1.5 h-7 w-7"
                  >
                    <Send size={13} strokeWidth={ICON_STROKE_WIDTH} />
                  </Button>
                </div>
              </div>

              {/* Notes timeline */}
              <div className="flex-1 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock size={20} className="text-muted-foreground/40 mb-2" />
                    <p className="text-[0.8125rem] text-muted-foreground">No activity yet</p>
                    <p className="text-[0.6875rem] text-muted-foreground/60">Notes and updates will appear here</p>
                  </div>
                ) : (
                  <div className="relative space-y-0">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
                    {notes.map((note, i) => (
                      <div key={note.id} className="relative flex gap-3 pb-4">
                        <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-background border border-border">
                          <UserCircle size={14} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[0.75rem] font-medium">{note.created_by_name}</span>
                            <span className="text-[0.6875rem] text-muted-foreground">{formatRelative(note.created_at)}</span>
                          </div>
                          <div className="rounded-lg bg-muted/40 border border-border/50 px-3 py-2">
                            <p className="text-[0.8125rem] whitespace-pre-wrap leading-relaxed">{note.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column — Vehicles & Deal Sheets */}
        <motion.div variants={staggerItem} className="lg:col-span-1 space-y-4">
          {/* Vehicle interests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-[0.8125rem]">Vehicle Interests</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[0.75rem]"
                onClick={() => setShowVehiclePicker(!showVehiclePicker)}
              >
                <Plus size={13} strokeWidth={ICON_STROKE_WIDTH} />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {showVehiclePicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-3"
                  >
                    <div className="rounded-lg border border-border p-2.5 bg-muted/20">
                      <div className="relative">
                        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search inventory..."
                          value={vehicleSearch}
                          onChange={(e) => setVehicleSearch(e.target.value)}
                          className="pl-7 h-8 text-[0.8125rem]"
                          autoFocus
                        />
                      </div>
                      {vehicleResults.length > 0 && (
                        <div className="mt-2 max-h-48 overflow-y-auto space-y-0.5">
                          {vehicleResults
                            .filter((v) => !(customer?.vehicle_interests || []).includes(v.id))
                            .map((v) => (
                            <button
                              key={v.id}
                              onClick={() => handleAddVehicle(v.id)}
                              className="w-full flex items-center gap-2.5 text-left rounded-md px-2.5 py-2 text-[0.8125rem] hover:bg-muted transition-colors"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted shrink-0">
                                <Car size={12} className="text-muted-foreground" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">
                                  {v.year} {v.make} {v.model}
                                </p>
                                <p className="text-[0.6875rem] text-muted-foreground truncate">
                                  {v.trim}{v.stock_number && ` · #${v.stock_number}`}
                                  {(v.online_price || v.sale_price) && ` · ${formatCurrencyDollars(v.online_price || v.sale_price || 0)}`}
                                </p>
                              </div>
                              <Plus size={13} className="shrink-0 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      )}
                      {vehicleResults.length === 0 && vehicleSearch && (
                        <p className="mt-2 text-center text-[0.75rem] text-muted-foreground py-2">No vehicles found</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {vehicles.length === 0 && !showVehiclePicker ? (
                <button
                  onClick={() => setShowVehiclePicker(true)}
                  className="flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-border py-6 text-muted-foreground hover:border-foreground/20 hover:text-foreground transition-colors"
                >
                  <Car size={18} />
                  <span className="text-[0.75rem] font-medium">Add vehicle interests</span>
                </button>
              ) : (
                <div className="space-y-1.5">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="group flex items-center gap-2.5 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0 overflow-hidden">
                        {v.preview_image ? (
                          <img src={v.preview_image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Car size={14} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.8125rem] font-medium truncate">
                          {v.year} {v.make} {v.model}
                        </p>
                        <p className="text-[0.6875rem] text-muted-foreground truncate">
                          {v.trim}{v.stock_number && ` · #${v.stock_number}`}
                          {(v.online_price || v.sale_price) && ` · ${formatCurrencyDollars(v.online_price || v.sale_price || 0)}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveVehicle(v.id)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deal Sheets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-[0.8125rem]">Deal Sheets</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[0.75rem]"
                onClick={() => router.push(`/deal-sheets/new?customer=${customerId}`)}
              >
                <Plus size={13} strokeWidth={ICON_STROKE_WIDTH} />
                New
              </Button>
            </CardHeader>
            <CardContent>
              {dealSheets.length === 0 ? (
                <button
                  onClick={() => router.push(`/deal-sheets/new?customer=${customerId}`)}
                  className="flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-border py-6 text-muted-foreground hover:border-foreground/20 hover:text-foreground transition-colors"
                >
                  <FileSpreadsheet size={18} />
                  <span className="text-[0.75rem] font-medium">Create first deal sheet</span>
                </button>
              ) : (
                <div className="space-y-1.5">
                  {dealSheets.map((ds) => (
                    <button
                      key={ds.id}
                      onClick={() => router.push(`/deal-sheets/${ds.id}`)}
                      className="group w-full text-left flex items-center gap-3 rounded-lg border border-border p-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.8125rem] font-medium truncate">
                            {ds.title || "Untitled"}
                          </span>
                          <StatusBadge status={ds.status} />
                        </div>
                        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                          {Array.isArray(ds.options) ? ds.options.length : 0} option{Array.isArray(ds.options) && ds.options.length !== 1 ? "s" : ""}
                          {" · "}{formatRelative(ds.created_at)}
                        </p>
                      </div>
                      <ChevronRight size={14} className="shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
