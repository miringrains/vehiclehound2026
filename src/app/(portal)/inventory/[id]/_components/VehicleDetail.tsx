"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Pencil, Trash2, Car, Gauge, Fuel, Calendar, Palette,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { VEHICLE_STATUS_LABELS, ICON_STROKE_WIDTH } from "@/lib/constants";
import { formatCurrencyDollars } from "@/lib/utils/format-currency";
import { formatNumber } from "@/lib/utils/format-number";
import type { Vehicle, VehicleImage } from "@/types/vehicle";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-body-sm text-muted-foreground">{label}</span>
      <span className="text-body-sm font-medium">{value}</span>
    </div>
  );
}

type Props = {
  vehicle: Vehicle;
  images: VehicleImage[];
};

export function VehicleDetail({ vehicle, images }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageUrls = images.map(
    (img) => `${projectUrl}/storage/v1/object/public/vehicle-images/${img.file_path}`
  );

  const title =
    [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ") ||
    "Vehicle Details";

  const isLease = vehicle.inventory_type === "lease";

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
              status={isLease ? "Lease" : "For Sale"}
              variant="default"
            />
            <StatusBadge status={VEHICLE_STATUS_LABELS[vehicle.status] ?? "Unknown"} />
            <Button variant="outline" size="sm" asChild>
              <Link href={routes.vehicleEdit(vehicle.id)}>
                <Pencil size={14} strokeWidth={ICON_STROKE_WIDTH} /> Edit
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
              <Trash2 size={14} strokeWidth={ICON_STROKE_WIDTH} /> Delete
            </Button>
          </PageHeader>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Image gallery */}
        <div className="lg:col-span-2 space-y-3">
          {/* Main image */}
          <div className="relative flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-card overflow-hidden">
            {imageUrls.length > 0 ? (
              <>
                <img
                  src={imageUrls[activeImage]}
                  alt={`${title} - Photo ${activeImage + 1}`}
                  className="h-full w-full object-cover"
                />
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((p) => (p === 0 ? imageUrls.length - 1 : p - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImage((p) => (p === imageUrls.length - 1 ? 0 : p + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">
                      {activeImage + 1} / {imageUrls.length}
                    </div>
                  </>
                )}
              </>
            ) : vehicle.preview_image ? (
              <img src={vehicle.preview_image} alt={title} className="h-full w-full object-cover" />
            ) : (
              <Car size={48} strokeWidth={1.5} className="text-muted-foreground/30" />
            )}
          </div>

          {/* Thumbnails */}
          {imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "h-16 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                    i === activeImage ? "border-primary ring-1 ring-primary/30" : "border-border opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-1">
          <h3 className="text-heading-4 mb-4">Pricing</h3>
          {isLease ? (
            <>
              <DetailRow label="Monthly Payment" value={vehicle.lease_payment ? `${formatCurrencyDollars(vehicle.lease_payment)}/mo` : null} />
              <DetailRow label="Term" value={vehicle.lease_term ? `${vehicle.lease_term} months` : null} />
              <DetailRow label="Mileage" value={vehicle.lease_annual_mileage ? `${formatNumber(vehicle.lease_annual_mileage)} mi/yr` : null} />
              <DetailRow label="Due at Signing" value={vehicle.lease_down_payment != null ? formatCurrencyDollars(vehicle.lease_down_payment) : null} />
              <DetailRow label="MSRP" value={vehicle.msrp ? formatCurrencyDollars(vehicle.msrp) : null} />
              <DetailRow label="Taxes & Fees" value={vehicle.taxes_and_fees ? formatCurrencyDollars(vehicle.taxes_and_fees) : null} />
            </>
          ) : (
            <>
              <DetailRow label="Online Price" value={vehicle.online_price ? formatCurrencyDollars(vehicle.online_price) : null} />
              <DetailRow label="Sale Price" value={vehicle.sale_price ? formatCurrencyDollars(vehicle.sale_price) : null} />
              <DetailRow label="MSRP" value={vehicle.msrp ? formatCurrencyDollars(vehicle.msrp) : null} />
              <DetailRow label="Purchase Price" value={vehicle.purchase_price ? formatCurrencyDollars(vehicle.purchase_price) : null} />
            </>
          )}
          <DetailRow label="Location" value={vehicle.location_detail} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-heading-4 mb-4 flex items-center gap-2">
            <Gauge size={18} strokeWidth={ICON_STROKE_WIDTH} /> Specs
          </h3>
          {!isLease && <DetailRow label="VIN" value={vehicle.vin} />}
          {!isLease && <DetailRow label="Stock #" value={vehicle.stock_number} />}
          {!isLease && <DetailRow label="Mileage" value={vehicle.mileage ? `${formatNumber(vehicle.mileage)} mi` : null} />}
          <DetailRow label="Trim" value={vehicle.trim} />
          <DetailRow label="Body" value={vehicle.body_class} />
          <DetailRow label="Doors" value={vehicle.doors?.toString()} />
        </div>

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

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-heading-4 mb-4 flex items-center gap-2">
            <Palette size={18} strokeWidth={ICON_STROKE_WIDTH} /> Appearance
          </h3>
          <DetailRow label="Exterior" value={vehicle.exterior_color} />
          <DetailRow label="Interior" value={vehicle.interior_color} />
          {!isLease && <DetailRow label="Title Status" value={vehicle.title_status} />}
        </div>
      </div>

      {vehicle.description && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-heading-4 mb-3 flex items-center gap-2">
            <Calendar size={18} strokeWidth={ICON_STROKE_WIDTH} /> Description
          </h3>
          <p className="text-body-sm text-muted-foreground whitespace-pre-wrap">{vehicle.description}</p>
        </div>
      )}

      {vehicle.features && (vehicle.features as string[]).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-heading-4 mb-3">Features</h3>
          <div className="flex flex-wrap gap-2">
            {(vehicle.features as string[]).map((f) => (
              <span key={f} className="rounded-md bg-muted px-2.5 py-1 text-caption text-muted-foreground">{f}</span>
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
