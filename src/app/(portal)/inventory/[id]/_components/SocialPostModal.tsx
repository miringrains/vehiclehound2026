"use client";

import { useState } from "react";
import { Download, RefreshCw, Instagram, Facebook, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SocialFormat = "instagram-post" | "instagram-story" | "facebook-post";

const FORMATS: {
  id: SocialFormat;
  label: string;
  icon: React.ReactNode;
  aspect: string;
  previewClass: string;
}[] = [
  {
    id: "instagram-post",
    label: "Instagram Post",
    icon: <Instagram size={18} />,
    aspect: "1:1",
    previewClass: "aspect-square",
  },
  {
    id: "instagram-story",
    label: "Instagram Story",
    icon: <Instagram size={18} />,
    aspect: "9:16",
    previewClass: "aspect-[9/16]",
  },
  {
    id: "facebook-post",
    label: "Facebook Post",
    icon: <Facebook size={18} />,
    aspect: "1.91:1",
    previewClass: "aspect-[1.91/1]",
  },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  vehicleTitle: string;
};

export function SocialPostModal({
  open,
  onOpenChange,
  vehicleId,
  vehicleTitle,
}: Props) {
  const [format, setFormat] = useState<SocialFormat>("instagram-post");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/social-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.");
        return;
      }

      setGeneratedImage(data.image);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    const ext = generatedImage.startsWith("data:image/png") ? "png" : "jpg";
    link.download = `${vehicleTitle.replace(/\s+/g, "-").toLowerCase()}-${format}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleRegenerate() {
    setGeneratedImage(null);
    handleGenerate();
  }

  const selectedFormat = FORMATS.find((f) => f.id === format)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Social Post</DialogTitle>
          <DialogDescription>
            Create a professional marketing graphic for {vehicleTitle}
          </DialogDescription>
        </DialogHeader>

        {!generatedImage ? (
          <div className="space-y-5">
            <div>
              <p className="text-body-sm font-medium mb-2.5">Choose format</p>
              <div className="grid grid-cols-3 gap-3">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    disabled={generating}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                      format === f.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="text-muted-foreground">{f.icon}</div>
                    <span className="text-caption font-medium">{f.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {f.aspect}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8">
              <div
                className={cn(
                  "w-32 rounded-md bg-muted/50 border border-border flex items-center justify-center",
                  selectedFormat.previewClass
                )}
              >
                <span className="text-[10px] text-muted-foreground">
                  {selectedFormat.aspect}
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-body-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>

            {generating && (
              <p className="text-center text-caption text-muted-foreground">
                This may take 15–30 seconds
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center rounded-lg border border-border bg-muted/20 p-4">
              <img
                src={generatedImage}
                alt={`Generated ${selectedFormat.label} for ${vehicleTitle}`}
                className="max-h-[60vh] rounded-md object-contain"
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleDownload}>
                <Download size={16} />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRegenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
