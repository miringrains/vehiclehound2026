"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import type { UploadedImage } from "./WizardContext";

type ImageGalleryProps = {
  images: UploadedImage[];
  onReorder: (images: UploadedImage[]) => void;
  onSetPrimary: (index: number) => void;
  onDelete: (index: number) => void;
};

export function ImageGallery({
  images,
  onReorder,
  onSetPrimary,
  onDelete,
}: ImageGalleryProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((_, i) => `img-${i}` === active.id);
    const newIndex = images.findIndex((_, i) => `img-${i}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(images, oldIndex, newIndex).map(
        (img, i) => ({ ...img, display_order: i, isPrimary: i === 0 })
      );
      onReorder(reordered);
    }
  }

  if (images.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map((_, i) => `img-${i}`)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <SortableImageCard
              key={`img-${i}`}
              id={`img-${i}`}
              image={img}
              index={i}
              onSetPrimary={onSetPrimary}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableImageCard({
  id,
  image,
  index,
  onSetPrimary,
  onDelete,
}: {
  id: string;
  image: UploadedImage;
  index: number;
  onSetPrimary: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted",
        isDragging && "z-10 opacity-80 shadow-lg scale-105"
      )}
    >
      <img
        src={image.public_url}
        alt=""
        className="h-full w-full object-cover"
      />

      {/* Overlay controls */}
      <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-foreground shadow-sm cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} strokeWidth={ICON_STROKE_WIDTH} />
        </button>

        <div className="flex gap-1.5">
          {/* Primary toggle */}
          <button
            type="button"
            onClick={() => onSetPrimary(index)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md shadow-sm transition-colors",
              image.isPrimary
                ? "bg-primary text-primary-foreground"
                : "bg-white/90 text-muted-foreground hover:text-primary"
            )}
          >
            <Star size={14} strokeWidth={ICON_STROKE_WIDTH} fill={image.isPrimary ? "currentColor" : "none"} />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
          >
            <Trash2 size={14} strokeWidth={ICON_STROKE_WIDTH} />
          </button>
        </div>
      </div>

      {/* Primary badge */}
      {image.isPrimary && (
        <div className="absolute bottom-2 left-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          Cover
        </div>
      )}
    </div>
  );
}
