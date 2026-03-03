# Reusable Design System Blueprint

> A platform-agnostic design system specification. Covers architecture, layout, tokens, components, animations, and patterns. Swap in your own colors, fonts, menu items, and content — the structural blueprint remains the same.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Design Tokens (CSS Custom Properties)](#design-tokens-css-custom-properties)
4. [Design Tokens (JavaScript)](#design-tokens-javascript)
5. [Global CSS Architecture](#global-css-architecture)
6. [Layout System](#layout-system)
7. [Sidebar](#sidebar)
8. [Top Bar](#top-bar)
9. [Mobile Navigation](#mobile-navigation)
10. [Light Panel Pattern](#light-panel-pattern)
11. [Aurora WebGL Backdrop](#aurora-webgl-backdrop)
12. [Glass Morphism](#glass-morphism)
13. [Typography Scale](#typography-scale)
14. [Component Library (shadcn/ui)](#component-library-shadcnui)
15. [Custom Shared Components](#custom-shared-components)
16. [Animation System (Framer Motion)](#animation-system-framer-motion)
17. [Button Variant System (CVA)](#button-variant-system-cva)
18. [Form Pattern](#form-pattern)
19. [Responsive Design Patterns](#responsive-design-patterns)
20. [Scrollbar Styling](#scrollbar-styling)
21. [Utility Functions](#utility-functions)
22. [Icon Conventions](#icon-conventions)

---

## Tech Stack

| Layer | Technology | Version (approx) |
|---|---|---|
| Framework | Next.js (App Router) | 16+ |
| UI Library | React | 19+ |
| Language | TypeScript | 5+ |
| CSS Framework | Tailwind CSS | v4 (CSS-first config) |
| Component Primitives | Radix UI (via shadcn/ui, "new-york" style) | latest |
| Variant System | class-variance-authority (CVA) | 0.7+ |
| Class Merging | clsx + tailwind-merge | latest |
| Animations | Framer Motion | 12+ |
| WebGL Backdrop | OGL | 1.0+ |
| Tailwind Animations | tw-animate-css | 1.4+ |
| Icons | lucide-react | latest |
| Forms | react-hook-form + @hookform/resolvers + Zod | latest |
| Data Fetching | @tanstack/react-query | v5 |
| Toasts | Sonner | 2+ |
| Charts | Recharts | 2+ |
| Command Palette | cmdk | 1+ |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | latest |

### PostCSS Config

```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### shadcn/ui Config

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## Project Structure

```
src/
├── app/
│   ├── globals.css              # All design tokens + base styles
│   ├── layout.tsx               # Root layout (fonts, providers, toaster)
│   ├── (portal)/
│   │   └── layout.tsx           # Authenticated app layout (sidebar + light panel)
│   └── (auth)/
│       └── layout.tsx           # Auth layout (centered card on aurora)
├── components/
│   ├── ui/                      # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── shared/                  # Reusable business components (PageHeader, EmptyState, etc.)
│   ├── layout/                  # Layout shells (AppSidebar, TopBar, MobileNav, Breadcrumbs)
│   └── providers/               # Context providers (QueryProvider, etc.)
├── hooks/                       # Custom hooks (useIsMobile, useMediaQuery, etc.)
├── lib/
│   ├── utils.ts                 # cn() class merge utility
│   ├── motion.ts                # Framer Motion variant presets
│   └── constants.ts             # App-wide constants (icon stroke width, etc.)
└── styles/
    └── tokens.ts                # JS-side design token exports
```

---

## Design Tokens (CSS Custom Properties)

All tokens live in `globals.css` under `:root`. The system is **dark-first** — `:root` IS the dark theme. Light surfaces are achieved via the `.light-panel` class (see below).

### Color Ramp

Define a single-hue ramp (50–950) in OKLCH color space. Replace the hue angle to rebrand:

```css
:root {
  /* Replace 280/285 hue angles with your brand hue */
  --brand-50:  oklch(0.96 0.02 YOUR_HUE);
  --brand-100: oklch(0.93 0.03 YOUR_HUE);
  --brand-200: oklch(0.86 0.06 YOUR_HUE);
  --brand-300: oklch(0.78 0.09 YOUR_HUE);
  --brand-400: oklch(0.70 0.12 YOUR_HUE);
  --brand-500: oklch(0.62 0.14 YOUR_HUE);
  --brand-600: oklch(0.54 0.16 YOUR_HUE);
  --brand-700: oklch(0.46 0.16 YOUR_HUE);
  --brand-800: oklch(0.39 0.13 YOUR_HUE);
  --brand-900: oklch(0.33 0.10 YOUR_HUE);
  --brand-950: oklch(0.22 0.07 YOUR_HUE);
}
```

### Semantic Tokens

Map your ramp + neutral tones to semantic roles:

```css
:root {
  --background:           oklch(0.07 0.005 YOUR_HUE);
  --foreground:           oklch(0.98 0 0);

  --card:                 oklch(0.12 0.005 YOUR_HUE);
  --card-foreground:      oklch(0.98 0 0);

  --popover:              oklch(0.12 0.005 YOUR_HUE);
  --popover-foreground:   oklch(0.98 0 0);

  --primary:              var(--brand-700);
  --primary-foreground:   var(--brand-50);

  --secondary:            oklch(0.17 0.005 YOUR_HUE);
  --secondary-foreground: oklch(0.98 0 0);

  --muted:                oklch(0.17 0.005 YOUR_HUE);
  --muted-foreground:     oklch(0.71 0.01 YOUR_HUE);

  --accent:               var(--brand-600);
  --accent-foreground:    var(--brand-50);

  --destructive:          oklch(0.63 0.24 25);
  --destructive-foreground: oklch(0.98 0 0);

  --success:              oklch(0.72 0.19 155);
  --success-foreground:   oklch(0.98 0 0);

  --warning:              oklch(0.80 0.16 85);
  --warning-foreground:   oklch(0.07 0 0);

  --border:               oklch(0.23 0.005 YOUR_HUE);
  --input:                oklch(0.23 0.005 YOUR_HUE);
  --ring:                 var(--brand-500);
}
```

### Sidebar Tokens

Sidebar has its own token set for independent theming:

```css
:root {
  --sidebar:                    oklch(0.14 0.005 YOUR_HUE);
  --sidebar-foreground:         oklch(0.87 0.005 YOUR_HUE);
  --sidebar-primary:            var(--brand-700);
  --sidebar-primary-foreground: var(--brand-50);
  --sidebar-accent:             var(--brand-950);
  --sidebar-accent-foreground:  var(--brand-200);
  --sidebar-border:             oklch(0.23 0.005 YOUR_HUE);
  --sidebar-ring:               var(--brand-500);
}
```

### Shadows (Hue-Tinted)

```css
:root {
  --shadow-sm:   0 1px 2px 0 oklch(0.25 0.02 YOUR_HUE / 0.15);
  --shadow-md:   0 4px 12px 0 oklch(0.2 0.02 YOUR_HUE / 0.2);
  --shadow-lg:   0 8px 32px 0 oklch(0.15 0.03 YOUR_HUE / 0.25);
  --shadow-glow: 0 0 20px 0 oklch(0.5 0.15 YOUR_HUE / 0.15);
}
```

### Radius Scale

Built from a single `--radius` base (0.5rem = 8px):

```css
:root {
  --radius: 0.5rem;
}

@theme inline {
  --radius-sm:  calc(var(--radius) - 4px);   /* 4px */
  --radius-md:  calc(var(--radius) - 2px);   /* 6px */
  --radius-lg:  var(--radius);               /* 8px */
  --radius-xl:  calc(var(--radius) + 4px);   /* 12px */
  --radius-2xl: calc(var(--radius) + 8px);   /* 16px */
  --radius-3xl: calc(var(--radius) + 12px);  /* 20px */
  --radius-4xl: calc(var(--radius) + 16px);  /* 24px */
}
```

### Z-Index Scale

```css
:root {
  --z-base:     0;
  --z-raised:   10;
  --z-dropdown: 50;
  --z-sticky:   100;
  --z-overlay:  200;
  --z-modal:    300;
  --z-toast:    400;
  --z-max:      999;
}
```

### Duration & Easing

```css
:root {
  --duration-fast:   100ms;
  --duration-normal: 200ms;
  --duration-smooth: 300ms;
  --duration-slow:   500ms;

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:     cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.87, 0, 0.13, 1);
}
```

### Layout Constants

```css
:root {
  --sidebar-width:            260px;
  --sidebar-width-collapsed:  68px;
  --topbar-height:            52px;
  --content-max-width:        1280px;
  --content-max-width-public: 1440px;
}
```

---

## Design Tokens (JavaScript)

Mirror tokens in a typed `tokens.ts` for use in JS contexts (Framer Motion, Recharts, inline styles, etc.):

```typescript
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
  none: 0, sm: 4, md: 8, lg: 12, xl: 16, "2xl": 24, full: 9999,
} as const;

export const spacing = {
  0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96,
} as const;

export const zIndex = {
  base: 0, raised: 10, dropdown: 50, sticky: 100,
  overlay: 200, modal: 300, toast: 400, max: 999,
} as const;

export const duration = {
  fast: 100, normal: 200, smooth: 300, slow: 500,
} as const;

export const breakpoints = {
  sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536,
} as const;
```

---

## Global CSS Architecture

### Imports (Tailwind v4)

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));
```

### Theme Inline Block

The `@theme inline` block maps CSS variables to Tailwind's color/radius system so you can use them as utilities (`bg-primary`, `text-muted-foreground`, `rounded-xl`, etc.):

```css
@theme inline {
  --font-sans: var(--font-inter);
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  /* ... all semantic color mappings ... */

  --color-sidebar: var(--sidebar);
  /* ... all sidebar color mappings ... */

  --color-chart-1: var(--chart-1);
  /* ... all chart color mappings ... */

  /* Brand ramp exposed as Tailwind utilities */
  --color-brand-50: var(--brand-50);
  --color-brand-100: var(--brand-100);
  /* ... through 950 ... */

  /* Radius scale */
  --radius-sm: calc(var(--radius) - 4px);
  /* ... full radius scale ... */
}
```

### Base Layer

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "cv11", "ss01";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

---

## Layout System

### Root Layout

The root layout sets up fonts, global providers, and forces dark mode:

```tsx
<html lang="en" className="dark">
  <body className={`${sansFont.variable} ${monoFont.variable} font-sans antialiased`}>
    <QueryProvider>
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </QueryProvider>
  </body>
</html>
```

### Portal (Authenticated App) Layout

The main app layout uses a **dark backdrop + floating light panel** pattern:

```
┌──────────────────────────────────────────────────────┐
│  AuroraBackdrop (fixed, z-0, pointer-events-none)    │
│  ┌──────────┐ ┌────────────────────────────────────┐ │
│  │          │ │  Light Panel (.light-panel)         │ │
│  │ Sidebar  │ │  ┌──────────────────────────────┐  │ │
│  │ (dark,   │ │  │ Trial Banner (conditional)   │  │ │
│  │  fixed,  │ │  ├──────────────────────────────┤  │ │
│  │  lg+)    │ │  │ TopBar (sticky, blur)        │  │ │
│  │          │ │  ├──────────────────────────────┤  │ │
│  │          │ │  │ Main Content (max-width)     │  │ │
│  │          │ │  │                              │  │ │
│  └──────────┘ │  └──────────────────────────────┘  │ │
│               └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

```tsx
function PortalLayout({ children }) {
  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* WebGL aurora — fixed behind everything */}
      <AuroraBackdrop subtle />

      {/* Desktop sidebar — sits on the dark aurora layer */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Floating light content panel */}
      <div className="relative z-[1] flex flex-col lg:pl-[var(--sidebar-width)] h-screen p-2 lg:p-3">
        <div className="light-panel flex-1 min-h-0 rounded-2xl bg-background shadow-xl overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden light-scroll">
            <TopBar />
            <main className="mx-auto max-w-[var(--content-max-width)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Key details:
- **Outer shell**: `h-screen overflow-hidden` prevents double scrollbars
- **Sidebar offset**: `lg:pl-[var(--sidebar-width)]` — only on desktop
- **Outer gap**: `p-2 lg:p-3` creates a visible gap between the dark aurora edge and the light panel
- **Light panel**: `rounded-2xl shadow-xl` gives the floating card feel
- **Scroll container**: Inside the light panel, not the page body
- **Content max-width**: Centered with `mx-auto max-w-[var(--content-max-width)]`
- **Content padding**: Responsive `px-4 py-6 sm:px-6 sm:py-8 lg:px-8`

### Auth Layout

Centered card on the aurora backdrop:

```tsx
function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <AuroraBackdrop />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="light-panel rounded-2xl bg-background p-8 shadow-lg">
          {/* Logo centered inside */}
          <div className="mb-8 flex justify-center">
            <Logo height={34} dark />
          </div>
          {children}
        </div>
      </div>

      {/* Footer — on dark layer */}
      <p className="relative z-10 mt-8 text-caption text-white/40">
        &copy; {new Date().getFullYear()} Your Brand.
      </p>
    </div>
  );
}
```

---

## Sidebar

Fixed sidebar on desktop, hidden on mobile. Sits on the dark aurora layer (not inside the light panel).

### Structure

```tsx
<aside className="fixed inset-y-0 left-0 z-[var(--z-sticky)] flex w-[var(--sidebar-width)] flex-col pt-5 lg:pt-6">
  {/* Logo */}
  <div className="flex items-center px-5 pb-6">
    <Logo height={30} />
  </div>

  {/* Navigation — scrollable */}
  <ScrollArea className="flex-1 px-3">
    <nav className="flex flex-col gap-6">
      {/* Navigation groups go here */}
    </nav>
  </ScrollArea>

  {/* Bottom action (e.g. Logout) */}
  <div className="p-3 pb-5">
    <Button variant="ghost" className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground">
      <Icon size={18} strokeWidth={1.75} />
      <span className="text-body-sm">Action</span>
    </Button>
  </div>
</aside>
```

### Navigation Group

```tsx
<div>
  {/* Group label — uppercase overline */}
  <p className="text-overline text-muted-foreground mb-2 px-2">
    Group Label
  </p>
  {/* Items — tight spacing */}
  <div className="flex flex-col gap-0.5">
    {/* NavLink items */}
  </div>
</div>
```

### Navigation Link

```tsx
<Link
  href={href}
  className={cn(
    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-body-sm transition-colors",
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
  )}
>
  <Icon size={18} strokeWidth={1.75} />
  <span>Label</span>
</Link>
```

---

## Top Bar

Sticky header inside the light panel with backdrop blur:

```tsx
<header className="sticky top-0 z-[var(--z-sticky)] flex h-[var(--topbar-height)] items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
  <div className="flex items-center gap-2">
    {/* Mobile menu trigger (lg:hidden) */}
    <div className="lg:hidden">
      <MobileNav />
    </div>
    <Breadcrumbs />
  </div>
  <UserMenu />
</header>
```

Key techniques:
- `bg-background/80 backdrop-blur-sm` for the frosted-glass header effect
- `sticky top-0` within the scroll container (not the viewport)
- Height locked to `var(--topbar-height)` (52px)

---

## Mobile Navigation

Sheet-based drawer that replaces the sidebar on mobile:

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1">
      <MenuIcon size={20} strokeWidth={1.75} />
    </Button>
  </SheetTrigger>
  <SheetContent
    side="left"
    showCloseButton={false}
    className="w-[280px] p-0 border-r-0 bg-[oklch(0.09_0.005_YOUR_HUE)] flex flex-col"
  >
    {/* Header — logo */}
    <div className="px-5 pt-6 pb-2 space-y-3">
      <Logo height={28} />
    </div>

    {/* Separator */}
    <div className="mx-5 border-t border-white/[0.06]" />

    {/* Navigation — scrollable, same structure as sidebar */}
    <ScrollArea className="flex-1 py-3 px-3">
      <nav className="flex flex-col gap-5">
        {/* Nav groups */}
      </nav>
    </ScrollArea>

    {/* Bottom action */}
    <div className="border-t border-white/[0.06] p-3">
      <Button variant="ghost" className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.04]">
        <Icon size={18} strokeWidth={1.75} />
        <span className="text-body-sm">Action</span>
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

The mobile nav auto-closes on route change via a `useEffect` watching `pathname`.

---

## Light Panel Pattern

The cornerstone visual technique: a **dark-themed app** with a **light-themed content area** floating on top of a dark/aurora background.

### How It Works

`.light-panel` is a CSS class that overrides all semantic color tokens with light-mode values. Any shadcn/ui component nested inside automatically renders in light mode without any prop changes:

```css
.light-panel {
  --background:           oklch(0.98 0.002 YOUR_HUE);
  --foreground:           oklch(0.145 0.005 YOUR_HUE);
  color: var(--foreground);
  background-color: var(--background);

  --card:                 oklch(1.0 0 0);
  --card-foreground:      oklch(0.145 0.005 YOUR_HUE);

  --popover:              oklch(1.0 0 0);
  --popover-foreground:   oklch(0.145 0.005 YOUR_HUE);

  --secondary:            oklch(0.955 0.003 YOUR_HUE);
  --secondary-foreground: oklch(0.145 0.005 YOUR_HUE);

  --muted:                oklch(0.955 0.003 YOUR_HUE);
  --muted-foreground:     oklch(0.44 0.02 YOUR_HUE);

  --border:               oklch(0.91 0.005 YOUR_HUE);
  --input:                oklch(0.91 0.005 YOUR_HUE);

  --shadow-sm:  0 1px 2px 0 oklch(0.50 0.01 YOUR_HUE / 0.06);
  --shadow-md:  0 4px 12px 0 oklch(0.40 0.01 YOUR_HUE / 0.08);
  --shadow-lg:  0 8px 32px 0 oklch(0.30 0.01 YOUR_HUE / 0.10);
}
```

**Usage**: Wrap any content region:

```tsx
<div className="light-panel rounded-2xl bg-background shadow-xl">
  {/* Everything inside is automatically light-themed */}
</div>
```

---

## Aurora WebGL Backdrop

A full-screen animated gradient background using WebGL (OGL library) with Simplex noise-driven aurora waves.

### Wrapper Component

```tsx
function AuroraBackdrop({ subtle = false }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Solid dark base */}
      <div className="absolute inset-0 bg-background" />
      {/* Animated aurora */}
      <Aurora
        colorStops={["#HEX1", "#HEX2", "#HEX3"]}
        speed={subtle ? 0.4 : 0.6}
        amplitude={1.2}
        blend={0.6}
        className={subtle ? "absolute inset-0 opacity-40" : "absolute inset-0 opacity-60"}
      />
    </div>
  );
}
```

### Aurora Component (WebGL Shader)

The `Aurora` component:
- Creates a WebGL canvas via OGL's `Renderer`, `Program`, `Mesh`, `Triangle`
- Uses a custom fragment shader with 2D Simplex noise
- Accepts `colorStops` (3 hex colors), `speed`, `amplitude`, `blend`
- Renders a full-screen triangle (standard WebGL full-screen quad technique)
- Animation runs via `requestAnimationFrame`
- Handles resize events
- Cleans up on unmount

Props:
- `colorStops`: 3 hex colors defining the gradient
- `speed`: Animation speed multiplier (default 1.0)
- `amplitude`: Wave height (default 1.0)
- `blend`: Edge softness (default 0.5)
- `className`: For positioning/opacity

The aurora sits at `z-0` with `pointer-events-none`, behind everything. The subtle variant (behind dashboard content) uses lower opacity (40%) than the auth variant (60%).

---

## Glass Morphism

A `.glass` utility class for frosted-glass card effects on the dark layer:

```css
.glass {
  @apply backdrop-blur-xl border;
  background: oklch(0.12 0.005 YOUR_HUE / 0.8);
  border-color: oklch(0.33 0.10 YOUR_HUE / 0.2);
}
```

### GlassCard Component

```tsx
function GlassCard({ children, className }) {
  return (
    <div className={cn("glass rounded-xl p-6", className)}>
      {children}
    </div>
  );
}
```

---

## Typography Scale

Custom text utility classes defined in `@layer utilities`. Use via Tailwind utility classes:

| Class | Size | Line Height | Weight | Letter Spacing |
|---|---|---|---|---|
| `.text-display-lg` | 2.25rem (36px) | 1.15 | 600 | -0.03em |
| `.text-display-sm` | 1.75rem (28px) | 1.2 | 600 | -0.03em |
| `.text-heading-1` | 1.375rem (22px) | 1.25 | 600 | -0.025em |
| `.text-heading-2` | 1.125rem (18px) | 1.3 | 600 | -0.02em |
| `.text-heading-3` | 0.9375rem (15px) | 1.35 | 600 | -0.015em |
| `.text-heading-4` | 0.8125rem (13px) | 1.4 | 500 | -0.01em |
| `.text-body-lg` | 0.9375rem (15px) | relaxed | 400 | — |
| `.text-body` | 0.875rem (14px) | normal | 400 | — |
| `.text-body-sm` | 0.8125rem (13px) | normal | 400 | — |
| `.text-caption` | 0.75rem (12px) | normal | 500 | — |
| `.text-overline` | 0.625rem (10px) | 1 | 600 | 0.08em, uppercase |
| `.text-code` | 0.8125rem (13px) | — | 400 | mono font |

Key pattern: **headings use negative letter-spacing** (tighter), **overline uses positive** (wider + uppercase).

### Font Setup (Root Layout)

```tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const sans = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], display: "swap" });

// In <body>:
className={`${sans.variable} ${mono.variable} font-sans antialiased`}
```

Font features enabled: `"cv11", "ss01"` (for Inter's alternate characters).

---

## Component Library (shadcn/ui)

All primitive components live in `src/components/ui/` and follow the shadcn/ui "new-york" style. These are installed via the `shadcn` CLI and customized:

### Installed Components

| Component | Primitives | Notes |
|---|---|---|
| `button` | CVA | 6 variants, 8 sizes |
| `card` | — | CardHeader, CardContent, CardFooter, CardAction |
| `dialog` | Radix Dialog | Animated overlay + content |
| `sheet` | Radix Dialog | 4 sides, used for mobile nav |
| `form` | react-hook-form + Radix Label | FormField, FormItem, FormMessage |
| `input` | — | h-8, 13px text, focus ring |
| `select` | Radix Select | — |
| `combobox` | cmdk | Searchable select |
| `command` | cmdk | Command palette |
| `table` | — | Hover rows, responsive wrapper |
| `badge` | CVA | default, secondary, destructive, outline |
| `tabs` | Radix Tabs | — |
| `tooltip` | Radix Tooltip | 300ms delay |
| `popover` | Radix Popover | — |
| `dropdown-menu` | Radix DropdownMenu | Animated, destructive variant |
| `calendar` | react-day-picker | — |
| `chart` | Recharts | 5-color chart palette |
| `alert` | — | — |
| `skeleton` | — | Pulse animation |
| `scroll-area` | Radix ScrollArea | — |
| `separator` | Radix Separator | — |
| `avatar` | Radix Avatar | — |
| `breadcrumb` | — | — |
| `checkbox` | Radix Checkbox | — |
| `radio-group` | Radix RadioGroup | — |
| `switch` | Radix Switch | — |
| `progress` | Radix Progress | — |
| `sonner` | Sonner | Toast notifications |

---

## Custom Shared Components

Built on top of shadcn/ui primitives, these provide higher-level patterns:

### PageHeader

Animated page title with optional action slot:

```tsx
function PageHeader({ title, description, children }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-heading-1">{title}</h1>
        {description && (
          <p className="mt-1 text-body-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="mt-4 flex items-center gap-3 sm:mt-0">{children}</div>
      )}
    </motion.div>
  );
}
```

### EmptyState

Centered empty state with icon, title, description, optional action:

```tsx
function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 rounded-xl bg-muted p-4">
        <Icon size={32} strokeWidth={1.75} className="text-muted-foreground" />
      </div>
      <h3 className="text-heading-3 mb-1">{title}</h3>
      <p className="text-body-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6" size="lg">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
```

### Breadcrumbs

Auto-generated from pathname, responsive:

- Home icon as root
- Middle segments hidden on mobile (`hidden sm:flex`)
- Last segment always visible, truncated at `max-w-[160px] sm:max-w-[200px]`
- UUID segments filtered out
- Chevron separators at 12px

### ConfirmDialog

Dialog wrapper for destructive/confirmation actions with loading state support.

### SearchInput

Controlled search input with search icon and clear button.

### StatusBadge

Maps status strings to badge variants with consistent styling per status type.

---

## Animation System (Framer Motion)

Centralized animation presets in `lib/motion.ts`:

### Easing Functions

```typescript
const easeOut = [0.16, 1, 0.3, 1];    // Primary ease — snappy deceleration
const easeIn = [0.7, 0, 0.84, 0];     // For exits
const easeInOut = [0.87, 0, 0.13, 1]; // Reserved for special cases
```

### Transitions

```typescript
const transitions = {
  fast:   { duration: 0.1, ease: easeOut },
  normal: { duration: 0.2, ease: easeOut },
  smooth: { duration: 0.3, ease: easeOut },
  slow:   { duration: 0.5, ease: easeOut },
  spring: { type: "spring", stiffness: 300, damping: 30 },
};
```

### Variant Presets

| Variant | Hidden State | Visible State | Exit State |
|---|---|---|---|
| `fadeIn` | `opacity: 0` | `opacity: 1` | `opacity: 0` |
| `fadeUp` | `opacity: 0, y: 12` | `opacity: 1, y: 0` | `opacity: 0, y: -8` |
| `fadeDown` | `opacity: 0, y: -12` | `opacity: 1, y: 0` | `opacity: 0, y: 12` |
| `scaleIn` | `opacity: 0, scale: 0.95` | `opacity: 1, scale: 1` | `opacity: 0, scale: 0.95` |
| `slideInLeft` | `x: -16, opacity: 0` | `x: 0, opacity: 1` | `x: -16, opacity: 0` |
| `slideInRight` | `x: 16, opacity: 0` | `x: 0, opacity: 1` | `x: 16, opacity: 0` |

### Stagger Pattern

```typescript
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
};
```

### Page Transition

```typescript
const pageTransition = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: easeOut, staggerChildren: 0.05, delayChildren: 0.05 },
  },
};
```

### Usage Pattern

```tsx
// Simple entrance
<motion.div variants={fadeUp} initial="hidden" animate="visible">
  {content}
</motion.div>

// Staggered list
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// Page-level transition
<motion.div variants={pageTransition} initial="hidden" animate="visible">
  <PageHeader />
  <motion.div variants={staggerItem}>{/* Section 1 */}</motion.div>
  <motion.div variants={staggerItem}>{/* Section 2 */}</motion.div>
</motion.div>

// AnimatePresence for route/view switching
<AnimatePresence mode="wait">
  <motion.div key={viewKey} variants={fadeUp} initial="hidden" animate="visible" exit="exit">
    {currentView}
  </motion.div>
</AnimatePresence>
```

---

## Button Variant System (CVA)

Buttons use `class-variance-authority` for type-safe variants:

### Variants

| Variant | Styles |
|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` |
| `destructive` | `bg-destructive text-white hover:bg-destructive/90` |
| `outline` | `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline` |

### Sizes

| Size | Dimensions |
|---|---|
| `xs` | `h-6 px-2 text-xs rounded-md` |
| `sm` | `h-7 px-3 text-xs rounded-md` |
| `default` | `h-9 px-4 py-2 text-[0.8125rem]` |
| `lg` | `h-10 px-5 text-[0.8125rem] rounded-md` |
| `xl` | `h-12 px-7 text-sm rounded-md` |
| `icon` | `size-9` |
| `icon-xs` | `size-6 rounded-md` |
| `icon-sm` | `size-7` |
| `icon-lg` | `size-9` |

### Base Styles

All buttons share:

```
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50
[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
aria-invalid:ring-destructive/20 aria-invalid:border-destructive
```

---

## Form Pattern

Forms use react-hook-form with Zod validation and shadcn/ui form components:

```tsx
const schema = z.object({
  fieldName: z.string().min(1, "Required"),
});

function MyForm() {
  const form = useForm({ resolver: zodResolver(schema) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Help text</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

Input styling: `h-8 rounded-md border px-2.5 py-1 text-[0.8125rem]` with focus ring and error states.

---

## Responsive Design Patterns

### Breakpoints

| Name | Width | Usage |
|---|---|---|
| `sm` | 640px | Minor layout adjustments |
| `md` | 768px | Mobile detection threshold |
| `lg` | 1024px | **Sidebar visibility breakpoint** |
| `xl` | 1280px | Content max-width |
| `2xl` | 1536px | Wide screens |

### Mobile Detection Hook

```typescript
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(undefined);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
```

### Common Responsive Patterns

| Pattern | Mobile | Desktop |
|---|---|---|
| **Sidebar** | Hidden, replaced by Sheet | Fixed, `lg:block` |
| **Layout padding** | `p-2`, `px-4` | `lg:p-3`, `lg:px-8` |
| **Content width** | Full width | `max-w-[var(--content-max-width)]` |
| **Page header** | Stacked (`flex-col`) | Side-by-side (`sm:flex-row`) |
| **Breadcrumbs** | Last segment only | All segments (`hidden sm:flex`) |
| **Dialogs** | Full-width sheets | Centered dialogs with max-width |
| **Grids** | Single column | Multi-column (`sm:grid-cols-*`, `lg:grid-cols-*`) |
| **Navigation links** | Slightly taller (`py-2.5`) | Standard (`py-2`) |

---

## Scrollbar Styling

### Dark Theme (Default)

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: oklch(0.30 0.005 YOUR_HUE);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover { background: oklch(0.40 0.01 YOUR_HUE); }
```

### Light Panel Scrollbars

Thinner and lighter inside `.light-panel`:

```css
.light-panel ::-webkit-scrollbar { width: 6px; height: 6px; }
.light-panel ::-webkit-scrollbar-track { background: transparent; }
.light-panel ::-webkit-scrollbar-thumb {
  background: oklch(0.85 0.005 YOUR_HUE);
  border-radius: 3px;
}
.light-panel ::-webkit-scrollbar-thumb:hover { background: oklch(0.75 0.01 YOUR_HUE); }
```

---

## Utility Functions

### `cn()` — Class Merge

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Used everywhere to conditionally merge Tailwind classes without conflicts.

---

## Icon Conventions

- **Library**: lucide-react
- **Default size**: 18px for navigation, 16px (via `size-4`) for inline/buttons
- **Stroke width**: `1.75` (defined as `ICON_STROKE_WIDTH` constant)
- **Auto-sizing in buttons**: `[&_svg:not([class*='size-'])]:size-4` ensures icons without explicit sizing get 16px
- **Muted icons**: `text-muted-foreground` for secondary icons
- **Icon-only buttons**: Use `size="icon"` variant (36px square)

---

## Summary of Key Architectural Decisions

1. **Dark-first, light-panel pattern**: The app shell and sidebar are dark-themed. Content floats in a `.light-panel` that overrides CSS variables — no theme prop drilling needed.

2. **WebGL aurora backdrop**: Creates depth and visual richness without impacting layout. Sits at `z-0` with `pointer-events-none`.

3. **CSS variables for everything**: All design tokens are CSS custom properties, mapped into Tailwind v4's `@theme inline` block for utility-class access.

4. **OKLCH color space**: Perceptually uniform color ramps. Change the hue angle to rebrand the entire system.

5. **Sidebar on dark layer**: The sidebar sits directly on the aurora, visually separated from the light content panel. This creates a clear spatial hierarchy.

6. **Floating panel with gap**: The `p-2 lg:p-3` on the panel wrapper creates a visible dark border/gap around the light content, reinforcing the "card floating on dark surface" metaphor.

7. **Centralized motion presets**: All animations reference shared variants from `motion.ts`. Consistent timing across the app.

8. **shadcn/ui as the primitive layer**: All base components are shadcn/ui (Radix-based). Custom shared components compose these primitives for app-level patterns.

9. **Responsive sidebar → sheet**: Desktop gets a fixed sidebar. Mobile gets a sheet-based drawer triggered from the top bar. Both share the same navigation data and structure.

10. **Typography as utility classes**: Named text styles (`.text-heading-1`, `.text-body-sm`, etc.) instead of ad-hoc size/weight combinations, ensuring consistency.
