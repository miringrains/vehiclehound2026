"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { WizardProvider, useWizard } from "./WizardContext";
import { StepIndicator } from "./StepIndicator";
import { TypeSelection } from "./steps/TypeSelection";
import { StepIdentity } from "./steps/StepIdentity";
import { StepPricing } from "./steps/StepPricing";
import { StepSpecs } from "./steps/StepSpecs";
import { StepPhotos } from "./steps/StepPhotos";

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
  }),
};

function WizardContent() {
  const { step, stepIndex, canGoBack, back } = useWizard();

  return (
    <div className="mx-auto max-w-[960px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-8">
        <div className="flex items-center gap-3">
          {canGoBack ? (
            <Button variant="ghost" size="icon" onClick={back}>
              <ArrowLeft size={18} strokeWidth={ICON_STROKE_WIDTH} />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href={routes.inventory}>
                <ArrowLeft size={18} strokeWidth={ICON_STROKE_WIDTH} />
              </Link>
            </Button>
          )}
          <h1 className="text-heading-2">New Vehicle</h1>
        </div>
        <StepIndicator />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" custom={stepIndex}>
        <motion.div
          key={step}
          custom={stepIndex}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === "type" && <TypeSelection />}
          {step === "identity" && <StepIdentity />}
          {step === "pricing" && <StepPricing />}
          {step === "specs" && <StepSpecs />}
          {step === "photos" && <StepPhotos />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function VehicleWizard({ dealershipId }: { dealershipId: string }) {
  return (
    <WizardProvider dealershipId={dealershipId}>
      <WizardContent />
    </WizardProvider>
  );
}
