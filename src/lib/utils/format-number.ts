const formatter = new Intl.NumberFormat("en-US");

export function formatNumber(n: number): string {
  return formatter.format(n);
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatMileage(miles: number): string {
  return `${formatter.format(miles)} mi`;
}
