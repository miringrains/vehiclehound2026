import { jsPDF } from "jspdf";

type AppData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  residential_status?: string | null;
  monthly_payment?: number | null;
  employer?: string | null;
  occupation?: string | null;
  employment_status?: string | null;
  employer_address?: string | null;
  employer_city?: string | null;
  employer_state?: string | null;
  employer_zip?: string | null;
  employer_phone?: string | null;
  monthly_income?: number | null;
  years_employed?: number | null;
  months_employed?: number | null;
  other_income_sources?: string | null;
  additional_monthly_income?: number | null;
  has_co_applicant: boolean;
  co_first_name?: string | null;
  co_last_name?: string | null;
  co_email?: string | null;
  co_phone?: string | null;
  co_date_of_birth?: string | null;
  co_address?: string | null;
  co_city?: string | null;
  co_state?: string | null;
  co_zip?: string | null;
  co_residential_status?: string | null;
  co_monthly_payment?: number | null;
  co_employer?: string | null;
  co_occupation?: string | null;
  co_employment_status?: string | null;
  co_monthly_income?: number | null;
  is_business_app: boolean;
  business_name?: string | null;
  business_type?: string | null;
  business_ein?: string | null;
  vehicle?: { year?: number | null; make?: string | null; model?: string | null; stock_number?: string | null } | null;
  created_at: string;
};

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString("en-US");
  return String(v);
}

function fmtMoney(v: unknown): string {
  if (v === null || v === undefined) return "—";
  return `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateCreditApplicationPDF(data: AppData): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 40;

  const heading = (text: string) => {
    y += 16;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(text, margin, y);
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 14;
  };

  const row = (label: string, value: string) => {
    if (y > 720) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(value, margin + 160, y);
    y += 16;
  };

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 30);
  doc.text("Credit Application", margin, y);
  y += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Submitted ${new Date(data.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`, margin, y);

  if (data.vehicle) {
    y += 6;
    doc.text(`Vehicle: ${[data.vehicle.year, data.vehicle.make, data.vehicle.model].filter(Boolean).join(" ")}${data.vehicle.stock_number ? ` (Stock #${data.vehicle.stock_number})` : ""}`, margin, y);
  }

  heading("Personal Information");
  row("Name", `${data.first_name} ${data.last_name}`);
  row("Email", data.email);
  row("Phone", data.phone);
  row("Date of Birth", fmt(data.date_of_birth));
  row("SSN", "••• - •• - ••••");
  row("Address", fmt(data.address));
  row("City / State / Zip", [fmt(data.city), fmt(data.state), fmt(data.zip)].join(", "));
  row("Residential Status", fmt(data.residential_status));
  row("Monthly Housing Payment", fmtMoney(data.monthly_payment));

  heading("Employment & Income");
  row("Employer", fmt(data.employer));
  row("Occupation", fmt(data.occupation));
  row("Employment Status", fmt(data.employment_status));
  if (data.employer_address) {
    row("Employer Address", fmt(data.employer_address));
    row("Employer City/State/Zip", [fmt(data.employer_city), fmt(data.employer_state), fmt(data.employer_zip)].join(", "));
  }
  if (data.employer_phone) row("Employer Phone", fmt(data.employer_phone));
  row("Monthly Income", fmtMoney(data.monthly_income));
  if (data.years_employed || data.months_employed) {
    row("Time at Employer", `${fmt(data.years_employed)} yr ${fmt(data.months_employed)} mo`);
  }
  if (data.other_income_sources) row("Other Income Sources", fmt(data.other_income_sources));
  if (data.additional_monthly_income) row("Additional Monthly Income", fmtMoney(data.additional_monthly_income));

  if (data.has_co_applicant) {
    heading("Co-Applicant Information");
    row("Name", `${fmt(data.co_first_name)} ${fmt(data.co_last_name)}`);
    row("Email", fmt(data.co_email));
    row("Phone", fmt(data.co_phone));
    row("Date of Birth", fmt(data.co_date_of_birth));
    row("SSN", "••• - •• - ••••");
    row("Address", fmt(data.co_address));
    row("City / State / Zip", [fmt(data.co_city), fmt(data.co_state), fmt(data.co_zip)].join(", "));
    row("Residential Status", fmt(data.co_residential_status));
    row("Monthly Housing Payment", fmtMoney(data.co_monthly_payment));
    row("Employer", fmt(data.co_employer));
    row("Occupation", fmt(data.co_occupation));
    row("Employment Status", fmt(data.co_employment_status));
    row("Monthly Income", fmtMoney(data.co_monthly_income));
  }

  if (data.is_business_app) {
    heading("Business Information");
    row("Business Name", fmt(data.business_name));
    row("Business Type", fmt(data.business_type));
    row("EIN", fmt(data.business_ein));
  }

  y += 20;
  if (y > 720) {
    doc.addPage();
    y = 40;
  }
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text("This document was auto-generated by VehicleHound. SSN fields are redacted for security.", margin, y);

  return doc.output("arraybuffer") as unknown as Uint8Array;
}
