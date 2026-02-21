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
};

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === "") return "\u2014";
  if (typeof v === "number") return v.toLocaleString("en-US");
  return String(v);
}

function fmtMoney(v: unknown): string {
  if (v === null || v === undefined) return "\u2014";
  return `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtSSN(v: unknown): string {
  if (!v) return "\u2014";
  const d = String(v).replace(/\D/g, "");
  if (d.length === 9) return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
  return String(v);
}

function fmtPhone(v: unknown): string {
  if (!v) return "\u2014";
  const d = String(v).replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return String(v);
}

export function generateCreditApplicationPDF(data: AppData): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mx = 48;
  const contentW = pageW - mx * 2;
  let y = 0;

  const DARK = [24, 24, 27] as const;
  const MID = [115, 115, 120] as const;
  const LIGHT_LINE = [230, 230, 232] as const;
  const ACCENT = [88, 80, 236] as const;
  const ZEBRA = [248, 248, 250] as const;

  const ensureSpace = (need: number) => {
    if (y + need > pageH - 40) {
      doc.addPage();
      y = 48;
    }
  };

  // ── Header bar ──
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Credit Application", mx, 46);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 205);
  const dateStr = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  doc.text(dateStr, mx, 64);

  if (data.vehicle) {
    const vLabel = [data.vehicle.year, data.vehicle.make, data.vehicle.model].filter(Boolean).join(" ");
    const stock = data.vehicle.stock_number ? `  \u2022  Stock #${data.vehicle.stock_number}` : "";
    doc.text(vLabel + stock, pageW - mx, 46, { align: "right" });
  }

  y = 104;

  // ── Section heading ──
  const sectionHeading = (text: string) => {
    ensureSpace(40);
    y += 6;
    doc.setFillColor(...ACCENT);
    doc.rect(mx, y, 3, 14, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(text, mx + 12, y + 11);
    y += 28;
  };

  // ── Row drawing ──
  let rowIdx = 0;
  const startTable = () => { rowIdx = 0; };

  const row = (label: string, value: string) => {
    ensureSpace(22);
    if (rowIdx % 2 === 0) {
      doc.setFillColor(...ZEBRA);
      doc.rect(mx, y - 4, contentW, 20, "F");
    }
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID);
    doc.text(label, mx + 8, y + 9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    doc.text(value, mx + 180, y + 9);
    y += 20;
    rowIdx++;
  };

  const twoCol = (l1: string, v1: string, l2: string, v2: string) => {
    ensureSpace(22);
    const halfW = contentW / 2;
    if (rowIdx % 2 === 0) {
      doc.setFillColor(...ZEBRA);
      doc.rect(mx, y - 4, contentW, 20, "F");
    }
    doc.setFontSize(8.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID);
    doc.text(l1, mx + 8, y + 9);
    doc.setTextColor(...DARK);
    doc.text(v1, mx + 100, y + 9);

    doc.setTextColor(...MID);
    doc.text(l2, mx + halfW + 8, y + 9);
    doc.setTextColor(...DARK);
    doc.text(v2, mx + halfW + 100, y + 9);

    y += 20;
    rowIdx++;
  };

  const sectionDivider = () => {
    y += 8;
    doc.setDrawColor(...LIGHT_LINE);
    doc.line(mx, y, pageW - mx, y);
    y += 4;
  };

  // ═══════════════════════════════════════════
  // PERSONAL INFORMATION
  // ═══════════════════════════════════════════
  sectionHeading("Personal Information");
  startTable();
  twoCol("Name", `${data.first_name} ${data.last_name}`, "Date of Birth", fmt(data.date_of_birth));
  twoCol("Email", data.email, "Phone", fmtPhone(data.phone));
  row("SSN", fmtSSN(data.ssn));
  row("Address", fmt(data.address));
  twoCol(
    "City / State",
    [fmt(data.city), fmt(data.state)].join(", "),
    "Zip",
    fmt(data.zip),
  );
  twoCol("Residential Status", fmt(data.residential_status), "Housing Payment", fmtMoney(data.monthly_payment));

  sectionDivider();

  // ═══════════════════════════════════════════
  // EMPLOYMENT & INCOME
  // ═══════════════════════════════════════════
  sectionHeading("Employment & Income");
  startTable();
  twoCol("Employer", fmt(data.employer), "Occupation", fmt(data.occupation));
  twoCol("Status", fmt(data.employment_status), "Monthly Income", fmtMoney(data.monthly_income));
  if (data.years_employed || data.months_employed) {
    row("Time at Employer", `${fmt(data.years_employed)} yr ${fmt(data.months_employed)} mo`);
  }
  if (data.employer_address) {
    row("Employer Address", fmt(data.employer_address));
    twoCol(
      "Employer City / State",
      [fmt(data.employer_city), fmt(data.employer_state)].join(", "),
      "Zip",
      fmt(data.employer_zip),
    );
  }
  if (data.employer_phone) row("Employer Phone", fmtPhone(data.employer_phone));
  if (data.other_income_sources) row("Other Income Sources", fmt(data.other_income_sources));
  if (data.additional_monthly_income) row("Additional Income", fmtMoney(data.additional_monthly_income));

  // ═══════════════════════════════════════════
  // CO-APPLICANT
  // ═══════════════════════════════════════════
  if (data.has_co_applicant) {
    sectionDivider();
    sectionHeading("Co-Applicant");
    startTable();
    twoCol("Name", `${fmt(data.co_first_name)} ${fmt(data.co_last_name)}`, "Date of Birth", fmt(data.co_date_of_birth));
    twoCol("Email", fmt(data.co_email), "Phone", fmtPhone(data.co_phone));
    row("SSN", fmtSSN(data.co_ssn));
    row("Address", fmt(data.co_address));
    twoCol(
      "City / State",
      [fmt(data.co_city), fmt(data.co_state)].join(", "),
      "Zip",
      fmt(data.co_zip),
    );
    twoCol("Residential Status", fmt(data.co_residential_status), "Housing Payment", fmtMoney(data.co_monthly_payment));
    twoCol("Employer", fmt(data.co_employer), "Occupation", fmt(data.co_occupation));
    twoCol("Status", fmt(data.co_employment_status), "Monthly Income", fmtMoney(data.co_monthly_income));
  }

  // ═══════════════════════════════════════════
  // BUSINESS
  // ═══════════════════════════════════════════
  if (data.is_business_app) {
    sectionDivider();
    sectionHeading("Business Information");
    startTable();
    twoCol("Business Name", fmt(data.business_name), "Type", fmt(data.business_type));
    row("EIN", fmt(data.business_ein));
  }

  return doc.output("arraybuffer") as unknown as Uint8Array;
}
