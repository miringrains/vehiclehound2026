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
};

export function InventoryList({ vehicles }: { vehicles: VehicleSummary[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
          {filtered.map((v) => (
            <motion.div key={v.id} variants={staggerItem}>
              <Link
                href={routes.vehicleDetail(v.id)}
                className="group block rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
              >
                <div className="flex h-40 items-center justify-center rounded-t-xl bg-muted">
                  {v.preview_image ? (
                    <img
                      src={v.preview_image}
                      alt=""
                      className="h-full w-full rounded-t-xl object-cover"
                    />
                  ) : (
                    <Car
                      size={40}
                      strokeWidth={1.5}
                      className="text-muted-foreground/50"
                    />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-body-sm font-medium leading-tight truncate">
                      {[v.year, v.make, v.model].filter(Boolean).join(" ") ||
                        "Untitled"}
                    </h3>
                    <StatusBadge
                      status={VEHICLE_STATUS_LABELS[v.status] ?? "Unknown"}
                    />
                  </div>
                  {v.trim && (
                    <p className="text-caption text-muted-foreground truncate">
                      {v.trim}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-caption text-muted-foreground">
                    <span>
                      {v.online_price
                        ? formatCurrencyDollars(v.online_price)
                        : "No price"}
                    </span>
                    <span>
                      {v.mileage ? `${formatNumber(v.mileage)} mi` : ""}
                    </span>
                  </div>
                  {v.stock_number && (
                    <p className="text-caption text-muted-foreground">
                      Stock #{v.stock_number}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
