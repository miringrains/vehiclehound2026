"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { routes } from "@/config/routes";
import { ICON_STROKE_WIDTH, VEHICLE_STATUSES } from "@/lib/constants";
import {
  fuelTypes,
  transmissionStyles,
  driveTypes,
  titleStatuses,
  vehicleTypes,
} from "@/config/vehicle-options";
import type { Vehicle } from "@/types/vehicle";

type Props = {
  dealershipId: string;
  vehicle?: Vehicle;
};

export function VehicleForm({ dealershipId, vehicle }: Props) {
  const router = useRouter();
  const isEditing = !!vehicle;
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const fd = new FormData(e.currentTarget);

    const numOrNull = (key: string) => {
      const val = fd.get(key)?.toString().trim();
      if (!val) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    const strOrNull = (key: string) => {
      const val = fd.get(key)?.toString().trim();
      return val || null;
    };

    const payload = {
      dealership_id: dealershipId,
      inventory_type: fd.get("inventory_type") || "sale",
      stock_number: strOrNull("stock_number"),
      vin: strOrNull("vin"),
      year: numOrNull("year"),
      make: strOrNull("make"),
      model: strOrNull("model"),
      trim: strOrNull("trim"),
      vehicle_type: strOrNull("vehicle_type"),
      body_class: strOrNull("body_class"),
      doors: numOrNull("doors"),
      mileage: numOrNull("mileage"),
      online_price: numOrNull("online_price"),
      sale_price: numOrNull("sale_price"),
      purchase_price: numOrNull("purchase_price"),
      msrp: numOrNull("msrp"),
      lease_payment: numOrNull("lease_payment"),
      lease_term: numOrNull("lease_term"),
      broker_fee: numOrNull("broker_fee"),
      engine_hp: strOrNull("engine_hp"),
      engine_cylinders: strOrNull("engine_cylinders"),
      fuel_type: strOrNull("fuel_type"),
      transmission_style: strOrNull("transmission_style"),
      drive_type: strOrNull("drive_type"),
      exterior_color: strOrNull("exterior_color"),
      interior_color: strOrNull("interior_color"),
      description: strOrNull("description"),
      title_status: strOrNull("title_status"),
      status: Number(fd.get("status")) || VEHICLE_STATUSES.AVAILABLE,
    };

    const url = isEditing ? `/api/vehicles/${vehicle.id}` : "/api/vehicles";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }

    router.push(routes.vehicleDetail(result.id || vehicle?.id || ""));
    router.refresh();
  }

  const d = (key: keyof Vehicle) => (vehicle?.[key] as string) ?? "";
  const n = (key: keyof Vehicle) => {
    const v = vehicle?.[key];
    return v != null ? String(v) : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={isEditing ? routes.vehicleDetail(vehicle.id) : routes.inventory}>
            <ArrowLeft size={18} strokeWidth={ICON_STROKE_WIDTH} />
          </Link>
        </Button>
        <PageHeader title={isEditing ? "Edit Vehicle" : "Add Vehicle"} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <fieldset className="rounded-xl border border-border bg-card p-6 space-y-4">
          <legend className="text-heading-4 px-1">Basic Information</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" placeholder="2024" defaultValue={n("year")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="make">Make</Label>
              <Input id="make" name="make" placeholder="Toyota" defaultValue={d("make")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" placeholder="Camry" defaultValue={d("model")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trim">Trim</Label>
              <Input id="trim" name="trim" placeholder="XSE" defaultValue={d("trim")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" name="vin" placeholder="1HGBH41JXMN109186" defaultValue={d("vin")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock_number">Stock #</Label>
              <Input id="stock_number" name="stock_number" placeholder="STK-001" defaultValue={d("stock_number")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mileage">Mileage</Label>
              <Input id="mileage" name="mileage" type="number" placeholder="25000" defaultValue={n("mileage")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doors">Doors</Label>
              <Input id="doors" name="doors" type="number" placeholder="4" defaultValue={n("doors")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select name="vehicle_type" defaultValue={d("vehicle_type") || undefined}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inventory_type">Listing Type</Label>
              <Select name="inventory_type" defaultValue={d("inventory_type") || "sale"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={String(vehicle?.status ?? VEHICLE_STATUSES.AVAILABLE)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(VEHICLE_STATUSES.AVAILABLE)}>Available</SelectItem>
                  <SelectItem value={String(VEHICLE_STATUSES.PENDING)}>Pending</SelectItem>
                  <SelectItem value={String(VEHICLE_STATUSES.IN_TRANSIT)}>In Transit</SelectItem>
                  <SelectItem value={String(VEHICLE_STATUSES.SOLD)}>Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </fieldset>

        {/* Pricing */}
        <fieldset className="rounded-xl border border-border bg-card p-6 space-y-4">
          <legend className="text-heading-4 px-1">Pricing</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="online_price">Online Price ($)</Label>
              <Input id="online_price" name="online_price" type="number" step="0.01" placeholder="29999" defaultValue={n("online_price")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sale_price">Sale Price ($)</Label>
              <Input id="sale_price" name="sale_price" type="number" step="0.01" placeholder="28500" defaultValue={n("sale_price")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msrp">MSRP ($)</Label>
              <Input id="msrp" name="msrp" type="number" step="0.01" placeholder="32000" defaultValue={n("msrp")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchase_price">Purchase Price ($)</Label>
              <Input id="purchase_price" name="purchase_price" type="number" step="0.01" placeholder="24000" defaultValue={n("purchase_price")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="lease_payment">Lease Payment ($/mo)</Label>
              <Input id="lease_payment" name="lease_payment" type="number" step="0.01" defaultValue={n("lease_payment")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lease_term">Lease Term (months)</Label>
              <Input id="lease_term" name="lease_term" type="number" defaultValue={n("lease_term")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="broker_fee">Broker Fee ($)</Label>
              <Input id="broker_fee" name="broker_fee" type="number" step="0.01" defaultValue={n("broker_fee")} />
            </div>
          </div>
        </fieldset>

        {/* Specs */}
        <fieldset className="rounded-xl border border-border bg-card p-6 space-y-4">
          <legend className="text-heading-4 px-1">Specs & Appearance</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="engine_hp">Horsepower</Label>
              <Input id="engine_hp" name="engine_hp" placeholder="203" defaultValue={d("engine_hp")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="engine_cylinders">Cylinders</Label>
              <Input id="engine_cylinders" name="engine_cylinders" placeholder="4" defaultValue={d("engine_cylinders")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Select name="fuel_type" defaultValue={d("fuel_type") || undefined}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transmission_style">Transmission</Label>
              <Select name="transmission_style" defaultValue={d("transmission_style") || undefined}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {transmissionStyles.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="drive_type">Drive Type</Label>
              <Select name="drive_type" defaultValue={d("drive_type") || undefined}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {driveTypes.map((dt) => <SelectItem key={dt} value={dt}>{dt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title_status">Title Status</Label>
              <Select name="title_status" defaultValue={d("title_status") || undefined}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {titleStatuses.map((ts) => <SelectItem key={ts} value={ts}>{ts}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="exterior_color">Exterior Color</Label>
              <Input id="exterior_color" name="exterior_color" placeholder="Black" defaultValue={d("exterior_color")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interior_color">Interior Color</Label>
              <Input id="interior_color" name="interior_color" placeholder="Black Leather" defaultValue={d("interior_color")} />
            </div>
          </div>
        </fieldset>

        {/* Description */}
        <fieldset className="rounded-xl border border-border bg-card p-6 space-y-4">
          <legend className="text-heading-4 px-1">Description</legend>
          <div className="space-y-1.5">
            <Label htmlFor="description">Vehicle Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the vehicle's condition, history, and highlights..."
              defaultValue={d("description")}
            />
          </div>
        </fieldset>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" asChild>
            <Link href={isEditing ? routes.vehicleDetail(vehicle.id) : routes.inventory}>
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <LoadingSpinner size={18} className="text-primary-foreground" />
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Vehicle"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
