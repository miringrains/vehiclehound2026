import { jsPDF } from "jspdf";

type AppData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  ssn?: string | null;
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
  co_ssn?: string | null;
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
  logo_data?: { base64: string; format: "PNG" | "JPEG" | "WEBP" } | null;
  dealership_name?: string | null;
  dealership_phone?: string | null;
};

/* ── Formatters ── */

function val(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "number") return v.toLocaleString("en-US");
  return String(v);
}

function money(v: unknown): string {
  if (v === null || v === undefined) return "";
  return `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtSSN(v: unknown): string {
  if (!v) return "";
  const d = String(v).replace(/\D/g, "");
  if (d.length === 9) return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
  return String(v);
}

function fmtPhone(v: unknown): string {
  if (!v) return "";
  const d = String(v).replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return String(v);
}

/* ── PDF Generation ── */

export function generateCreditApplicationPDF(data: AppData): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const M = 36;
  const W = PW - M * 2;
  const RH = 24;
  const SH = 14;
  const LN = 0.5;
  const PAD = 3;
  let y = M;
  let pg = 1;
  const FY = PH - 28;

  type Col = [number, string, string];

  function drawFooter(p: number) {
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130, 130, 135);
    doc.text("Confidential", M, FY);
    doc.text(`Page ${p}`, PW - M, FY, { align: "right" });
  }

  function ensure(need: number) {
    if (y + need > FY - 10) {
      drawFooter(pg);
      doc.addPage();
      pg++;
      y = M;
    }
  }

  function clip(text: string, maxW: number): string {
    if (!text || doc.getTextWidth(text) <= maxW) return text;
    let t = text;
    while (t.length > 1 && doc.getTextWidth(t + "\u2026") > maxW) t = t.slice(0, -1);
    return t + "\u2026";
  }

  function drawCell(x: number, cw: number, h: number, label: string, value: string) {
    doc.setDrawColor(0);
    doc.setLineWidth(LN);
    doc.rect(x, y, cw, h);

    if (label) {
      doc.setFontSize(5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text(label.toUpperCase(), x + PAD, y + 7);
    }

    if (value) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text(clip(value, cw - PAD * 2), x + PAD, y + h - 5);
    }
  }

  function section(text: string) {
    ensure(SH + RH);
    doc.setFillColor(30, 30, 33);
    doc.setDrawColor(0);
    doc.setLineWidth(LN);
    doc.rect(M, y, W, SH, "FD");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(text.toUpperCase(), M + 4, y + 10);
    y += SH;
  }

  function row(cols: Col[], h = RH) {
    ensure(h);
    let x = M;
    for (const [frac, label, value] of cols) {
      const cw = W * frac;
      drawCell(x, cw, h, label, value);
      x += cw;
    }
    y += h;
  }

  /* ═══════════════════════════════════════════════
     HEADER
     ═══════════════════════════════════════════════ */

  const hdrH = 42;
  doc.setDrawColor(0);
  doc.setLineWidth(LN);
  doc.rect(M, y, W, hdrH);

  let logoRight = M + 8;
  if (data.logo_data) {
    try {
      doc.addImage(data.logo_data.base64, data.logo_data.format, M + 8, y + 5, 72, 32, undefined, "FAST");
      logoRight = M + 86;
    } catch { /* skip logo */ }
  }

  if (data.dealership_name) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(data.dealership_name, logoRight, y + 16);
    if (data.dealership_phone) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(fmtPhone(data.dealership_phone), logoRight, y + 27);
    }
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("CREDIT APPLICATION", M + W / 2, y + 26, { align: "center" });

  y += hdrH;

  /* ═══════════════════════════════════════════════
     PERSONAL INFORMATION
     ═══════════════════════════════════════════════ */

  const appDate = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  section("Personal Information");
  row([
    [0.30, "First Name", val(data.first_name)],
    [0.30, "Last Name", val(data.last_name)],
    [0.20, "Date of Birth", val(data.date_of_birth)],
    [0.20, "Date of Application", appDate],
  ]);
  row([
    [0.25, "Social Security No.", fmtSSN(data.ssn)],
    [0.25, "Phone", fmtPhone(data.phone)],
    [0.50, "Email Address", val(data.email)],
  ]);
  row([
    [0.40, "Address", val(data.address)],
    [0.25, "City", val(data.city)],
    [0.10, "State", val(data.state)],
    [0.25, "Zip", val(data.zip)],
  ]);
  row([
    [0.50, "Residential Status", val(data.residential_status)],
    [0.50, "Monthly Housing Payment", money(data.monthly_payment)],
  ]);

  /* ═══════════════════════════════════════════════
     EMPLOYMENT & INCOME
     ═══════════════════════════════════════════════ */

  section("Employment & Income");
  row([
    [0.40, "Employer", val(data.employer)],
    [0.30, "Occupation", val(data.occupation)],
    [0.30, "Employment Status", val(data.employment_status)],
  ]);

  if (data.employer_address || data.employer_city || data.employer_state || data.employer_zip) {
    row([
      [0.40, "Employer Address", val(data.employer_address)],
      [0.25, "City", val(data.employer_city)],
      [0.10, "State", val(data.employer_state)],
      [0.25, "Zip", val(data.employer_zip)],
    ]);
  }

  const timeParts: string[] = [];
  if (data.years_employed != null) timeParts.push(`${data.years_employed} yr`);
  if (data.months_employed != null) timeParts.push(`${data.months_employed} mo`);

  row([
    [0.34, "Employer Phone", fmtPhone(data.employer_phone)],
    [0.33, "Monthly Income", money(data.monthly_income)],
    [0.33, "Time at Employer", timeParts.join(" ")],
  ]);

  if (data.other_income_sources || data.additional_monthly_income) {
    row([
      [0.50, "Other Income Sources", val(data.other_income_sources)],
      [0.50, "Additional Monthly Income", money(data.additional_monthly_income)],
    ]);
  }

  /* ═══════════════════════════════════════════════
     CO-APPLICANT
     ═══════════════════════════════════════════════ */

  if (data.has_co_applicant) {
    section("Co-Applicant Information");
    row([
      [0.30, "First Name", val(data.co_first_name)],
      [0.30, "Last Name", val(data.co_last_name)],
      [0.20, "Date of Birth", val(data.co_date_of_birth)],
      [0.20, "Phone", fmtPhone(data.co_phone)],
    ]);
    row([
      [0.25, "Social Security No.", fmtSSN(data.co_ssn)],
      [0.45, "Email Address", val(data.co_email)],
      [0.30, "Residential Status", val(data.co_residential_status)],
    ]);
    row([
      [0.40, "Address", val(data.co_address)],
      [0.25, "City", val(data.co_city)],
      [0.10, "State", val(data.co_state)],
      [0.25, "Zip", val(data.co_zip)],
    ]);
    row([
      [0.50, "Monthly Housing Payment", money(data.co_monthly_payment)],
      [0.50, "Employment Status", val(data.co_employment_status)],
    ]);
    row([
      [0.40, "Employer", val(data.co_employer)],
      [0.30, "Occupation", val(data.co_occupation)],
      [0.30, "Monthly Income", money(data.co_monthly_income)],
    ]);
  }

  /* ═══════════════════════════════════════════════
     BUSINESS INFORMATION
     ═══════════════════════════════════════════════ */

  if (data.is_business_app) {
    section("Business Information");
    row([
      [0.40, "Business Name", val(data.business_name)],
      [0.30, "Business Type", val(data.business_type)],
      [0.30, "EIN", val(data.business_ein)],
    ]);
  }

  /* ═══════════════════════════════════════════════
     VEHICLE OF INTEREST
     ═══════════════════════════════════════════════ */

  if (data.vehicle) {
    section("Vehicle of Interest");
    row([
      [0.15, "Year", val(data.vehicle.year)],
      [0.30, "Make", val(data.vehicle.make)],
      [0.35, "Model", val(data.vehicle.model)],
      [0.20, "Stock #", val(data.vehicle.stock_number)],
    ]);
  }

  /* ═══════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════ */

  drawFooter(pg);
  return doc.output("arraybuffer") as unknown as Uint8Array;
}
