"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Car, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routes } from "@/config/routes";
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUSES,
  ICON_STROKE_WIDTH,
} from "@/lib/constants";
import { formatCurrencyDollars } from "@/lib/utils/format-currency";
import { formatNumber } from "@/lib/utils/format-number";
import { staggerContainer, staggerItem } from "@/lib/motion";

type VehicleSummary = {
  id: string;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  stock_number: string | null;
  vin: string | null;
  status: number;
  inventory_type: string;
  online_price: number | null;
  sale_price: number | null;
  mileage: number | null;
  exterior_color: string | null;
  preview_image: string | null;
  created_at: string;
  lease_payment: number | null;
  lease_term: number | null;
  lease_annual_mileage: number | null;
  drive_type: string | null;
  fuel_type: string | null;
};

function priceLabel(v: VehicleSummary): string {
  if (v.inventory_type === "lease") {
    return v.lease_payment
      ? `${formatCurrencyDollars(v.lease_payment)}/mo`
      : "No price";
  }
  return v.online_price
    ? formatCurrencyDollars(v.online_price)
    : v.sale_price
      ? formatCurrencyDollars(v.sale_price)
      : "No price";
}

export function InventoryList({ vehicles }: { vehicles: VehicleSummary[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        !search ||
        [v.year?.toString(), v.make, v.model, v.trim, v.stock_number, v.vin]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || v.status === Number(statusFilter);

      const matchesType =
        typeFilter === "all" || v.inventory_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, search, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description={`${vehicles.length} vehicle${vehicles.length !== 1 ? "s" : ""} in your inventory.`}
      >
        <Button asChild>
          <Link href={routes.vehicleNew}>
            <Plus size={18} strokeWidth={ICON_STROKE_WIDTH} />
            Add Vehicle
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by year, make, model, VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="lease">Lease</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={String(VEHICLE_STATUSES.AVAILABLE)}>Available</SelectItem>
            <SelectItem value={String(VEHICLE_STATUSES.PENDING)}>Pending</SelectItem>
            <SelectItem value={String(VEHICLE_STATUSES.IN_TRANSIT)}>In Transit</SelectItem>
            <SelectItem value={String(VEHICLE_STATUSES.SOLD)}>Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title={vehicles.length === 0 ? "No vehicles yet" : "No matches"}
          description={
            vehicles.length === 0
              ? "Add your first vehicle to get started with inventory management."
              : "Try adjusting your search or filter."
          }
          actionLabel={vehicles.length === 0 ? "Add Vehicle" : undefined}
          onAction={
            vehicles.length === 0
              ? () => { window.location.href = routes.vehicleNew; }
              : undefined
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((v) => {
            const isLease = v.inventory_type === "lease";

            return (
              <motion.div key={v.id} variants={staggerItem}>
                <Link
                  href={routes.vehicleDetail(v.id)}
                  className="group block rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
                >
                  {/* Image — 4:3 aspect ratio */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-muted">
                    {v.preview_image ? (
                      <img
                        src={v.preview_image}
                        alt=""
                        className="h-full w-full rounded-t-xl object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Car
                          size={40}
                          strokeWidth={1.5}
                          className="text-muted-foreground/50"
                        />
                      </div>
                    )}

                    {/* Type badge overlaid on image */}
                    <span className="absolute top-2.5 left-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                      {isLease ? "Lease" : "For Sale"}
                    </span>
                  </div>

                  <div className="p-4 space-y-2.5">
                    {/* Title + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-body-sm font-semibold leading-tight truncate">
                          {[v.year, v.make, v.model].filter(Boolean).join(" ") || "Untitled"}
                        </h3>
                        {v.trim && (
                          <p className="text-caption text-muted-foreground truncate mt-0.5">
                            {v.trim}
                          </p>
                        )}
                      </div>
                      <StatusBadge
                        status={VEHICLE_STATUS_LABELS[v.status] ?? "Unknown"}
                        className="shrink-0"
                      />
                    </div>

                    {/* Price row */}
                    <p className="text-body font-semibold">
                      {priceLabel(v)}
                    </p>

                    {/* Detail chips */}
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                      {isLease && v.lease_term && (
                        <span className="rounded-md bg-muted px-2 py-0.5">{v.lease_term}mo</span>
                      )}
                      {isLease && v.lease_annual_mileage && (
                        <span className="rounded-md bg-muted px-2 py-0.5">{formatNumber(v.lease_annual_mileage)} mi/yr</span>
                      )}
                      {!isLease && v.mileage != null && (
                        <span className="rounded-md bg-muted px-2 py-0.5">{formatNumber(v.mileage)} mi</span>
                      )}
                      {v.exterior_color && (
                        <span className="rounded-md bg-muted px-2 py-0.5">{v.exterior_color}</span>
                      )}
                      {v.drive_type && (
                        <span className="rounded-md bg-muted px-2 py-0.5">{v.drive_type}</span>
                      )}
                      {v.fuel_type && (
                        <span className="rounded-md bg-muted px-2 py-0.5">{v.fuel_type}</span>
                      )}
                      {!isLease && v.stock_number && (
                        <span className="rounded-md bg-muted px-2 py-0.5">#{v.stock_number}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
