"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Search, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routes } from "@/config/routes";
import { ICON_STROKE_WIDTH, CREDIT_APP_STATUSES } from "@/lib/constants";
import { formatRelative } from "@/lib/utils/format-date";
import { formatPhone } from "@/lib/utils/format-phone";
import { staggerContainer, staggerItem } from "@/lib/motion";

type AppSummary = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  vehicle_id: string | null;
  created_at: string;
  updated_at: string;
  vehicle: {
    year: number | null;
    make: string | null;
    model: string | null;
    stock_number: string | null;
  } | null;
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  approved: "Approved",
  denied: "Denied",
};

function vehicleLabel(v: AppSummary["vehicle"]): string {
  if (!v) return "No vehicle";
  return [v.year, v.make, v.model].filter(Boolean).join(" ") || "Unknown";
}

type Props = {
  initialApplications: AppSummary[];
  initialTotal: number;
};

export function CreditAppList({ initialApplications, initialTotal }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return initialApplications.filter((a) => {
      const matchSearch =
        !search ||
        `${a.first_name} ${a.last_name} ${a.email} ${a.phone}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || a.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [initialApplications, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Applications"
        description={`${initialTotal} total application${initialTotal !== 1 ? "s" : ""}`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            strokeWidth={ICON_STROKE_WIDTH}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {CREDIT_APP_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications"
          description={search || statusFilter !== "all" ? "No applications match your filters." : "Credit applications will appear here when customers submit them."}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="divide-y divide-border rounded-lg border"
        >
          {filtered.map((app) => (
            <motion.div key={app.id} variants={staggerItem}>
              <Link
                href={routes.creditApplication(app.id)}
                className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-sm truncate">
                      {app.first_name} {app.last_name}
                    </span>
                    <StatusBadge status={STATUS_LABEL[app.status] ?? app.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{app.email}</span>
                    <span>{formatPhone(app.phone)}</span>
                    {app.vehicle && (
                      <span className="text-foreground/70">
                        {vehicleLabel(app.vehicle)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {formatRelative(app.created_at)}
                  </span>
                  <ChevronRight
                    size={16}
                    strokeWidth={ICON_STROKE_WIDTH}
                    className="text-muted-foreground"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
