"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car, DollarSign, Settings2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { ICON_STROKE_WIDTH, VEHICLE_STATUSES } from "@/lib/constants";
import {
  fuelTypes, transmissionStyles, driveTypes, titleStatuses,
  vehicleTypes, defaultColors,
} from "@/config/vehicle-options";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle, VehicleImage } from "@/types/vehicle";
import { ImageUploader } from "../../../new/_components/ImageUploader";
import { ImageGallery } from "../../../new/_components/ImageGallery";
import type { UploadedImage } from "../../../new/_components/WizardContext";

const TABS = [
  { key: "identity", label: "Vehicle", icon: Car },
  { key: "pricing", label: "Pricing", icon: DollarSign },
  { key: "specs", label: "Details", icon: Settings2 },
  { key: "photos", label: "Photos", icon: ImageIcon },
] as const;

type Tab = (typeof TABS)[number]["key"];

type Props = {
  vehicle: Vehicle;
  dealershipId: string;
  existingImages: VehicleImage[];
};

export function VehicleEditForm({ vehicle, dealershipId, existingImages }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("identity");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    inventory_type: vehicle.inventory_type,
    vin: vehicle.vin ?? "",
    year: vehicle.year,
    make: vehicle.make ?? "",
    model: vehicle.model ?? "",
    trim: vehicle.trim ?? "",
    vehicle_type: vehicle.vehicle_type ?? "",
    body_class: vehicle.body_class ?? "",
    doors: vehicle.doors,
    stock_number: vehicle.stock_number ?? "",
    mileage: vehicle.mileage,
    status: vehicle.status,
    online_price: vehicle.online_price,
    sale_price: vehicle.sale_price,
    msrp: vehicle.msrp,
    purchase_price: vehicle.purchase_price,
    lease_payment: vehicle.lease_payment,
    lease_term: vehicle.lease_term,
    lease_down_payment: vehicle.lease_down_payment,
    lease_annual_mileage: vehicle.lease_annual_mileage,
    lease_spec: vehicle.lease_spec ?? "",
    broker_fee: vehicle.broker_fee,
    taxes_and_fees: vehicle.taxes_and_fees,
    location_detail: vehicle.location_detail ?? "",
    engine_hp: vehicle.engine_hp ?? "",
    engine_cylinders: vehicle.engine_cylinders ?? "",
    engine_displacement: vehicle.engine_displacement ?? "",
    fuel_type: vehicle.fuel_type ?? "",
    transmission_style: vehicle.transmission_style ?? "",
    drive_type: vehicle.drive_type ?? "",
    exterior_color: vehicle.exterior_color ?? "",
    interior_color: vehicle.interior_color ?? "",
    title_status: vehicle.title_status ?? "",
    description: vehicle.description ?? "",
  });

  const [images, setImages] = useState<UploadedImage[]>(
    existingImages.map((img, i) => ({
      id: img.id,
      file_path: img.file_path,
      public_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicle-images/${img.file_path}`,
      display_order: img.display_order,
      isPrimary: i === 0,
    }))
  );

  const [newFiles, setNewFiles] = useState<UploadedImage[]>([]);

  const allImages = [...images, ...newFiles];

  const set = (partial: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleFilesReady = useCallback(
    (files: { file: File; preview: string }[]) => {
      const additions: UploadedImage[] = files.map((f, i) => ({
        file_path: "",
        public_url: f.preview,
        display_order: allImages.length + i,
        file: f.file,
        isPrimary: false,
      }));
      setNewFiles((prev) => [...prev, ...additions]);
    },
    [allImages.length]
  );

  async function handleSave() {
    setError(null);
    setSaving(true);

    try {
      const payload = {
        inventory_type: form.inventory_type,
        vin: form.vin || null,
        year: form.year,
        make: form.make || null,
        model: form.model || null,
        trim: form.trim || null,
        vehicle_type: form.vehicle_type || null,
        body_class: form.body_class || null,
        doors: form.doors,
        stock_number: form.stock_number || null,
        mileage: form.mileage,
        status: form.status,
        online_price: form.online_price,
        sale_price: form.sale_price,
        msrp: form.msrp,
        purchase_price: form.purchase_price,
        lease_payment: form.lease_payment,
        lease_term: form.lease_term,
        lease_down_payment: form.lease_down_payment,
        lease_annual_mileage: form.lease_annual_mileage,
        lease_spec: form.lease_spec || null,
        broker_fee: form.broker_fee,
        taxes_and_fees: form.taxes_and_fees,
        location_detail: form.location_detail || null,
        engine_hp: form.engine_hp || null,
        engine_cylinders: form.engine_cylinders || null,
        engine_displacement: form.engine_displacement || null,
        fuel_type: form.fuel_type || null,
        transmission_style: form.transmission_style || null,
        drive_type: form.drive_type || null,
        exterior_color: form.exterior_color || null,
        interior_color: form.interior_color || null,
        title_status: form.title_status || null,
        description: form.description || null,
      };

      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const r = await res.json();
        setError(r.error || "Failed to save.");
        setSaving(false);
        return;
      }

      // Upload new images
      if (newFiles.length > 0) {
        const supabase = createClient();
        for (let i = 0; i < newFiles.length; i++) {
          const img = newFiles[i];
          if (!img.file) continue;

          const ext = img.file.type === "image/webp" ? "webp" : img.file.type === "image/png" ? "png" : "jpg";
          const fileName = `${crypto.randomUUID()}.${ext}`;
          const filePath = `${dealershipId}/${vehicle.id}/${fileName}`;

          await supabase.storage.from("vehicle-images").upload(filePath, img.file, {
            contentType: img.file.type,
          });

          await fetch(`/api/vehicles/${vehicle.id}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file_path: filePath, display_order: images.length + i }),
          });
        }
      }

      router.push(routes.vehicleDetail(vehicle.id));
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
      setSaving(false);
    }
  }

  const isSale = form.inventory_type === "sale";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={routes.vehicleDetail(vehicle.id)}>
            <ArrowLeft size={18} strokeWidth={ICON_STROKE_WIDTH} />
          </Link>
        </Button>
        <h1 className="text-heading-2">Edit Vehicle</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-body-sm font-medium transition-colors border-b-2 -mb-px",
              tab === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={16} strokeWidth={ICON_STROKE_WIDTH} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {tab === "identity" && (
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <F label="Year" type="number" value={form.year ?? ""} onChange={(v) => set({ year: v ? Number(v) : null })} />
            <F label="Make" value={form.make} onChange={(v) => set({ make: v })} />
            <F label="Model" value={form.model} onChange={(v) => set({ model: v })} />
            <F label="Trim" value={form.trim} onChange={(v) => set({ trim: v })} />
            <F label="VIN" value={form.vin} onChange={(v) => set({ vin: v })} />
            <F label="Stock #" value={form.stock_number} onChange={(v) => set({ stock_number: v })} />
            <F label="Mileage" type="number" value={form.mileage ?? ""} onChange={(v) => set({ mileage: v ? Number(v) : null })} />
            <F label="Doors" type="number" value={form.doors ?? ""} onChange={(v) => set({ doors: v ? Number(v) : null })} />
            <div className="space-y-1.5">
              <Label>Vehicle Type</Label>
              <Select value={form.vehicle_type || undefined} onValueChange={(v) => set({ vehicle_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{vehicleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Listing Type</Label>
              <Select value={form.inventory_type} onValueChange={(v) => set({ inventory_type: v as "sale" | "lease" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={String(form.status)} onValueChange={(v) => set({ status: Number(v) as typeof form.status })}>
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
        )}

        {tab === "pricing" && (
          <div className="space-y-6">
            {isSale ? (
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <PF label="Online Price" value={form.online_price} onChange={(v) => set({ online_price: v })} />
                <PF label="Sale Price" value={form.sale_price} onChange={(v) => set({ sale_price: v })} />
                <PF label="MSRP" value={form.msrp} onChange={(v) => set({ msrp: v })} />
                <PF label="Purchase Price" value={form.purchase_price} onChange={(v) => set({ purchase_price: v })} />
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <PF label="Monthly Payment" value={form.lease_payment} onChange={(v) => set({ lease_payment: v })} />
                <F label="Lease Term (months)" type="number" value={form.lease_term ?? ""} onChange={(v) => set({ lease_term: v ? Number(v) : null })} />
                <F label="Mileage/Year" type="number" value={form.lease_annual_mileage ?? ""} onChange={(v) => set({ lease_annual_mileage: v ? Number(v) : null })} />
                <PF label="Down Payment" value={form.lease_down_payment} onChange={(v) => set({ lease_down_payment: v })} />
                <PF label="MSRP" value={form.msrp} onChange={(v) => set({ msrp: v })} />
                <PF label="Broker Fee" value={form.broker_fee} onChange={(v) => set({ broker_fee: v })} />
                <PF label="Taxes & Fees" value={form.taxes_and_fees} onChange={(v) => set({ taxes_and_fees: v })} />
              </div>
            )}
            <F label="Location Detail" value={form.location_detail} onChange={(v) => set({ location_detail: v })} />
          </div>
        )}

        {tab === "specs" && (
          <div className="space-y-8">
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <F label="Horsepower" value={form.engine_hp} onChange={(v) => set({ engine_hp: v })} />
              <F label="Cylinders" value={form.engine_cylinders} onChange={(v) => set({ engine_cylinders: v })} />
              <F label="Displacement" value={form.engine_displacement} onChange={(v) => set({ engine_displacement: v })} />
              <SF label="Fuel Type" value={form.fuel_type} options={[...fuelTypes]} onChange={(v) => set({ fuel_type: v })} />
              <SF label="Transmission" value={form.transmission_style} options={[...transmissionStyles]} onChange={(v) => set({ transmission_style: v })} />
              <SF label="Drive Type" value={form.drive_type} options={[...driveTypes]} onChange={(v) => set({ drive_type: v })} />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ColorField label="Exterior" value={form.exterior_color} onChange={(v) => set({ exterior_color: v })} />
              <ColorField label="Interior" value={form.interior_color} onChange={(v) => set({ interior_color: v })} />
            </div>
            <SF label="Title Status" value={form.title_status} options={[...titleStatuses]} onChange={(v) => set({ title_status: v })} />
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={5} value={form.description} onChange={(e) => set({ description: e.target.value })} />
            </div>
          </div>
        )}

        {tab === "photos" && (
          <div className="space-y-4">
            <ImageUploader onFilesReady={handleFilesReady} disabled={saving} />
            <ImageGallery
              images={allImages}
              onReorder={(reordered) => {
                const existing = reordered.filter((img) => img.id);
                const fresh = reordered.filter((img) => !img.id);
                setImages(existing);
                setNewFiles(fresh);
              }}
              onSetPrimary={(index) => {
                const all = [...images, ...newFiles];
                const copy = [...all];
                const [item] = copy.splice(index, 1);
                copy.unshift(item);
                const updated = copy.map((img, i) => ({ ...img, display_order: i, isPrimary: i === 0 }));
                setImages(updated.filter((img) => img.id));
                setNewFiles(updated.filter((img) => !img.id));
              }}
              onDelete={async (index) => {
                const all = [...images, ...newFiles];
                const target = all[index];
                if (target.id) {
                  await fetch(`/api/vehicles/${vehicle.id}/images/${target.id}`, { method: "DELETE" });
                  setImages((prev) => prev.filter((img) => img.id !== target.id));
                } else {
                  const newIdx = index - images.length;
                  setNewFiles((prev) => prev.filter((_, i) => i !== newIdx));
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" asChild>
          <Link href={routes.vehicleDetail(vehicle.id)}>Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
          {saving ? <LoadingSpinner size={18} className="text-primary-foreground" /> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function F({ label, value, onChange, type = "text" }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function PF({ label, value, onChange }: {
  label: string; value: number | null; onChange: (v: number | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        <Input
          type="number" step="0.01" value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="pl-7"
        />
      </div>
    </div>
  );
}

function SF({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {defaultColors.map(({ label: cl, hex }) => (
          <button key={hex} type="button" title={cl} onClick={() => onChange(cl)}
            className={cn("h-7 w-7 rounded-full border-2 transition-all",
              value === cl ? "border-primary scale-110 ring-2 ring-primary/30" : "border-border hover:scale-105"
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
      <Input placeholder="Custom color" value={value} onChange={(e) => onChange(e.target.value)} className="max-w-48" />
    </div>
  );
}
