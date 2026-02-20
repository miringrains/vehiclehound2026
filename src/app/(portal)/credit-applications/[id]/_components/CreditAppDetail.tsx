"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  User,
  Briefcase,
  Building2,
  Users,
  FileImage,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routes } from "@/config/routes";
import { ICON_STROKE_WIDTH, CREDIT_APP_STATUSES } from "@/lib/constants";
import { formatDateTime, formatDate } from "@/lib/utils/format-date";
import { formatPhone } from "@/lib/utils/format-phone";
import { formatCurrencyDollars } from "@/lib/utils/format-currency";
import { fadeUp } from "@/lib/motion";
import type { CreditApplication } from "@/types/credit-application";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  approved: "Approved",
  denied: "Denied",
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] truncate">
        {value || "—"}
      </span>
    </div>
  );
}

type Props = {
  application: CreditApplication;
};

export function CreditAppDetail({ application: app }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(app.status);
  const [saving, setSaving] = useState(false);
  const [ssnData, setSsnData] = useState<{ ssn: string | null; co_ssn: string | null } | null>(null);
  const [ssnVisible, setSsnVisible] = useState(false);
  const [ssnLoading, setSsnLoading] = useState(false);
  const [fileUrls, setFileUrls] = useState<Record<string, string | null> | null>(null);
  const [filesLoading, setFilesLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as typeof status);
    setSaving(true);
    try {
      await fetch(`/api/credit-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleRevealSSN = async () => {
    if (ssnData) {
      setSsnVisible(!ssnVisible);
      return;
    }
    setSsnLoading(true);
    try {
      const res = await fetch(`/api/credit-applications/${app.id}/ssn?full=true`);
      const data = await res.json();
      setSsnData(data);
      setSsnVisible(true);
    } finally {
      setSsnLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const res = await fetch(`/api/credit-applications/${app.id}/pdf`);
    const { url } = await res.json();
    if (url) window.open(url, "_blank");
  };

  const handleLoadFiles = async () => {
    if (fileUrls) return;
    setFilesLoading(true);
    try {
      const res = await fetch(`/api/credit-applications/${app.id}/files`);
      const data = await res.json();
      setFileUrls(data);
    } finally {
      setFilesLoading(false);
    }
  };

  const vehicleLabel = app.vehicle
    ? [app.vehicle.year, app.vehicle.make, app.vehicle.model, app.vehicle.stock_number ? `(#${app.vehicle.stock_number})` : null].filter(Boolean).join(" ")
    : null;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={routes.creditApplications}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft size={18} strokeWidth={ICON_STROKE_WIDTH} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-heading-2 truncate">
              {app.first_name} {app.last_name}
            </h1>
            <StatusBadge status={STATUS_LABEL[app.status] ?? app.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submitted {formatDateTime(app.created_at)}
            {vehicleLabel && <> &middot; {vehicleLabel}</>}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={handleStatusChange} disabled={saving}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CREDIT_APP_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleRevealSSN} disabled={ssnLoading}>
          {ssnVisible ? <EyeOff size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" /> : <Eye size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" />}
          {ssnVisible ? "Hide SSN" : "Reveal SSN"}
        </Button>
        {app.pdf_path && (
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-1.5" />
            Download PDF
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Section icon={User} title="Personal Information">
          <InfoRow label="Name" value={`${app.first_name} ${app.last_name}`} />
          <InfoRow label="Email" value={app.email} />
          <InfoRow label="Phone" value={formatPhone(app.phone)} />
          <InfoRow label="Date of Birth" value={app.date_of_birth ? formatDate(app.date_of_birth) : null} />
          <InfoRow
            label="SSN"
            value={ssnVisible && ssnData?.ssn ? ssnData.ssn : app.ssn_encrypted ? "•••-••-••••" : null}
          />
          <InfoRow label="Address" value={app.address} />
          <InfoRow
            label="City / State / Zip"
            value={[app.city, app.state, app.zip].filter(Boolean).join(", ") || null}
          />
          <InfoRow label="Residential Status" value={app.residential_status} />
          <InfoRow
            label="Monthly Housing"
            value={app.monthly_payment != null ? formatCurrencyDollars(app.monthly_payment) : null}
          />
        </Section>

        {/* Employment & Income */}
        <Section icon={Briefcase} title="Employment & Income">
          <InfoRow label="Employer" value={app.employer} />
          <InfoRow label="Occupation" value={app.occupation} />
          <InfoRow label="Status" value={app.employment_status} />
          {app.employer_address && (
            <InfoRow label="Employer Address" value={app.employer_address} />
          )}
          {(app.employer_city || app.employer_state) && (
            <InfoRow
              label="Employer City/State/Zip"
              value={[app.employer_city, app.employer_state, app.employer_zip].filter(Boolean).join(", ") || null}
            />
          )}
          {app.employer_phone && <InfoRow label="Employer Phone" value={formatPhone(app.employer_phone)} />}
          <InfoRow
            label="Monthly Income"
            value={app.monthly_income != null ? formatCurrencyDollars(app.monthly_income) : null}
          />
          {(app.years_employed || app.months_employed) && (
            <InfoRow
              label="Time at Employer"
              value={`${app.years_employed ?? 0}yr ${app.months_employed ?? 0}mo`}
            />
          )}
          {app.other_income_sources && <InfoRow label="Other Income" value={app.other_income_sources} />}
          {app.additional_monthly_income != null && (
            <InfoRow label="Additional Monthly" value={formatCurrencyDollars(app.additional_monthly_income)} />
          )}
        </Section>

        {/* Co-Applicant */}
        {app.has_co_applicant && (
          <Section icon={Users} title="Co-Applicant">
            <InfoRow label="Name" value={[app.co_first_name, app.co_last_name].filter(Boolean).join(" ") || null} />
            <InfoRow label="Email" value={app.co_email} />
            <InfoRow label="Phone" value={app.co_phone ? formatPhone(app.co_phone) : null} />
            <InfoRow label="Date of Birth" value={app.co_date_of_birth ? formatDate(app.co_date_of_birth) : null} />
            <InfoRow
              label="SSN"
              value={ssnVisible && ssnData?.co_ssn ? ssnData.co_ssn : app.co_ssn_encrypted ? "•••-••-••••" : null}
            />
            <InfoRow
              label="City / State / Zip"
              value={[app.co_city, app.co_state, app.co_zip].filter(Boolean).join(", ") || null}
            />
            <InfoRow label="Residential Status" value={app.co_residential_status} />
            <InfoRow label="Employer" value={app.co_employer} />
            <InfoRow label="Occupation" value={app.co_occupation} />
            <InfoRow
              label="Monthly Income"
              value={app.co_monthly_income != null ? formatCurrencyDollars(app.co_monthly_income) : null}
            />
          </Section>
        )}

        {/* Business Info */}
        {app.is_business_app && (
          <Section icon={Building2} title="Business Information">
            <InfoRow label="Business Name" value={app.business_name} />
            <InfoRow label="Type" value={app.business_type} />
            <InfoRow label="EIN" value={app.business_ein} />
          </Section>
        )}

        {/* Uploaded Documents */}
        {(app.front_id_path || app.insurance_path || app.registration_path) && (
          <Section icon={FileImage} title="Documents">
            {!fileUrls ? (
              <Button variant="outline" size="sm" onClick={handleLoadFiles} disabled={filesLoading} className="w-full">
                {filesLoading ? "Loading..." : "Load Documents"}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {fileUrls.front_id_url && (
                  <a href={fileUrls.front_id_url} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="aspect-[4/3] rounded-lg border overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fileUrls.front_id_url} alt="Front ID" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Front ID</p>
                  </a>
                )}
                {fileUrls.insurance_url && (
                  <a href={fileUrls.insurance_url} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="aspect-[4/3] rounded-lg border overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fileUrls.insurance_url} alt="Insurance" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Insurance</p>
                  </a>
                )}
                {fileUrls.registration_url && (
                  <a href={fileUrls.registration_url} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="aspect-[4/3] rounded-lg border overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fileUrls.registration_url} alt="Registration" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Registration</p>
                  </a>
                )}
              </div>
            )}
          </Section>
        )}
      </div>
    </motion.div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}
