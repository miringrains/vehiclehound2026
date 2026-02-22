export type CreditTier = { name: string; apr: number; money_factor: number };

export type DealDefaults = {
  credit_tiers: CreditTier[];
  doc_fee: number;
  title_reg_fee: number;
  default_tax_rate: number;
  default_lease_term: number;
  default_finance_term: number;
  default_annual_mileage: number;
  excess_mileage_charge: number;
  acquisition_fee: number;
  disposition_fee: number;
};

export type DealOption = {
  id: string;
  label: string;
  type: "finance" | "lease";

  vehicle_id?: string | null;
  vehicle_snapshot?: {
    year?: number | null;
    make?: string | null;
    model?: string | null;
    trim?: string | null;
    vin?: string | null;
    stock_number?: string | null;
    mileage?: number | null;
    exterior_color?: string | null;
    msrp?: number | null;
  } | null;

  selling_price: number;
  msrp: number;
  down_payment: number;
  trade_value: number;
  trade_payoff: number;
  rebates: number;
  doc_fee: number;
  title_reg_fee: number;
  other_fees: number;
  other_fees_label: string;
  tax_rate: number;
  credit_tier: string;

  apr: number;
  term_months: number;

  money_factor: number;
  residual_pct: number;
  lease_term: number;
  annual_mileage: number;
  excess_mileage_charge: number;
  acquisition_fee: number;
  disposition_fee: number;
  security_deposit: number;
};

export type FinanceResult = {
  net_trade: number;
  total_fees: number;
  subtotal: number;
  tax: number;
  total_price: number;
  amount_financed: number;
  monthly_payment: number;
  total_of_payments: number;
  total_interest: number;
  total_cost: number;
};

export type LeaseResult = {
  net_trade: number;
  gross_cap_cost: number;
  cap_cost_reduction: number;
  adjusted_cap_cost: number;
  residual_value: number;
  depreciation: number;
  monthly_depreciation: number;
  monthly_rent_charge: number;
  pre_tax_monthly: number;
  monthly_tax: number;
  monthly_payment: number;
  due_at_signing: number;
  total_lease_cost: number;
};

export function calculateFinance(opt: DealOption): FinanceResult {
  const net_trade = Math.max(0, opt.trade_value - opt.trade_payoff);
  const total_fees = opt.doc_fee + opt.title_reg_fee + opt.other_fees;
  const subtotal = opt.selling_price + total_fees - opt.rebates;
  const tax = subtotal * (opt.tax_rate / 100);
  const total_price = subtotal + tax;
  const amount_financed = Math.max(0, total_price - opt.down_payment - net_trade);

  let monthly_payment = 0;
  if (opt.term_months > 0 && amount_financed > 0) {
    if (opt.apr === 0) {
      monthly_payment = amount_financed / opt.term_months;
    } else {
      const r = opt.apr / 12 / 100;
      const n = opt.term_months;
      monthly_payment = amount_financed * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
  }

  const total_of_payments = monthly_payment * opt.term_months;
  const total_interest = total_of_payments - amount_financed;
  const total_cost = opt.down_payment + total_of_payments;

  return {
    net_trade,
    total_fees,
    subtotal,
    tax,
    total_price,
    amount_financed,
    monthly_payment: round2(monthly_payment),
    total_of_payments: round2(total_of_payments),
    total_interest: round2(total_interest),
    total_cost: round2(total_cost),
  };
}

export function calculateLease(opt: DealOption): LeaseResult {
  const net_trade = Math.max(0, opt.trade_value - opt.trade_payoff);
  const total_fees = opt.doc_fee + opt.title_reg_fee + opt.other_fees;
  const gross_cap_cost = opt.selling_price + opt.acquisition_fee + total_fees;
  const cap_cost_reduction = opt.down_payment + net_trade + opt.rebates;
  const adjusted_cap_cost = gross_cap_cost - cap_cost_reduction;

  const msrp = opt.msrp || opt.selling_price;
  const residual_value = msrp * (opt.residual_pct / 100);
  const depreciation = adjusted_cap_cost - residual_value;

  const term = opt.lease_term || 1;
  const monthly_depreciation = depreciation / term;
  const monthly_rent_charge = (adjusted_cap_cost + residual_value) * opt.money_factor;
  const pre_tax_monthly = monthly_depreciation + monthly_rent_charge;
  const monthly_tax = pre_tax_monthly * (opt.tax_rate / 100);
  const monthly_payment = pre_tax_monthly + monthly_tax;

  const due_at_signing = opt.down_payment + monthly_payment + opt.security_deposit + opt.acquisition_fee;
  const total_lease_cost = monthly_payment * term + due_at_signing - monthly_payment;

  return {
    net_trade,
    gross_cap_cost: round2(gross_cap_cost),
    cap_cost_reduction: round2(cap_cost_reduction),
    adjusted_cap_cost: round2(adjusted_cap_cost),
    residual_value: round2(residual_value),
    depreciation: round2(depreciation),
    monthly_depreciation: round2(monthly_depreciation),
    monthly_rent_charge: round2(monthly_rent_charge),
    pre_tax_monthly: round2(pre_tax_monthly),
    monthly_tax: round2(monthly_tax),
    monthly_payment: round2(monthly_payment),
    due_at_signing: round2(due_at_signing),
    total_lease_cost: round2(total_lease_cost),
  };
}

export function calculateOption(opt: DealOption) {
  return opt.type === "finance" ? calculateFinance(opt) : calculateLease(opt);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function createBlankOption(
  id: string,
  label: string,
  defaults?: DealDefaults | null,
  tier?: CreditTier | null
): DealOption {
  return {
    id,
    label,
    type: "finance",
    vehicle_id: null,
    vehicle_snapshot: null,
    selling_price: 0,
    msrp: 0,
    down_payment: 0,
    trade_value: 0,
    trade_payoff: 0,
    rebates: 0,
    doc_fee: defaults?.doc_fee ?? 499,
    title_reg_fee: defaults?.title_reg_fee ?? 350,
    other_fees: 0,
    other_fees_label: "",
    tax_rate: defaults?.default_tax_rate ?? 8.875,
    credit_tier: tier?.name ?? "",
    apr: tier?.apr ?? 5.99,
    term_months: defaults?.default_finance_term ?? 60,
    money_factor: tier?.money_factor ?? 0.0011,
    residual_pct: 58,
    lease_term: defaults?.default_lease_term ?? 36,
    annual_mileage: defaults?.default_annual_mileage ?? 10000,
    excess_mileage_charge: defaults?.excess_mileage_charge ?? 0.25,
    acquisition_fee: defaults?.acquisition_fee ?? 895,
    disposition_fee: defaults?.disposition_fee ?? 395,
    security_deposit: 0,
  };
}

export const DEFAULT_DEAL_DEFAULTS: DealDefaults = {
  credit_tiers: [
    { name: "Tier 1 (750+)", apr: 4.99, money_factor: 0.0011 },
    { name: "Tier 2 (700-749)", apr: 6.49, money_factor: 0.0015 },
    { name: "Tier 3 (650-699)", apr: 8.99, money_factor: 0.002 },
    { name: "Tier 4 (600-649)", apr: 12.99, money_factor: 0.003 },
    { name: "Tier 5 (<600)", apr: 17.99, money_factor: 0.004 },
  ],
  doc_fee: 499,
  title_reg_fee: 350,
  default_tax_rate: 8.875,
  default_lease_term: 36,
  default_finance_term: 60,
  default_annual_mileage: 10000,
  excess_mileage_charge: 0.25,
  acquisition_fee: 895,
  disposition_fee: 395,
};
