"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  value: string;
  className?: string;
};

export function CopyButton({ value, className }: CopyButtonProps) {
  const { copied, copy } = useClipboard();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => copy(value)}
      className={cn("h-7 w-7", className)}
    >
      {copied ? (
        <Check size={14} strokeWidth={ICON_STROKE_WIDTH} className="text-success" />
      ) : (
        <Copy size={14} strokeWidth={ICON_STROKE_WIDTH} />
      )}
    </Button>
  );
}
