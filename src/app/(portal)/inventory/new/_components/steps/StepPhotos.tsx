"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { routes } from "@/config/routes";
import { createClient } from "@/lib/supabase/client";
import { useWizard, type UploadedImage } from "../WizardContext";
import { ImageUploader } from "../ImageUploader";
import { ImageGallery } from "../ImageGallery";

export function StepPhotos() {
  const router = useRouter();
  const { data, setData, images, setImages, dealershipId } = useWizard();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesReady = useCallback(
    (files: { file: File; preview: string }[]) => {
      const newImages: UploadedImage[] = files.map((f, i) => ({
        file_path: "",
        public_url: f.preview,
        display_order: images.length + i,
        file: f.file,
        isPrimary: images.length === 0 && i === 0,
      }));
      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, setImages]
  );

  function handleReorder(reordered: UploadedImage[]) {
    setImages(reordered);
  }

  function handleSetPrimary(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
        display_order: i === index ? 0 : img.display_order >= index ? img.display_order : img.display_order,
      }))
    );
    // Move to first position
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy.map((img, i) => ({ ...img, display_order: i, isPrimary: i === 0 }));
    });
  }

  function handleDelete(index: number) {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((img, i) => ({
        ...img,
        display_order: i,
        isPrimary: i === 0,
      }));
    });
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    try {
      // 1. Create the vehicle record
      const vehiclePayload = {
        dealership_id: dealershipId,
        inventory_type: data.inventory_type,
        vin: data.vin || null,
        year: data.year,
        make: data.make || null,
        model: data.model || null,
        trim: data.trim || null,
        series: data.series || null,
        vehicle_type: data.vehicle_type || null,
        body_class: data.body_class || null,
        doors: data.doors,
        stock_number: data.stock_number || null,
        mileage: data.mileage,
        status: data.status,
        online_price: data.online_price,
        sale_price: data.sale_price,
        msrp: data.msrp,
        purchase_price: data.purchase_price,
        lease_payment: data.lease_payment,
        lease_term: data.lease_term,
        lease_spec: data.lease_spec || null,
        broker_fee: data.broker_fee,
        location_detail: data.location_detail || null,
        engine_hp: data.engine_hp || null,
        engine_cylinders: data.engine_cylinders || null,
        engine_displacement: data.engine_displacement || null,
        fuel_type: data.fuel_type || null,
        transmission_style: data.transmission_style || null,
        drive_type: data.drive_type || null,
        exterior_color: data.exterior_color || null,
        interior_color: data.interior_color || null,
        title_status: data.title_status || null,
        features: data.features,
        description: data.description || null,
      };

      const vehicleRes = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehiclePayload),
      });

      const vehicleResult = await vehicleRes.json();

      if (!vehicleRes.ok) {
        setError(vehicleResult.error || "Failed to create vehicle");
        setSubmitting(false);
        return;
      }

      const vehicleId = vehicleResult.id;

      // 2. Upload images to Supabase Storage and save metadata
      if (images.length > 0) {
        const supabase = createClient();

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (!img.file) continue;

          const ext = img.file.type === "image/webp" ? "webp" : img.file.type === "image/png" ? "png" : "jpg";
          const fileName = `${crypto.randomUUID()}.${ext}`;
          const filePath = `${dealershipId}/${vehicleId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("vehicle-images")
            .upload(filePath, img.file, {
              contentType: img.file.type,
              upsert: false,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          await fetch(`/api/vehicles/${vehicleId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_path: filePath,
              display_order: i,
            }),
          });
        }
      }

      router.push(routes.vehicleDetail(vehicleId));
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-heading-1 mb-1">Photos & Description</h2>
        <p className="text-body text-muted-foreground">
          Upload images and write a compelling description.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image upload */}
      <div className="space-y-4">
        <ImageUploader onFilesReady={handleFilesReady} disabled={submitting} />
        <ImageGallery
          images={images}
          onReorder={handleReorder}
          onSetPrimary={handleSetPrimary}
          onDelete={handleDelete}
        />
        {images.length > 0 && (
          <p className="text-caption text-muted-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""} — drag to reorder, star to set cover photo.
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label>Vehicle Description</Label>
        <Textarea
          rows={5}
          placeholder="Describe the vehicle's condition, history, and highlights..."
          value={data.description}
          onChange={(e) => setData({ description: e.target.value })}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSubmit} disabled={submitting} className="min-w-[180px]">
          {submitting ? (
            <LoadingSpinner size={18} className="text-primary-foreground" />
          ) : (
            "Add Vehicle"
          )}
        </Button>
      </div>
    </div>
  );
}
