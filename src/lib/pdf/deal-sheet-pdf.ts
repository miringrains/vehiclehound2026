import { jsPDF } from "jspdf";
import {
  DealOption,
  calculateFinance,
  calculateLease,
  FinanceResult,
  LeaseResult,
} from "@/lib/deal-calc";

type DealSheetData = {
  dealership_name: string;
  customer_name?: string | null;
  title?: string | null;
  options: DealOption[];
  created_at: string;
  logo_data?: { base64: string; format: "PNG" | "JPEG" | "WEBP" } | null;
};

type ComputedOption = {
  opt: DealOption;
  result: FinanceResult | LeaseResult;
  monthly: number;
};

const DARK = [24, 24, 27] as const;
const MID = [100, 100, 106] as const;
const ACCENT = [88, 80, 236] as const;
const ZEBRA = [248, 248, 250] as const;
const LIGHT_LINE = [220, 220, 224] as const;

function fmtMoney(v: number): string {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtMoney2(v: number): string {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v: number): string {
  return v.toFixed(2) + "%";
}

function vehicleTitle(snap: DealOption["vehicle_snapshot"]): string {
  if (!snap) return "—";
  return [snap.year, snap.make, snap.model].filter(Boolean).join(" ");
}

function vehicleSubtitle(snap: DealOption["vehicle_snapshot"]): string {
  if (!snap) return "";
  const parts: string[] = [];
  if (snap.trim) parts.push(snap.trim);
  if (snap.exterior_color) parts.push(snap.exterior_color);
  return parts.join(" · ");
}

function vinShort(snap: DealOption["vehicle_snapshot"]): string {
  if (!snap?.vin) return "";
  return "VIN: ..." + snap.vin.slice(-6);
}

function mileageFmt(snap: DealOption["vehicle_snapshot"]): string {
  if (!snap?.mileage) return "";
  return snap.mileage.toLocaleString("en-US") + " mi";
}

export function generateDealSheetPDF(data: DealSheetData): Uint8Array {
  const optCount = data.options.length;
  const isLandscape = optCount >= 2;

  const doc = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageW = doc.internal.pageSize.getWidth();
  const mx = 40;
  const contentW = pageW - mx * 2;
  let y = 0;

  const computed: ComputedOption[] = data.options.map((opt) => {
    if (opt.type === "finance") {
      const result = calculateFinance(opt);
      return { opt, result, monthly: result.monthly_payment };
    } else {
      const result = calculateLease(opt);
      return { opt, result, monthly: result.monthly_payment };
    }
  });

  const colW = Math.min(220, (contentW - (optCount - 1) * 16) / optCount);
  const totalGridW = colW * optCount + (optCount - 1) * 16;
  const gridStartX = mx + (contentW - totalGridW) / 2;

  // Header
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 72, "F");

  let headerTextX = mx;
  if (data.logo_data) {
    try {
      const logoMaxH = 36;
      const logoMaxW = 80;
      doc.addImage(data.logo_data.base64, data.logo_data.format, mx, 18, logoMaxW, logoMaxH, undefined, "FAST");
      headerTextX = mx + logoMaxW + 12;
    } catch { /* skip logo if invalid */ }
  }

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(data.dealership_name, headerTextX, 38);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(190, 190, 195);
  const dateStr = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(dateStr, pageW - mx, 30, { align: "right" });

  if (data.customer_name) {
    doc.text(`Prepared for: ${data.customer_name}`, headerTextX, 56);
  }
  if (data.title) {
    doc.setTextColor(150, 150, 155);
    doc.text(data.title, pageW - mx, 50, { align: "right" });
  }

  y = 92;

  // Option columns
  computed.forEach((c, i) => {
    const x = gridStartX + i * (colW + 16);
    const { opt, result, monthly } = c;

    // Option label
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ACCENT);
    doc.text(opt.label, x, y);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID);
    const typeLabel =
      opt.type === "finance"
        ? `Finance · ${opt.term_months}mo`
        : `Lease · ${opt.lease_term}mo`;
    doc.text(typeLabel, x, y + 14);

    // Vehicle info
    let vy = y + 30;
    const snap = opt.vehicle_snapshot;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(vehicleTitle(snap), x, vy);
    vy += 12;

    const sub = vehicleSubtitle(snap);
    if (sub) {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MID);
      doc.text(sub, x, vy);
      vy += 10;
    }

    const vin = vinShort(snap);
    if (vin) {
      doc.setFontSize(7);
      doc.setTextColor(...MID);
      doc.text(vin, x, vy);
      vy += 10;
    }

    const mi = mileageFmt(snap);
    if (mi) {
      doc.setFontSize(7);
      doc.setTextColor(...MID);
      doc.text(mi, x, vy);
      vy += 10;
    }

    // Monthly payment box
    vy += 4;
    const boxH = 36;
    doc.setFillColor(240, 238, 255);
    doc.roundedRect(x, vy, colW, boxH, 4, 4, "F");
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ACCENT);
    doc.text(fmtMoney2(monthly), x + colW / 2, vy + 16, { align: "center" });
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID);
    doc.text("/mo", x + colW / 2, vy + 28, { align: "center" });

    vy += boxH + 14;

    // Detail rows
    let rowIdx = 0;
    const detailRow = (label: string, value: string) => {
      if (rowIdx % 2 === 0) {
        doc.setFillColor(...ZEBRA);
        doc.rect(x - 4, vy - 3, colW + 8, 16, "F");
      }
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MID);
      doc.text(label, x, vy + 7);
      doc.setTextColor(...DARK);
      doc.text(value, x + colW, vy + 7, { align: "right" });
      vy += 16;
      rowIdx++;
    };

    detailRow("Selling Price", fmtMoney(opt.selling_price));
    if (opt.down_payment > 0) detailRow("Down Payment", fmtMoney(opt.down_payment));
    const net_trade = Math.max(0, opt.trade_value - opt.trade_payoff);
    if (net_trade > 0) detailRow("Trade Allowance", fmtMoney(net_trade));
    if (opt.rebates > 0) detailRow("Rebates", fmtMoney(opt.rebates));

    if (opt.type === "finance") {
      const fr = result as FinanceResult;
      detailRow("APR", fmtPct(opt.apr));
      detailRow("Term", `${opt.term_months} months`);
      detailRow("Amount Financed", fmtMoney(fr.amount_financed));
      detailRow("Taxes & Fees", fmtMoney(Math.round(fr.tax + fr.total_fees)));
      detailRow("Total Cost", fmtMoney(Math.round(fr.total_cost)));
    } else {
      const lr = result as LeaseResult;
      detailRow("Mileage Allowance", `${opt.annual_mileage.toLocaleString()}/yr`);
      detailRow("Residual", fmtPct(opt.residual_pct));
      detailRow("Due at Signing", fmtMoney(Math.round(lr.due_at_signing)));
      const taxFees =
        opt.doc_fee + opt.title_reg_fee + opt.other_fees + lr.monthly_tax * opt.lease_term;
      detailRow("Taxes & Fees", fmtMoney(Math.round(taxFees)));
      detailRow("Total Lease Cost", fmtMoney(Math.round(lr.total_lease_cost)));
    }
  });

  // Disclaimer
  const disclaimerY = doc.internal.pageSize.getHeight() - 40;
  doc.setDrawColor(...LIGHT_LINE);
  doc.line(mx, disclaimerY - 8, pageW - mx, disclaimerY - 8);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MID);
  doc.text(
    "Figures are estimates only. Subject to credit approval. Tax rates are approximate. See dealer for complete details.",
    mx,
    disclaimerY
  );

  return doc.output("arraybuffer") as unknown as Uint8Array;
}
