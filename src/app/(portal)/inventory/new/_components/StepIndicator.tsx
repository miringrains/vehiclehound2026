"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
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
    <nav aria-label="Wizard progress" className="flex items-center gap-1">
      {activeSteps.map((s, i) => {
        const isCompleted = i < adjustedIndex;
        const isCurrent = i === adjustedIndex;

        return (
          <div key={s} className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-300",
                  isCompleted &&
                    "bg-primary text-primary-foreground",
                  isCurrent &&
                    "bg-primary/15 text-primary ring-1 ring-primary/40",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-muted text-muted-foreground/60"
                )}
              >
                {isCompleted ? (
                  <Check size={12} strokeWidth={ICON_STROKE_WIDTH + 0.5} />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-caption transition-colors duration-300 hidden sm:inline",
                  isCurrent && "text-foreground",
                  isCompleted && "text-muted-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground/40"
                )}
              >
                {STEP_LABELS[s]}
              </span>
            </div>

            {i < activeSteps.length - 1 && (
              <div
                className={cn(
                  "h-px w-5 transition-colors duration-300 mx-0.5",
                  isCompleted ? "bg-primary/50" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
