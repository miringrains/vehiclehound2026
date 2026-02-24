export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
}

export function mixHex(hex: string, target: string, factor: number): string {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(target);
  return rgbToHex(r1 + (r2 - r1) * factor, g1 + (g2 - g1) * factor, b1 + (b2 - b1) * factor);
}

export function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export type DerivedColors = {
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  imgBg: string;
  hoverBg: string;
  isLight: boolean;
};

export function deriveColors(bg: string): DerivedColors {
  if (!bg || typeof bg !== "string") bg = "#ffffff";
  const [r, g, b] = hexToRgb(bg);
  const light = luminance(r, g, b) > 0.4;
  return {
    bg,
    card: light ? mixHex(bg, "#ffffff", 0.6) : mixHex(bg, "#ffffff", 0.06),
    border: light ? mixHex(bg, "#000000", 0.1) : mixHex(bg, "#ffffff", 0.12),
    text: light ? "#1a1d1e" : "#f5f5f5",
    textMuted: light ? "#888888" : "#999999",
    imgBg: light ? mixHex(bg, "#000000", 0.04) : mixHex(bg, "#ffffff", 0.04),
    hoverBg: light ? mixHex(bg, "#000000", 0.02) : mixHex(bg, "#ffffff", 0.03),
    isLight: light,
  };
}
