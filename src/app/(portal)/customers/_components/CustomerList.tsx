"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
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
import { formatDate } from "@/lib/utils/format-date";
import { staggerContainer, staggerItem } from "@/lib/motion";

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

export function CustomerList() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
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
      setNewForm({ first_name: "", last_name: "", email: "", phone: "" });
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

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage your customer relationships">
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} strokeWidth={ICON_STROKE_WIDTH} />
          New Customer
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
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
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(s.value);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
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
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="overflow-hidden rounded-lg border border-border"
          >
            <table className="w-full text-[0.8125rem]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Contact</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Status</th>
                  <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Source</th>
                  <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Vehicles</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Created</th>
                  <th className="px-4 py-2.5 font-medium w-10" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <motion.tr
                    key={c.id}
                    variants={staggerItem}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => router.push(`/customers/${c.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {c.email || c.phone || "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <StatusBadge
                        status={c.status}
                        variant={STATUS_VARIANT_MAP[c.status]}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell capitalize">
                      {c.source || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {c.vehicle_interests?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
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
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={newForm.last_name}
                  onChange={(e) => setNewForm({ ...newForm, last_name: e.target.value })}
                  className="mt-1.5"
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
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                className="mt-1.5"
              />
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
