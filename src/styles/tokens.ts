/**
 * VehicleHound Design Tokens — typed JS export.
 * Every value here corresponds to a CSS variable in globals.css.
 * Use these for JS-side references (Framer Motion, Recharts, etc.)
 */

export const colors = {
  violet: {
    50: "#F1F3FC",
    100: "#E6E8F9",
    200: "#D1D3F4",
    300: "#B5B7EC",
    400: "#9A97E2",
    500: "#877DD7",
    600: "#7663C8",
    700: "#6552AF",
    800: "#52458E",
    900: "#463D72",
    950: "#2A2442",
  },
  neutral: {
    0: "#000000",
    50: "#09090B",
    100: "#111113",
    150: "#161618",
    200: "#1C1C20",
    300: "#27272A",
    400: "#3F3F46",
    500: "#71717A",
    600: "#A1A1AA",
    700: "#D4D4D8",
    800: "#E4E4E7",
    900: "#FAFAFA",
    950: "#FFFFFF",
  },
  semantic: {
    destructive: "#EF4444",
    success: "#22C55E",
    warning: "#F59E0B",
  },
  chart: {
    1: "#877DD7",
    2: "#9A97E2",
    3: "#B5B7EC",
    4: "#38BDF8",
    5: "#34D399",
  },
} as const;

export const layout = {
  sidebarWidth: 260,
  sidebarWidthCollapsed: 68,
  topbarHeight: 64,
  contentMaxWidth: 1280,
  contentMaxWidthPublic: 1440,
  pagePaddingDesktop: 32,
  pagePaddingMobile: 16,
  cardGap: 24,
  cardGapCompact: 16,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
} as const;

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 50,
  sticky: 100,
  overlay: 200,
  modal: 300,
  toast: 400,
  max: 999,
} as const;

export const duration = {
  fast: 100,
  normal: 200,
  smooth: 300,
  slow: 500,
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
