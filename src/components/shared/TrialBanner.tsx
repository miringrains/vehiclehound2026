"use client";

import { useState } from "react";
import { X, Clock } from "lucide-react";
import { useTrialStatus } from "@/hooks/use-dealership";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

export function TrialBanner() {
  const trial = useTrialStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!trial || dismissed) return null;

  const message = trial.expired
    ? "Your trial has expired"
    : `${trial.daysLeft} day${trial.daysLeft !== 1 ? "s" : ""} left in your trial`;

  return (
    <div className={`flex items-center justify-between gap-2 px-4 py-1.5 text-caption font-medium ${
      trial.expired ? "bg-red-500/10 text-red-400" : "bg-primary/5 text-primary"
    }`}>
      <div className="flex items-center gap-1.5">
        <Clock size={12} strokeWidth={ICON_STROKE_WIDTH} />
        <span>{message}</span>
      </div>
      <button onClick={() => setDismissed(true)} className="hover:opacity-70">
        <X size={12} strokeWidth={ICON_STROKE_WIDTH} />
      </button>
    </div>
  );
}
