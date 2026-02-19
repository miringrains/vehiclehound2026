const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatterCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(cents: number): string {
  return formatter.format(cents / 100);
}

export function formatCurrencyDollars(dollars: number): string {
  return formatter.format(dollars);
}

export function formatCurrencyExact(cents: number): string {
  return formatterCents.format(cents / 100);
}
