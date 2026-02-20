"use client";

import { cn } from "@/lib/utils";
import { WIZARD_STEPS, useWizard, type WizardStep } from "./WizardContext";

const STEP_LABELS: Record<WizardStep, string> = {
  type: "Type",
  identity: "Vehicle",
  pricing: "Pricing",
  specs: "Details",
  photos: "Photos",
};

export function StepIndicator() {
  const { step, stepIndex } = useWizard();

  if (step === "type") return null;

  const activeSteps = WIZARD_STEPS.filter((s) => s !== "type");
  const adjustedIndex = stepIndex - 1;

  return (
    <div className="flex items-center gap-2">
      {activeSteps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                i <= adjustedIndex
                  ? "bg-primary scale-100"
                  : "bg-border scale-75"
              )}
            />
            <span
              className={cn(
                "text-caption transition-colors duration-300 hidden sm:inline",
                i === adjustedIndex
                  ? "text-foreground"
                  : i < adjustedIndex
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
              )}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < activeSteps.length - 1 && (
            <div
              className={cn(
                "h-px w-6 transition-colors duration-300",
                i < adjustedIndex ? "bg-primary/40" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
