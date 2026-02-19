"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Car, TrendingUp, Plus, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { VEHICLE_STATUS_LABELS, ICON_STROKE_WIDTH } from "@/lib/constants";
import { formatCurrencyDollars } from "@/lib/utils/format-currency";

type DashboardStats = {
  total: number;
  forSale: number;
  recentlyAdded: number;
  sold: number;
};

type RecentVehicle = {
  id: string;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  status: number;
  online_price: number | null;
  preview_image: string | null;
  created_at: string;
};

type Props = {
  stats: DashboardStats;
  recentVehicles: RecentVehicle[];
  dealership: { name: string; trial_ends_at: string | null; subscription_status: string | null } | null;
  profile: { name: string | null; dealership_role: string };
};

const statCards = [
  { key: "total" as const, label: "Total Vehicles", icon: Car },
  { key: "forSale" as const, label: "For Sale", icon: TrendingUp },
  { key: "recentlyAdded" as const, label: "Added This Week", icon: Plus },
  { key: "sold" as const, label: "Sold", icon: Clock },
];

export function DashboardContent({ stats, recentVehicles, dealership, profile }: Props) {
  const greeting = profile.name ? `Welcome back, ${profile.name.split(" ")[0]}` : "Welcome back";

  return (
    <div className="space-y-8">
      <PageHeader
        title={greeting}
        description={
          dealership
            ? `${dealership.name} — Overview of your inventory and activity.`
            : "Overview of your dealership."
        }
      >
        <Button asChild>
          <Link href={routes.vehicleNew}>
            <Plus size={18} strokeWidth={ICON_STROKE_WIDTH} />
            Add Vehicle
          </Link>
        </Button>
      </PageHeader>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map(({ key, label, icon: Icon }) => (
          <motion.div
            key={key}
            variants={staggerItem}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-caption text-muted-foreground">{label}</p>
              <Icon
                size={18}
                strokeWidth={ICON_STROKE_WIDTH}
                className="text-muted-foreground"
              />
            </div>
            <p className="mt-2 text-heading-2">{stats[key]}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-heading-3">Recent Vehicles</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.inventory}>View All</Link>
          </Button>
        </div>

        {recentVehicles.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Car}
              title="No vehicles yet"
              description="Add your first vehicle to get started."
              actionLabel="Add Vehicle"
              onAction={() => {
                window.location.href = routes.vehicleNew;
              }}
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentVehicles.map((v) => (
              <Link
                key={v.id}
                href={routes.vehicleDetail(v.id)}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {v.preview_image ? (
                    <img
                      src={v.preview_image}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <Car
                      size={20}
                      strokeWidth={ICON_STROKE_WIDTH}
                      className="text-muted-foreground"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium truncate">
                    {[v.year, v.make, v.model, v.trim].filter(Boolean).join(" ") || "Untitled Vehicle"}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {v.online_price ? formatCurrencyDollars(v.online_price) : "No price set"}
                  </p>
                </div>
                <StatusBadge status={VEHICLE_STATUS_LABELS[v.status] ?? "Unknown"} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
