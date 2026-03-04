"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Upload, X, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const RESIDENTIAL_STATUSES = ["Own", "Rent", "Other"];
const EMPLOYMENT_STATUSES = ["Employed", "Self-Employed", "Retired", "Student", "Unemployed", "Other"];
const BUSINESS_TYPES = ["Sole Proprietorship", "Partnership", "LLC", "Corporation", "Other"];

const STEPS = [
  { id: "personal", label: "Personal" },
  { id: "employment", label: "Employment" },
  { id: "documents", label: "Documents" },
] as const;

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  residential_status: string;
  monthly_payment: string;
  years_at_address: string;
  months_at_address: string;

  employer: string;
  occupation: string;
  employment_status: string;
  employer_address: string;
  employer_city: string;
  employer_state: string;
  employer_zip: string;
  employer_phone: string;
  monthly_income: string;
  years_employed: string;
  months_employed: string;
  other_income_sources: string;
  additional_monthly_income: string;

  has_co_applicant: boolean;
  co_first_name: string;
  co_last_name: string;
  co_email: string;
  co_phone: string;
  co_date_of_birth: string;
  co_ssn: string;
  co_address: string;
  co_city: string;
  co_state: string;
  co_zip: string;
  co_residential_status: string;
  co_monthly_payment: string;
  co_years_at_address: string;
  co_months_at_address: string;
  co_employer: string;
  co_occupation: string;
  co_employment_status: string;
  co_employer_address: string;
  co_employer_city: string;
  co_employer_state: string;
  co_employer_zip: string;
  co_employer_phone: string;
  co_monthly_income: string;
  co_years_employed: string;
  co_months_employed: string;
  co_other_income_sources: string;
  co_additional_monthly_income: string;

  is_business_app: boolean;
  business_name: string;
  business_type: string;
  business_ein: string;
  business_nature: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_zip: string;
  business_phone: string;
  years_in_business: string;
};

const EMPTY_FORM: FormData = {
  first_name: "", last_name: "", email: "", phone: "",
  date_of_birth: "", ssn: "", address: "", city: "", state: "", zip: "",
  residential_status: "", monthly_payment: "", years_at_address: "", months_at_address: "",
  employer: "", occupation: "", employment_status: "",
  employer_address: "", employer_city: "", employer_state: "", employer_zip: "",
  employer_phone: "", monthly_income: "", years_employed: "", months_employed: "",
  other_income_sources: "", additional_monthly_income: "",
  has_co_applicant: false,
  co_first_name: "", co_last_name: "", co_email: "", co_phone: "",
  co_date_of_birth: "", co_ssn: "", co_address: "", co_city: "", co_state: "", co_zip: "",
  co_residential_status: "", co_monthly_payment: "", co_years_at_address: "", co_months_at_address: "",
  co_employer: "", co_occupation: "",
  co_employment_status: "", co_employer_address: "", co_employer_city: "",
  co_employer_state: "", co_employer_zip: "", co_employer_phone: "",
  co_monthly_income: "", co_years_employed: "", co_months_employed: "",
  co_other_income_sources: "", co_additional_monthly_income: "",
  is_business_app: false, business_name: "", business_type: "", business_ein: "",
  business_nature: "", business_address: "", business_city: "", business_state: "",
  business_zip: "", business_phone: "", years_in_business: "",
};

function formatSSN(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function maskSSN(formatted: string): string {
  const digits = formatted.replace(/\D/g, "");
  if (digits.length <= 5) return formatted.replace(/\d/g, "•");
  const masked = "•••-••-" + digits.slice(5);
  return masked;
}

const INPUT_CLASS = "mt-1.5 !border-foreground/20 !bg-foreground/5 placeholder:!text-muted-foreground/60";

type CreditAppFormProps = {
  dealershipId: string;
  vehicleId?: string | null;
  vehicleLabel?: string | null;
  apiEndpoint?: string;
  embed?: boolean;
  onSuccess?: (id: string) => void;
};

export function CreditAppForm({
  dealershipId,
  vehicleId,
  vehicleLabel,
  apiEndpoint = "/api/credit-applications",
  embed = false,
  onSuccess,
}: CreditAppFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ssnVisible, setSsnVisible] = useState(false);
  const [coSsnVisible, setCoSsnVisible] = useState(false);
  const [files, setFiles] = useState<{ front_id: File | null; insurance: File | null; registration: File | null }>({
    front_id: null, insurance: null, registration: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const set = useCallback((field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.first_name.trim()) errs.first_name = "Required";
      if (!form.last_name.trim()) errs.last_name = "Required";
      if (!form.email.trim()) errs.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
      if (!form.phone.trim()) errs.phone = "Required";
      if (!form.date_of_birth) errs.date_of_birth = "Required";
      if (!form.ssn.trim()) errs.ssn = "Required";
      else if (form.ssn.replace(/\D/g, "").length !== 9) errs.ssn = "Must be 9 digits";
      if (!form.address.trim()) errs.address = "Required";
      if (!form.city.trim()) errs.city = "Required";
      if (!form.state) errs.state = "Required";
      if (!form.zip.trim()) errs.zip = "Required";
      if (!form.residential_status) errs.residential_status = "Required";
      if (!form.monthly_payment.trim()) errs.monthly_payment = "Required";
      if (form.years_at_address === "" && form.months_at_address === "") errs.years_at_address = "Required";
    }
    if (s === 1) {
      if (!form.employer.trim()) errs.employer = "Required";
      if (!form.occupation.trim()) errs.occupation = "Required";
      if (!form.employment_status) errs.employment_status = "Required";
      if (!form.monthly_income.trim()) errs.monthly_income = "Required";
      if (form.years_employed === "" && form.months_employed === "") errs.years_employed = "Required";
      if (!form.employer_address.trim()) errs.employer_address = "Required";
      if (!form.employer_city.trim()) errs.employer_city = "Required";
      if (!form.employer_state) errs.employer_state = "Required";
      if (!form.employer_zip.trim()) errs.employer_zip = "Required";
      if (!form.employer_phone.trim()) errs.employer_phone = "Required";
      if (form.has_co_applicant) {
        if (!form.co_first_name.trim()) errs.co_first_name = "Required";
        if (!form.co_last_name.trim()) errs.co_last_name = "Required";
        if (!form.co_email.trim()) errs.co_email = "Required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.co_email)) errs.co_email = "Invalid email";
        if (!form.co_phone.trim()) errs.co_phone = "Required";
        if (!form.co_date_of_birth) errs.co_date_of_birth = "Required";
        if (!form.co_ssn.trim()) errs.co_ssn = "Required";
        else if (form.co_ssn.replace(/\D/g, "").length !== 9) errs.co_ssn = "Must be 9 digits";
        if (!form.co_address.trim()) errs.co_address = "Required";
        if (!form.co_city.trim()) errs.co_city = "Required";
        if (!form.co_state) errs.co_state = "Required";
        if (!form.co_zip.trim()) errs.co_zip = "Required";
        if (!form.co_residential_status) errs.co_residential_status = "Required";
        if (!form.co_monthly_payment.trim()) errs.co_monthly_payment = "Required";
        if (form.co_years_at_address === "" && form.co_months_at_address === "") errs.co_years_at_address = "Required";
        if (!form.co_employer.trim()) errs.co_employer = "Required";
        if (!form.co_occupation.trim()) errs.co_occupation = "Required";
        if (!form.co_employment_status) errs.co_employment_status = "Required";
        if (!form.co_employer_address.trim()) errs.co_employer_address = "Required";
        if (!form.co_employer_city.trim()) errs.co_employer_city = "Required";
        if (!form.co_employer_state) errs.co_employer_state = "Required";
        if (!form.co_employer_zip.trim()) errs.co_employer_zip = "Required";
        if (!form.co_employer_phone.trim()) errs.co_employer_phone = "Required";
        if (!form.co_monthly_income.trim()) errs.co_monthly_income = "Required";
        if (form.co_years_employed === "" && form.co_months_employed === "") errs.co_years_employed = "Required";
      }
      if (form.is_business_app) {
        if (!form.business_name.trim()) errs.business_name = "Required";
        if (!form.business_type) errs.business_type = "Required";
        if (!form.business_ein.trim()) errs.business_ein = "Required";
        if (!form.business_nature.trim()) errs.business_nature = "Required";
        if (!form.business_address.trim()) errs.business_address = "Required";
        if (!form.business_city.trim()) errs.business_city = "Required";
        if (!form.business_state) errs.business_state = "Required";
        if (!form.business_zip.trim()) errs.business_zip = "Required";
        if (!form.business_phone.trim()) errs.business_phone = "Required";
        if (!form.years_in_business.trim()) errs.years_in_business = "Required";
      }
    }
    if (s === 2) {
      if (!files.front_id) errs.front_id = "Photo ID is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        dealership_id: dealershipId,
        vehicle_id: vehicleId || null,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, ""),
        date_of_birth: form.date_of_birth || null,
        ssn: form.ssn.replace(/\D/g, ""),
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        zip: form.zip || null,
        residential_status: form.residential_status || null,
        monthly_payment: form.monthly_payment ? parseFloat(form.monthly_payment) : null,
        years_at_address: form.years_at_address ? parseInt(form.years_at_address) : null,
        months_at_address: form.months_at_address ? parseInt(form.months_at_address) : null,
        employer: form.employer || null,
        occupation: form.occupation || null,
        employment_status: form.employment_status || null,
        employer_address: form.employer_address || null,
        employer_city: form.employer_city || null,
        employer_state: form.employer_state || null,
        employer_zip: form.employer_zip || null,
        employer_phone: form.employer_phone ? form.employer_phone.replace(/\D/g, "") : null,
        monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : null,
        years_employed: form.years_employed ? parseInt(form.years_employed) : null,
        months_employed: form.months_employed ? parseInt(form.months_employed) : null,
        other_income_sources: form.other_income_sources || null,
        additional_monthly_income: form.additional_monthly_income ? parseFloat(form.additional_monthly_income) : null,
        has_co_applicant: form.has_co_applicant,
        is_business_app: form.is_business_app,
      };

      if (form.has_co_applicant) {
        Object.assign(payload, {
          co_first_name: form.co_first_name || null,
          co_last_name: form.co_last_name || null,
          co_email: form.co_email || null,
          co_phone: form.co_phone ? form.co_phone.replace(/\D/g, "") : null,
          co_date_of_birth: form.co_date_of_birth || null,
          co_ssn: form.co_ssn ? form.co_ssn.replace(/\D/g, "") : null,
          co_address: form.co_address || null,
          co_city: form.co_city || null,
          co_state: form.co_state || null,
          co_zip: form.co_zip || null,
          co_residential_status: form.co_residential_status || null,
          co_monthly_payment: form.co_monthly_payment ? parseFloat(form.co_monthly_payment) : null,
          co_years_at_address: form.co_years_at_address ? parseInt(form.co_years_at_address) : null,
          co_months_at_address: form.co_months_at_address ? parseInt(form.co_months_at_address) : null,
          co_employer: form.co_employer || null,
          co_occupation: form.co_occupation || null,
          co_employment_status: form.co_employment_status || null,
          co_employer_address: form.co_employer_address || null,
          co_employer_city: form.co_employer_city || null,
          co_employer_state: form.co_employer_state || null,
          co_employer_zip: form.co_employer_zip || null,
          co_employer_phone: form.co_employer_phone ? form.co_employer_phone.replace(/\D/g, "") : null,
          co_monthly_income: form.co_monthly_income ? parseFloat(form.co_monthly_income) : null,
          co_years_employed: form.co_years_employed ? parseInt(form.co_years_employed) : null,
          co_months_employed: form.co_months_employed ? parseInt(form.co_months_employed) : null,
          co_other_income_sources: form.co_other_income_sources || null,
          co_additional_monthly_income: form.co_additional_monthly_income ? parseFloat(form.co_additional_monthly_income) : null,
        });
      }

      if (form.is_business_app) {
        Object.assign(payload, {
          business_name: form.business_name || null,
          business_type: form.business_type || null,
          business_ein: form.business_ein || null,
          business_nature: form.business_nature || null,
          business_address: form.business_address || null,
          business_city: form.business_city || null,
          business_state: form.business_state || null,
          business_zip: form.business_zip || null,
          business_phone: form.business_phone ? form.business_phone.replace(/\D/g, "") : null,
          years_in_business: form.years_in_business ? parseInt(form.years_in_business) : null,
        });
      }

      if (files.front_id) payload.front_id_base64 = await fileToBase64(files.front_id);
      if (files.insurance) payload.insurance_base64 = await fileToBase64(files.insurance);
      if (files.registration) payload.registration_base64 = await fileToBase64(files.registration);

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission failed");

      const { id } = await res.json();
      setSubmitted(true);
      onSuccess?.(id);
    } catch {
      setErrors({ _form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 text-center ${embed ? "" : "max-w-lg mx-auto"}`}>
        <div className="mb-4 rounded-full bg-green-500/10 p-4">
          <Check size={32} className="text-green-500" />
        </div>
        <h2 className="text-heading-2 mb-2">Application Submitted</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Thank you for your application. A team member will review it and contact you shortly.
        </p>
      </div>
    );
  }

  const wrapClass = embed ? "w-full" : "max-w-2xl mx-auto";

  return (
    <div className={wrapClass}>
      {vehicleLabel && (
        <p className="text-xs text-muted-foreground mb-4">
          Applying for: <strong className="text-foreground">{vehicleLabel}</strong>
        </p>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div key={s.id} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  active ? "bg-foreground" : done ? "bg-foreground/40" : "bg-foreground/10"
                }`}
              />
              <p className={`text-[10px] mt-1 ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {errors._form && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {errors._form}
        </div>
      )}

      <div ref={containerRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && <StepPersonal form={form} set={set} errors={errors} ssnVisible={ssnVisible} setSsnVisible={setSsnVisible} />}
            {step === 1 && <StepEmployment form={form} set={set} errors={errors} coSsnVisible={coSsnVisible} setCoSsnVisible={setCoSsnVisible} />}
            {step === 2 && <StepDocuments form={form} set={set} errors={errors} files={files} setFiles={setFiles} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-foreground/10">
        <Button variant="ghost" onClick={goBack} disabled={step === 0}>
          <ChevronLeft size={16} strokeWidth={ICON_STROKE_WIDTH} className="mr-1" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext}>
            Next
            <ChevronRight size={16} strokeWidth={ICON_STROKE_WIDTH} className="ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 size={16} className="mr-1.5 animate-spin" />}
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Step Components ─── */

type StepProps = {
  form: FormData;
  set: (field: keyof FormData, value: string | boolean) => void;
  errors: Record<string, string>;
};

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-red-400 mt-1">{error}</p>;
}

function SSNInput({
  id,
  value,
  onChange,
  visible,
  onToggle,
  error,
  placeholder = "###-##-####",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggle: () => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={visible ? value : maskSSN(value)}
        onChange={(e) => {
          if (visible) onChange(formatSSN(e.target.value));
        }}
        onFocus={() => { if (!visible) onToggle(); }}
        placeholder={placeholder}
        autoComplete="off"
        className={`${INPUT_CLASS} pr-10 ${error ? "!border-red-400" : ""}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} strokeWidth={ICON_STROKE_WIDTH} /> : <Eye size={16} strokeWidth={ICON_STROKE_WIDTH} />}
      </button>
    </div>
  );
}

function StepPersonal({ form, set, errors, ssnVisible, setSsnVisible }: StepProps & { ssnVisible: boolean; setSsnVisible: (v: boolean) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold mb-3">Personal Information</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input id="first_name" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className={`${INPUT_CLASS} ${errors.first_name ? "!border-red-400" : ""}`} />
          <FieldError error={errors.first_name} />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input id="last_name" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className={`${INPUT_CLASS} ${errors.last_name ? "!border-red-400" : ""}`} />
          <FieldError error={errors.last_name} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={`${INPUT_CLASS} ${errors.email ? "!border-red-400" : ""}`} />
          <FieldError error={errors.email} />
        </div>
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set("phone", formatPhoneInput(e.target.value))} className={`${INPUT_CLASS} ${errors.phone ? "!border-red-400" : ""}`} />
          <FieldError error={errors.phone} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="dob">Date of Birth *</Label>
          <Input id="dob" type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} className={`${INPUT_CLASS} ${errors.date_of_birth ? "!border-red-400" : ""}`} />
          <FieldError error={errors.date_of_birth} />
        </div>
        <div>
          <Label htmlFor="ssn">Social Security Number *</Label>
          <SSNInput id="ssn" value={form.ssn} onChange={(v) => set("ssn", v)} visible={ssnVisible} onToggle={() => setSsnVisible(!ssnVisible)} error={errors.ssn} />
          <FieldError error={errors.ssn} />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address *</Label>
        <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} className={`${INPUT_CLASS} ${errors.address ? "!border-red-400" : ""}`} />
        <FieldError error={errors.address} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} className={`${INPUT_CLASS} ${errors.city ? "!border-red-400" : ""}`} />
          <FieldError error={errors.city} />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Select value={form.state} onValueChange={(v) => set("state", v)}>
            <SelectTrigger className={`${INPUT_CLASS} ${errors.state ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError error={errors.state} />
        </div>
        <div>
          <Label htmlFor="zip">Zip *</Label>
          <Input id="zip" value={form.zip} onChange={(e) => set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))} className={`${INPUT_CLASS} ${errors.zip ? "!border-red-400" : ""}`} />
          <FieldError error={errors.zip} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Residential Status *</Label>
          <Select value={form.residential_status} onValueChange={(v) => set("residential_status", v)}>
            <SelectTrigger className={`${INPUT_CLASS} ${errors.residential_status ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {RESIDENTIAL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError error={errors.residential_status} />
        </div>
        <div>
          <Label htmlFor="monthly_payment">Monthly Housing Payment *</Label>
          <Input id="monthly_payment" type="number" min="0" value={form.monthly_payment} onChange={(e) => set("monthly_payment", e.target.value)} placeholder="$" className={`${INPUT_CLASS} ${errors.monthly_payment ? "!border-red-400" : ""}`} />
          <FieldError error={errors.monthly_payment} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="years_at_address">Years at Address *</Label>
          <Input id="years_at_address" type="number" min="0" value={form.years_at_address} onChange={(e) => set("years_at_address", e.target.value)} className={`${INPUT_CLASS} ${errors.years_at_address ? "!border-red-400" : ""}`} />
          <FieldError error={errors.years_at_address} />
        </div>
        <div>
          <Label htmlFor="months_at_address">Months *</Label>
          <Input id="months_at_address" type="number" min="0" max="11" value={form.months_at_address} onChange={(e) => set("months_at_address", e.target.value)} className={INPUT_CLASS} />
        </div>
      </div>
    </div>
  );
}

function StepEmployment({ form, set, errors, coSsnVisible, setCoSsnVisible }: StepProps & { coSsnVisible: boolean; setCoSsnVisible: (v: boolean) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold mb-3">Employment & Income</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="employer">Employer *</Label>
          <Input id="employer" value={form.employer} onChange={(e) => set("employer", e.target.value)} className={`${INPUT_CLASS} ${errors.employer ? "!border-red-400" : ""}`} />
          <FieldError error={errors.employer} />
        </div>
        <div>
          <Label htmlFor="occupation">Occupation *</Label>
          <Input id="occupation" value={form.occupation} onChange={(e) => set("occupation", e.target.value)} className={`${INPUT_CLASS} ${errors.occupation ? "!border-red-400" : ""}`} />
          <FieldError error={errors.occupation} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Employment Status *</Label>
          <Select value={form.employment_status} onValueChange={(v) => set("employment_status", v)}>
            <SelectTrigger className={`${INPUT_CLASS} ${errors.employment_status ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError error={errors.employment_status} />
        </div>
        <div>
          <Label htmlFor="monthly_income">Monthly Income *</Label>
          <Input id="monthly_income" type="number" min="0" value={form.monthly_income} onChange={(e) => set("monthly_income", e.target.value)} placeholder="$" className={`${INPUT_CLASS} ${errors.monthly_income ? "!border-red-400" : ""}`} />
          <FieldError error={errors.monthly_income} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="years_employed">Years at Employer *</Label>
          <Input id="years_employed" type="number" min="0" value={form.years_employed} onChange={(e) => set("years_employed", e.target.value)} className={`${INPUT_CLASS} ${errors.years_employed ? "!border-red-400" : ""}`} />
          <FieldError error={errors.years_employed} />
        </div>
        <div>
          <Label htmlFor="months_employed">Months *</Label>
          <Input id="months_employed" type="number" min="0" max="11" value={form.months_employed} onChange={(e) => set("months_employed", e.target.value)} className={INPUT_CLASS} />
        </div>
      </div>
      <div>
        <Label htmlFor="employer_address">Employer Address *</Label>
        <Input id="employer_address" value={form.employer_address} onChange={(e) => set("employer_address", e.target.value)} className={`${INPUT_CLASS} ${errors.employer_address ? "!border-red-400" : ""}`} />
        <FieldError error={errors.employer_address} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="employer_city">City *</Label>
          <Input id="employer_city" value={form.employer_city} onChange={(e) => set("employer_city", e.target.value)} className={`${INPUT_CLASS} ${errors.employer_city ? "!border-red-400" : ""}`} />
          <FieldError error={errors.employer_city} />
        </div>
        <div>
          <Label>State *</Label>
          <Select value={form.employer_state} onValueChange={(v) => set("employer_state", v)}>
            <SelectTrigger className={`${INPUT_CLASS} ${errors.employer_state ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError error={errors.employer_state} />
        </div>
        <div>
          <Label htmlFor="employer_zip">Zip *</Label>
          <Input id="employer_zip" value={form.employer_zip} onChange={(e) => set("employer_zip", e.target.value.replace(/\D/g, "").slice(0, 5))} className={`${INPUT_CLASS} ${errors.employer_zip ? "!border-red-400" : ""}`} />
          <FieldError error={errors.employer_zip} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="employer_phone">Employer Phone *</Label>
          <Input id="employer_phone" value={form.employer_phone} onChange={(e) => set("employer_phone", formatPhoneInput(e.target.value))} className={`${INPUT_CLASS} ${errors.employer_phone ? "!border-red-400" : ""}`} />
          <FieldError error={errors.employer_phone} />
        </div>
        <div>
          <Label htmlFor="additional_monthly_income">Additional Monthly Income</Label>
          <Input id="additional_monthly_income" type="number" min="0" value={form.additional_monthly_income} onChange={(e) => set("additional_monthly_income", e.target.value)} placeholder="$" className={INPUT_CLASS} />
        </div>
      </div>
      <div>
        <Label htmlFor="other_income_sources">Other Income Sources</Label>
        <Input id="other_income_sources" value={form.other_income_sources} onChange={(e) => set("other_income_sources", e.target.value)} placeholder="e.g., rental income, investments" className={INPUT_CLASS} />
      </div>

      {/* Toggles */}
      <div className="pt-4 border-t border-foreground/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Co-Applicant</p>
            <p className="text-xs text-muted-foreground">Add a second applicant to this application</p>
          </div>
          <Switch checked={form.has_co_applicant} onCheckedChange={(v) => set("has_co_applicant", v)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Business Application</p>
            <p className="text-xs text-muted-foreground">Apply on behalf of a business entity</p>
          </div>
          <Switch checked={form.is_business_app} onCheckedChange={(v) => set("is_business_app", v)} />
        </div>
      </div>

      {/* Co-applicant fields */}
      {form.has_co_applicant && (
        <div className="pt-4 border-t border-foreground/10 space-y-4">
          <h4 className="text-sm font-semibold">Co-Applicant Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="co_first">First Name *</Label>
              <Input id="co_first" value={form.co_first_name} onChange={(e) => set("co_first_name", e.target.value)} className={`${INPUT_CLASS} ${errors.co_first_name ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_first_name} />
            </div>
            <div>
              <Label htmlFor="co_last">Last Name *</Label>
              <Input id="co_last" value={form.co_last_name} onChange={(e) => set("co_last_name", e.target.value)} className={`${INPUT_CLASS} ${errors.co_last_name ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_last_name} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="co_email">Email *</Label>
              <Input id="co_email" type="email" value={form.co_email} onChange={(e) => set("co_email", e.target.value)} className={`${INPUT_CLASS} ${errors.co_email ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_email} />
            </div>
            <div>
              <Label htmlFor="co_phone">Phone *</Label>
              <Input id="co_phone" value={form.co_phone} onChange={(e) => set("co_phone", formatPhoneInput(e.target.value))} className={`${INPUT_CLASS} ${errors.co_phone ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_phone} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="co_dob">Date of Birth *</Label>
              <Input id="co_dob" type="date" value={form.co_date_of_birth} onChange={(e) => set("co_date_of_birth", e.target.value)} className={`${INPUT_CLASS} ${errors.co_date_of_birth ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_date_of_birth} />
            </div>
            <div>
              <Label htmlFor="co_ssn">SSN *</Label>
              <SSNInput id="co_ssn" value={form.co_ssn} onChange={(v) => set("co_ssn", v)} visible={coSsnVisible} onToggle={() => setCoSsnVisible(!coSsnVisible)} error={errors.co_ssn} />
              <FieldError error={errors.co_ssn} />
            </div>
          </div>
          <div>
            <Label htmlFor="co_address">Address *</Label>
            <Input id="co_address" value={form.co_address} onChange={(e) => set("co_address", e.target.value)} className={`${INPUT_CLASS} ${errors.co_address ? "!border-red-400" : ""}`} />
            <FieldError error={errors.co_address} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="co_city">City *</Label>
              <Input id="co_city" value={form.co_city} onChange={(e) => set("co_city", e.target.value)} className={`${INPUT_CLASS} ${errors.co_city ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_city} />
            </div>
            <div>
              <Label>State *</Label>
              <Select value={form.co_state} onValueChange={(v) => set("co_state", v)}>
                <SelectTrigger className={`${INPUT_CLASS} ${errors.co_state ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError error={errors.co_state} />
            </div>
            <div>
              <Label htmlFor="co_zip">Zip *</Label>
              <Input id="co_zip" value={form.co_zip} onChange={(e) => set("co_zip", e.target.value.replace(/\D/g, "").slice(0, 5))} className={`${INPUT_CLASS} ${errors.co_zip ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_zip} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Residential Status *</Label>
              <Select value={form.co_residential_status} onValueChange={(v) => set("co_residential_status", v)}>
                <SelectTrigger className={`${INPUT_CLASS} ${errors.co_residential_status ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {RESIDENTIAL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError error={errors.co_residential_status} />
            </div>
            <div>
              <Label htmlFor="co_monthly">Monthly Housing *</Label>
              <Input id="co_monthly" type="number" min="0" value={form.co_monthly_payment} onChange={(e) => set("co_monthly_payment", e.target.value)} placeholder="$" className={`${INPUT_CLASS} ${errors.co_monthly_payment ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_monthly_payment} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="co_years_at_address">Years at Address *</Label>
              <Input id="co_years_at_address" type="number" min="0" value={form.co_years_at_address} onChange={(e) => set("co_years_at_address", e.target.value)} className={`${INPUT_CLASS} ${errors.co_years_at_address ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_years_at_address} />
            </div>
            <div>
              <Label htmlFor="co_months_at_address">Months *</Label>
              <Input id="co_months_at_address" type="number" min="0" max="11" value={form.co_months_at_address} onChange={(e) => set("co_months_at_address", e.target.value)} className={INPUT_CLASS} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="co_employer">Employer *</Label>
              <Input id="co_employer" value={form.co_employer} onChange={(e) => set("co_employer", e.target.value)} className={`${INPUT_CLASS} ${errors.co_employer ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_employer} />
            </div>
            <div>
              <Label htmlFor="co_occupation">Occupation *</Label>
              <Input id="co_occupation" value={form.co_occupation} onChange={(e) => set("co_occupation", e.target.value)} className={`${INPUT_CLASS} ${errors.co_occupation ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_occupation} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Employment Status *</Label>
              <Select value={form.co_employment_status} onValueChange={(v) => set("co_employment_status", v)}>
                <SelectTrigger className={`${INPUT_CLASS} ${errors.co_employment_status ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError error={errors.co_employment_status} />
            </div>
            <div>
              <Label htmlFor="co_income">Monthly Income *</Label>
              <Input id="co_income" type="number" min="0" value={form.co_monthly_income} onChange={(e) => set("co_monthly_income", e.target.value)} placeholder="$" className={`${INPUT_CLASS} ${errors.co_monthly_income ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_monthly_income} />
            </div>
          </div>
          <div>
            <Label htmlFor="co_employer_address">Employer Address *</Label>
            <Input id="co_employer_address" value={form.co_employer_address} onChange={(e) => set("co_employer_address", e.target.value)} className={`${INPUT_CLASS} ${errors.co_employer_address ? "!border-red-400" : ""}`} />
            <FieldError error={errors.co_employer_address} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="co_employer_city">City *</Label>
              <Input id="co_employer_city" value={form.co_employer_city} onChange={(e) => set("co_employer_city", e.target.value)} className={`${INPUT_CLASS} ${errors.co_employer_city ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_employer_city} />
            </div>
            <div>
              <Label>State *</Label>
              <Select value={form.co_employer_state} onValueChange={(v) => set("co_employer_state", v)}>
                <SelectTrigger className={`${INPUT_CLASS} ${errors.co_employer_state ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <FieldError error={errors.co_employer_state} />
            </div>
            <div>
              <Label htmlFor="co_employer_zip">ZIP *</Label>
              <Input id="co_employer_zip" value={form.co_employer_zip} onChange={(e) => set("co_employer_zip", e.target.value)} className={`${INPUT_CLASS} ${errors.co_employer_zip ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_employer_zip} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="co_employer_phone">Employer Phone *</Label>
              <Input id="co_employer_phone" type="tel" value={form.co_employer_phone} onChange={(e) => set("co_employer_phone", e.target.value)} className={`${INPUT_CLASS} ${errors.co_employer_phone ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_employer_phone} />
            </div>
            <div>
              <Label htmlFor="co_years_employed">Years Employed *</Label>
              <Input id="co_years_employed" type="number" min="0" value={form.co_years_employed} onChange={(e) => set("co_years_employed", e.target.value)} className={`${INPUT_CLASS} ${errors.co_years_employed ? "!border-red-400" : ""}`} />
              <FieldError error={errors.co_years_employed} />
            </div>
            <div>
              <Label htmlFor="co_months_employed">Months *</Label>
              <Input id="co_months_employed" type="number" min="0" max="11" value={form.co_months_employed} onChange={(e) => set("co_months_employed", e.target.value)} className={INPUT_CLASS} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="co_other_income">Other Income Sources</Label>
              <Input id="co_other_income" value={form.co_other_income_sources} onChange={(e) => set("co_other_income_sources", e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <Label htmlFor="co_add_income">Additional Monthly Income</Label>
              <Input id="co_add_income" type="number" min="0" value={form.co_additional_monthly_income} onChange={(e) => set("co_additional_monthly_income", e.target.value)} placeholder="$" className={INPUT_CLASS} />
            </div>
          </div>
        </div>
      )}

      {/* Business fields */}
      {form.is_business_app && (
        <div className="pt-4 border-t border-foreground/10 space-y-4">
          <h4 className="text-sm font-semibold">Business Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="business_name">Business Name *</Label>
              <Input id="business_name" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} className={`${INPUT_CLASS} ${errors.business_name ? "!border-red-400" : ""}`} />
              <FieldError error={errors.business_name} />
            </div>
            <div>
              <Label>Business Type *</Label>
              <Select value={form.business_type} onValueChange={(v) => set("business_type", v)}>
                <SelectTrigger className={`${INPUT_CLASS} ${errors.business_type ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError error={errors.business_type} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="business_ein">EIN *</Label>
              <Input id="business_ein" value={form.business_ein} onChange={(e) => set("business_ein", e.target.value)} placeholder="XX-XXXXXXX" className={`${INPUT_CLASS} ${errors.business_ein ? "!border-red-400" : ""}`} />
              <FieldError error={errors.business_ein} />
            </div>
            <div>
              <Label htmlFor="business_nature">Nature of Business *</Label>
              <Input id="business_nature" value={form.business_nature} onChange={(e) => set("business_nature", e.target.value)} className={`${INPUT_CLASS} ${errors.business_nature ? "!border-red-400" : ""}`} />
              <FieldError error={errors.business_nature} />
            </div>
          </div>
          <div>
            <Label htmlFor="business_address">Business Address *</Label>
            <Input id="business_address" value={form.business_address} onChange={(e) => set("business_address", e.target.value)} className={`${INPUT_CLASS} ${errors.business_address ? "!border-red-400" : ""}`} />
            <FieldError error={errors.business_address} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="business_city">City *</Label>
              <Input id="business_city" value={form.business_city} onChange={(e) => set("business_city", e.target.value)} className={`${INPUT_CLASS} ${errors.business_city ? "!border-red-400" : ""}`} />
              <FieldError error={errors.business_city} />
            </div>
            <div>
              <Label>State *</Label>
              <Select value={form.business_state} onValueChange={(v) => set("business_state", v)}>
                <SelectTrigger className={`${INPUT_CLASS} ${errors.business_state ? "!border-red-400" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <FieldError error={errors.business_state} />
            </div>
            <div>
              <Label htmlFor="business_zip">ZIP *</Label>
              <Input id="business_zip" value={form.business_zip} onChange={(e) => set("business_zip", e.target.value)} className={`${INPUT_CLASS} ${errors.business_zip ? "!border-red-400" : ""}`} />
              <FieldError error={errors.business_zip} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="business_phone">Business Phone *</Label>
              <Input id="business_phone" type="tel" value={form.business_phone} onChange={(e) => set("business_phone", e.target.value)} className={`${INPUT_CLASS} ${errors.business_phone ? "!border-red-400" : ""}`} />
              <FieldError error={errors.business_phone} />
            </div>
            <div>
              <Label htmlFor="years_in_business">Years in Business *</Label>
              <Input id="years_in_business" type="number" min="0" value={form.years_in_business} onChange={(e) => set("years_in_business", e.target.value)} className={`${INPUT_CLASS} ${errors.years_in_business ? "!border-red-400" : ""}`} />
              <FieldError error={errors.years_in_business} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepDocuments({
  files,
  setFiles,
  errors,
}: StepProps & {
  files: { front_id: File | null; insurance: File | null; registration: File | null };
  setFiles: React.Dispatch<React.SetStateAction<typeof files>>;
}) {
  const handleFile = (key: keyof typeof files) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFiles((prev) => ({ ...prev, [key]: f }));
  };

  const removeFile = (key: keyof typeof files) => () => {
    setFiles((prev) => ({ ...prev, [key]: null }));
  };

  const items: { key: keyof typeof files; label: string; required: boolean }[] = [
    { key: "front_id", label: "Photo ID (Front)", required: true },
    { key: "insurance", label: "Insurance Card", required: false },
    { key: "registration", label: "Registration", required: false },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold mb-1">Documents</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Photo ID is required. Insurance and registration are optional but help speed up the process.
      </p>

      {items.map(({ key, label, required }) => {
        const file = files[key];
        const hasError = errors[key];
        return (
          <div key={key} className={`border rounded-lg p-3.5 ${hasError ? "border-red-400" : "border-foreground/15"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {label} {required && <span className="text-red-400">*</span>}
              </span>
              {file ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check size={14} className="text-green-500" />
                  <span className="truncate max-w-[140px]">{file.name}</span>
                  <button onClick={removeFile(key)} className="p-0.5 rounded hover:bg-foreground/10">
                    <X size={14} strokeWidth={ICON_STROKE_WIDTH} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-foreground/15 hover:border-foreground/30">
                  <Upload size={14} strokeWidth={ICON_STROKE_WIDTH} />
                  Upload
                  <input type="file" accept="image/*,.pdf" onChange={handleFile(key)} className="hidden" />
                </label>
              )}
            </div>
            {hasError && <FieldError error={hasError} />}
          </div>
        );
      })}
    </div>
  );
}
