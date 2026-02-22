"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  FileSpreadsheet,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { formatDate, formatRelative } from "@/lib/utils/format-date";
import { staggerContainer, staggerItem, fadeUp } from "@/lib/motion";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "negotiating", label: "Negotiating" },
  { value: "sold", label: "Sold" },
  { value: "lost", label: "Lost" },
];

const STATUS_VARIANT_MAP: Record<string, "default" | "outline" | "accent"> = {
  lead: "default",
  contacted: "outline",
  negotiating: "accent",
  sold: "accent",
  lost: "outline",
};

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  source?: string | null;
  vehicle_interests?: string[];
  created_at: string;
  profiles?: { id: string; name: string; email: string } | null;
};

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${accent ? "border-primary/20 bg-primary/5" : "border-border"}`}>
      <p className={`text-heading-2 tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
      <p className="text-caption text-muted-foreground">{label}</p>
    </div>
  );
}

export function CustomerList() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ first_name: "", last_name: "", email: "", phone: "", source: "" });
  const [saving, setSaving] = useState(false);

  const limit = 25;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status: statusFilter,
    });
    if (search) params.set("search", search);

    const res = await fetch(`/api/customers?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCustomers(data.customers);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchCustomers, search]);

  const handleCreate = async () => {
    if (!newForm.first_name.trim() || !newForm.last_name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    if (res.ok) {
      const { customer } = await res.json();
      setShowNew(false);
      setNewForm({ first_name: "", last_name: "", email: "", phone: "", source: "" });
      router.push(`/customers/${customer.id}`);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    fetchCustomers();
  };

  const totalPages = Math.ceil(total / limit);

  const activeCount = customers.filter((c) => ["lead", "contacted", "negotiating"].includes(c.status)).length;
  const soldCount = customers.filter((c) => c.status === "sold").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage your customer relationships and pipeline">
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} strokeWidth={ICON_STROKE_WIDTH} />
          New Customer
        </Button>
      </PageHeader>

      {/* Stats row */}
      {!loading && total > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={total} />
          <StatCard label="Active Pipeline" value={activeCount} accent />
          <StatCard label="Closed / Sold" value={soldCount} />
          <StatCard label="This Page" value={customers.length} />
        </motion.div>
      )}

      {/* Search & filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            strokeWidth={ICON_STROKE_WIDTH}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(s.value);
                setPage(1);
              }}
              className={`shrink-0 rounded-full px-3 py-1 text-[0.75rem] font-medium transition-all ${
                statusFilter === s.value
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading && customers.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start tracking leads and deals."
          actionLabel="New Customer"
          onAction={() => setShowNew(true)}
        />
      ) : (
        <>
          {/* Card-based list for better UX */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            <AnimatePresence mode="popLayout">
              {customers.map((c) => (
                <motion.div
                  key={c.id}
                  variants={staggerItem}
                  layout
                  className="group relative flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/10 hover:bg-muted/30 cursor-pointer"
                  onClick={() => router.push(`/customers/${c.id}`)}
                >
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-[0.8125rem] font-semibold uppercase tracking-wide text-foreground/60">
                    {c.first_name[0]}{c.last_name[0]}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.8125rem] font-semibold truncate">
                        {c.first_name} {c.last_name}
                      </span>
                      <StatusBadge
                        status={c.status}
                        variant={STATUS_VARIANT_MAP[c.status]}
                      />
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-[0.75rem] text-muted-foreground">
                      {c.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail size={11} />
                          {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} />
                          {c.phone}
                        </span>
                      )}
                      {!c.email && !c.phone && <span>No contact info</span>}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="hidden md:flex flex-col items-end gap-0.5 shrink-0 text-right">
                    {c.source && (
                      <span className="text-[0.6875rem] text-muted-foreground capitalize">{c.source}</span>
                    )}
                    <span className="text-[0.6875rem] text-muted-foreground">
                      {formatRelative(c.created_at)}
                    </span>
                  </div>

                  {/* Vehicles count */}
                  {(c.vehicle_interests?.length ?? 0) > 0 && (
                    <div className="hidden sm:flex items-center gap-1 shrink-0 rounded-md bg-muted px-2 py-1 text-[0.6875rem] text-muted-foreground">
                      <FileSpreadsheet size={11} />
                      {c.vehicle_interests!.length}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/customers/${c.id}`)}>
                          <Eye size={14} className="mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/deal-sheets/new?customer=${c.id}`)}>
                          <FileSpreadsheet size={14} className="mr-2" />
                          Create Deal Sheet
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <ChevronRight size={14} className="shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-[0.8125rem] text-muted-foreground">
              <span>
                {total} customer{total !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2 text-[0.75rem]">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
            <DialogDescription>Add a new customer to your CRM.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={newForm.first_name}
                  onChange={(e) => setNewForm({ ...newForm, first_name: e.target.value })}
                  className="mt-1.5"
                  placeholder="John"
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={newForm.last_name}
                  onChange={(e) => setNewForm({ ...newForm, last_name: e.target.value })}
                  className="mt-1.5"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                className="mt-1.5"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                className="mt-1.5"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label>Source</Label>
              <Select
                value={newForm.source}
                onValueChange={(v) => setNewForm({ ...newForm, source: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="How did they find you?" />
                </SelectTrigger>
                <SelectContent>
                  {["walk-in", "phone", "web", "credit-app", "referral", "other"].map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving || !newForm.first_name.trim() || !newForm.last_name.trim()}>
              {saving ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
