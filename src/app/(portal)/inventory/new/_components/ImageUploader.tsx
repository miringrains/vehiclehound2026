"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, ImagePlus } from "lucide-react";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

type ImageUploaderProps = {
  onFilesReady: (files: { file: File; preview: string }[]) => void;
  disabled?: boolean;
};

const COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp" as const,
};

export function ImageUploader({ onFilesReady, disabled }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length === 0) return;

      setCompressing(true);
      try {
        const results = await Promise.all(
          files.map(async (file) => {
            const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
            const preview = URL.createObjectURL(compressed);
            return { file: compressed, preview };
          })
        );
        onFilesReady(results);
      } finally {
        setCompressing(false);
      }
    },
    [onFilesReady]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (!disabled) processFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all duration-200",
        dragActive
          ? "border-primary bg-primary/5 scale-[1.005]"
          : "border-border hover:border-primary/30 hover:bg-muted/20",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {compressing ? (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-body-sm text-muted-foreground">Compressing images...</p>
        </>
      ) : (
        <>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200",
              dragActive ? "bg-primary/15" : "bg-primary/10"
            )}
          >
            {dragActive ? (
              <Upload size={20} strokeWidth={ICON_STROKE_WIDTH} className="text-primary" />
            ) : (
              <ImagePlus size={20} strokeWidth={ICON_STROKE_WIDTH} className="text-primary" />
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="text-body-sm font-medium">
              {dragActive ? "Drop images here" : "Click or drag images to upload"}
            </p>
            <p className="text-caption text-muted-foreground">
              JPEG, PNG, or WebP &middot; Auto-compressed to 2 MB
            </p>
          </div>
        </>
      )}
    </div>
  );
}
