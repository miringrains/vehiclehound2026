"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { InventoryType, VehicleStatus } from "@/types/vehicle";
import { VEHICLE_STATUSES } from "@/lib/constants";

export type WizardData = {
  inventory_type: InventoryType | null;
  vin: string;
  year: number | null;
  make: string;
  model: string;
  trim: string;
  series: string;
  vehicle_type: string;
  body_class: string;
  doors: number | null;
  stock_number: string;
  mileage: number | null;
  status: VehicleStatus;

  online_price: number | null;
  sale_price: number | null;
  msrp: number | null;
  purchase_price: number | null;
  lease_payment: number | null;
  lease_term: number | null;
  lease_spec: string;
  broker_fee: number | null;
  location_detail: string;

  engine_hp: string;
  engine_cylinders: string;
  engine_displacement: string;
  fuel_type: string;
  transmission_style: string;
  drive_type: string;
  exterior_color: string;
  interior_color: string;
  title_status: string;
  features: string[];
  description: string;
};

export type UploadedImage = {
  id?: string;
  file_path: string;
  public_url: string;
  display_order: number;
  file?: File;
  isPrimary: boolean;
};

export const WIZARD_STEPS = [
  "type",
  "identity",
  "pricing",
  "specs",
  "photos",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

type WizardContextValue = {
  data: WizardData;
  images: UploadedImage[];
  step: WizardStep;
  stepIndex: number;
  dealershipId: string;
  setData: (partial: Partial<WizardData>) => void;
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  goTo: (step: WizardStep) => void;
  next: () => void;
  back: () => void;
  canGoBack: boolean;
};

const WizardContext = createContext<WizardContextValue | null>(null);

const INITIAL_DATA: WizardData = {
  inventory_type: null,
  vin: "",
  year: null,
  make: "",
  model: "",
  trim: "",
  series: "",
  vehicle_type: "",
  body_class: "",
  doors: null,
  stock_number: "",
  mileage: null,
  status: VEHICLE_STATUSES.FOR_SALE,
  online_price: null,
  sale_price: null,
  msrp: null,
  purchase_price: null,
  lease_payment: null,
  lease_term: null,
  lease_spec: "",
  broker_fee: null,
  location_detail: "",
  engine_hp: "",
  engine_cylinders: "",
  engine_displacement: "",
  fuel_type: "",
  transmission_style: "",
  drive_type: "",
  exterior_color: "",
  interior_color: "",
  title_status: "",
  features: [],
  description: "",
};

export function WizardProvider({
  children,
  dealershipId,
}: {
  children: ReactNode;
  dealershipId: string;
}) {
  const [data, setDataState] = useState<WizardData>(INITIAL_DATA);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [step, setStep] = useState<WizardStep>("type");

  const stepIndex = WIZARD_STEPS.indexOf(step);

  const setData = useCallback((partial: Partial<WizardData>) => {
    setDataState((prev) => ({ ...prev, ...partial }));
  }, []);

  const goTo = useCallback((s: WizardStep) => setStep(s), []);

  const next = useCallback(() => {
    const idx = WIZARD_STEPS.indexOf(step);
    if (idx < WIZARD_STEPS.length - 1) {
      setStep(WIZARD_STEPS[idx + 1]);
    }
  }, [step]);

  const back = useCallback(() => {
    const idx = WIZARD_STEPS.indexOf(step);
    if (idx > 0) {
      setStep(WIZARD_STEPS[idx - 1]);
    }
  }, [step]);

  return (
    <WizardContext.Provider
      value={{
        data,
        images,
        step,
        stepIndex,
        dealershipId,
        setData,
        setImages,
        goTo,
        next,
        back,
        canGoBack: stepIndex > 0,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside WizardProvider");
  return ctx;
}
