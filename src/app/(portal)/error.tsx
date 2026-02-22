"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Portal Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle size={28} strokeWidth={ICON_STROKE_WIDTH} className="text-destructive" />
      </div>
      <h2 className="text-heading-2 mb-2">Something went wrong</h2>
      <p className="text-body-sm text-muted-foreground max-w-md mb-6">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
