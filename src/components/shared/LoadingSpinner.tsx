import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

type LoadingSpinnerProps = {
  size?: number;
  className?: string;
};

export function LoadingSpinner({ size = 16, className }: LoadingSpinnerProps) {
  return (
    <Loader2
      size={size}
      strokeWidth={ICON_STROKE_WIDTH}
      className={cn("animate-spin text-muted-foreground", className)}
    />
  );
}
