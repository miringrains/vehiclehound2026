"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  images?: string[] | null;
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
    if (!q.trim()) {
      setVehicleResults([]);
      return;
    }
    const res = await fetch(`/api/vehicles?search=${encodeURIComponent(q)}&limit=8`);
    if (res.ok) {
      const data = await res.json();
      setVehicleResults(data.vehicles || []);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchVehicles(vehicleSearch), 300);
    return () => clearTimeout(t);
  }, [vehicleSearch, searchVehicles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!customer) return null;

  const notes = Array.isArray(customer.notes) ? customer.notes : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/customers")}>
          <ArrowLeft size={16} strokeWidth={ICON_STROKE_WIDTH} />
        </Button>
        <div className="flex-1">
          <PageHeader title={`${customer.first_name} ${customer.last_name}`}>
            <Select value={customer.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
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
          </PageHeader>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Left column */}
        <div className="space-y-6">
          {/* Contact info */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Contact Information</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
                  {editing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={form.first_name || ""}
                          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={form.last_name || ""}
                          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={form.email || ""}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={form.phone || ""}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={form.address || ""}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>City</Label>
                        <Input
                          value={form.city || ""}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={form.state || ""}
                          onChange={(e) => setForm({ ...form, state: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Zip</Label>
                        <Input
                          value={form.zip || ""}
                          onChange={(e) => setForm({ ...form, zip: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Source</Label>
                      <Select
                        value={form.source || ""}
                        onValueChange={(v) => setForm({ ...form, source: v })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOURCE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-[0.8125rem]">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail size={14} strokeWidth={ICON_STROKE_WIDTH} />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={14} strokeWidth={ICON_STROKE_WIDTH} />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {(customer.address || customer.city) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={14} strokeWidth={ICON_STROKE_WIDTH} />
                        <span>
                          {[customer.address, customer.city, customer.state, customer.zip]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {customer.source && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Source:</span>
                        <span className="capitalize">{customer.source}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Added:</span>
                      <span>{formatDate(customer.created_at)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[60px] text-[0.8125rem]"
                  />
                  <Button
                    size="icon"
                    onClick={handleAddNote}
                    disabled={addingNote || !noteText.trim()}
                    className="shrink-0 self-end"
                  >
                    <Send size={14} strokeWidth={ICON_STROKE_WIDTH} />
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <p className="text-[0.8125rem] text-muted-foreground text-center py-4">
                    No notes yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border border-border p-3"
                      >
                        <p className="text-[0.8125rem] whitespace-pre-wrap">{note.text}</p>
                        <div className="mt-2 flex items-center gap-2 text-[0.6875rem] text-muted-foreground">
                          <span>{note.created_by_name}</span>
                          <span>·</span>
                          <span>{formatRelative(note.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Vehicle interests */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Vehicle Interests</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVehiclePicker(!showVehiclePicker)}
                >
                  <Plus size={14} strokeWidth={ICON_STROKE_WIDTH} />
                  Add Vehicle
                </Button>
              </CardHeader>
              <CardContent>
                {showVehiclePicker && (
                  <div className="mb-4 rounded-lg border border-border p-3">
                    <Input
                      placeholder="Search inventory..."
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                    />
                    {vehicleResults.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                        {vehicleResults.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => handleAddVehicle(v.id)}
                            className="w-full text-left rounded-md px-3 py-2 text-[0.8125rem] hover:bg-muted transition-colors"
                          >
                            <span className="font-medium">
                              {v.year} {v.make} {v.model}
                            </span>
                            {v.trim && (
                              <span className="text-muted-foreground"> {v.trim}</span>
                            )}
                            {v.stock_number && (
                              <span className="text-muted-foreground"> · #{v.stock_number}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {vehicles.length === 0 ? (
                  <p className="text-[0.8125rem] text-muted-foreground text-center py-4">
                    No vehicles added
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                            <Car size={16} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-[0.8125rem] font-medium">
                              {v.year} {v.make} {v.model}
                              {v.trim && <span className="font-normal text-muted-foreground"> {v.trim}</span>}
                            </p>
                            <p className="text-[0.6875rem] text-muted-foreground">
                              {v.stock_number && `#${v.stock_number}`}
                              {v.online_price && ` · ${formatCurrencyDollars(v.online_price)}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleRemoveVehicle(v.id)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Deal Sheets */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Deal Sheets</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/deal-sheets/new?customer=${customerId}`)
                  }
                >
                  <FileSpreadsheet size={14} strokeWidth={ICON_STROKE_WIDTH} />
                  New Deal Sheet
                </Button>
              </CardHeader>
              <CardContent>
                {dealSheets.length === 0 ? (
                  <p className="text-[0.8125rem] text-muted-foreground text-center py-4">
                    No deal sheets yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dealSheets.map((ds) => (
                      <button
                        key={ds.id}
                        onClick={() => router.push(`/deal-sheets/${ds.id}`)}
                        className="w-full text-left rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[0.8125rem] font-medium">
                            {ds.title || "Untitled Deal Sheet"}
                          </span>
                          <StatusBadge status={ds.status} />
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[0.6875rem] text-muted-foreground">
                          <span>
                            {Array.isArray(ds.options) ? ds.options.length : 0} option
                            {Array.isArray(ds.options) && ds.options.length !== 1 ? "s" : ""}
                          </span>
                          <span>·</span>
                          <span>{formatDate(ds.created_at)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Credit App Link */}
          {customer.credit_app_id && (
            <motion.div variants={staggerItem}>
              <Card>
                <CardContent className="pt-5">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      router.push(`/credit-applications/${customer.credit_app_id}`)
                    }
                  >
                    <ExternalLink size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-2" />
                    View Credit Application
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
