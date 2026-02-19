"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Car,
  Gauge,
  Fuel,
  Calendar,
  Palette,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import {
  VEHICLE_STATUS_LABELS,
  ICON_STROKE_WIDTH,
} from "@/lib/constants";
import { formatCurrencyDollars } from "@/lib/utils/format-currency";
import { formatNumber } from "@/lib/utils/format-number";
import type { Vehicle } from "@/types/vehicle";

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-body-sm text-muted-foreground">{label}</span>
      <span className="text-body-sm font-medium">{value}</span>
    </div>
  );
}

export function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const title =
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "Vehicle Details";

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push(routes.inventory);
      router.refresh();
    }
    setDeleting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={routes.inventory}>
            <ArrowLeft size={18} strokeWidth={ICON_STROKE_WIDTH} />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader title={title}>
            <StatusBadge
              status={VEHICLE_STATUS_LABELS[vehicle.status] ?? "Unknown"}
            />
            <Button variant="outline" size="sm" asChild>
              <Link href={routes.vehicleEdit(vehicle.id)}>
                <Pencil size={14} strokeWidth={ICON_STROKE_WIDTH} />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 size={14} strokeWidth={ICON_STROKE_WIDTH} />
              Delete
            </Button>
          </PageHeader>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Image area */}
        <div className="lg:col-span-2">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
            {vehicle.preview_image ? (
              <img
                src={vehicle.preview_image}
                alt={title}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <Car size={48} strokeWidth={1.5} className="text-muted-foreground/30" />
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-1">
          <h3 className="text-heading-4 mb-4">Pricing</h3>
          <DetailRow label="Online Price" value={vehicle.online_price ? formatCurrencyDollars(vehicle.online_price) : null} />
          <DetailRow label="Sale Price" value={vehicle.sale_price ? formatCurrencyDollars(vehicle.sale_price) : null} />
          <DetailRow label="MSRP" value={vehicle.msrp ? formatCurrencyDollars(vehicle.msrp) : null} />
          <DetailRow label="Purchase Price" value={vehicle.purchase_price ? formatCurrencyDollars(vehicle.purchase_price) : null} />
          {vehicle.inventory_type === "lease" && (
            <>
              <DetailRow label="Lease Payment" value={vehicle.lease_payment ? `${formatCurrencyDollars(vehicle.lease_payment)}/mo` : null} />
              <DetailRow label="Lease Term" value={vehicle.lease_term ? `${vehicle.lease_term} months` : null} />
              <DetailRow label="Broker Fee" value={vehicle.broker_fee ? formatCurrencyDollars(vehicle.broker_fee) : null} />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Specs */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-heading-4 mb-4 flex items-center gap-2">
            <Gauge size={18} strokeWidth={ICON_STROKE_WIDTH} /> Specs
          </h3>
          <DetailRow label="VIN" value={vehicle.vin} />
          <DetailRow label="Stock #" value={vehicle.stock_number} />
          <DetailRow label="Mileage" value={vehicle.mileage ? `${formatNumber(vehicle.mileage)} mi` : null} />
          <DetailRow label="Trim" value={vehicle.trim} />
          <DetailRow label="Body" value={vehicle.body_class} />
          <DetailRow label="Doors" value={vehicle.doors?.toString()} />
        </div>

        {/* Powertrain */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-heading-4 mb-4 flex items-center gap-2">
            <Fuel size={18} strokeWidth={ICON_STROKE_WIDTH} /> Powertrain
          </h3>
          <DetailRow label="Engine" value={vehicle.engine_hp ? `${vehicle.engine_hp} HP` : null} />
          <DetailRow label="Cylinders" value={vehicle.engine_cylinders} />
          <DetailRow label="Displacement" value={vehicle.engine_displacement} />
          <DetailRow label="Fuel" value={vehicle.fuel_type} />
          <DetailRow label="Transmission" value={vehicle.transmission_style} />
          <DetailRow label="Drive" value={vehicle.drive_type} />
        </div>

        {/* Appearance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-heading-4 mb-4 flex items-center gap-2">
            <Palette size={18} strokeWidth={ICON_STROKE_WIDTH} /> Appearance
          </h3>
          <DetailRow label="Exterior" value={vehicle.exterior_color} />
          <DetailRow label="Interior" value={vehicle.interior_color} />
          <DetailRow label="Type" value={vehicle.inventory_type === "lease" ? "Lease" : "Sale"} />
          <DetailRow label="Title Status" value={vehicle.title_status} />
        </div>
      </div>

      {vehicle.description && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-heading-4 mb-3 flex items-center gap-2">
            <Calendar size={18} strokeWidth={ICON_STROKE_WIDTH} /> Description
          </h3>
          <p className="text-body-sm text-muted-foreground whitespace-pre-wrap">
            {vehicle.description}
          </p>
        </div>
      )}

      {vehicle.features && (vehicle.features as string[]).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-heading-4 mb-3">Features</h3>
          <div className="flex flex-wrap gap-2">
            {(vehicle.features as string[]).map((f) => (
              <span
                key={f}
                className="rounded-md bg-muted px-2.5 py-1 text-caption text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Vehicle"
        description="This action cannot be undone. The vehicle and all its images will be permanently deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
        variant="destructive"
      />
    </div>
  );
}
