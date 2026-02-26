import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { deriveColors, mixHex, hexToRgb, luminance } from "@/lib/storefront/colors";
import { StorefrontHeader } from "./_components/StorefrontHeader";
import { StorefrontTracker } from "./_components/StorefrontTracker";

export const dynamic = "force-dynamic";

export type StorefrontConfig = {
  dealershipId: string;
  dealershipName: string;
  slug: string;
  phone: string | null;
  logoUrl: string | null;
  primaryColor: string;
  backgroundColor: string;
  borderRadius: string;
  showPricing: boolean;
  showCreditApp: boolean;
  creditAppUrl: string;
  apiKey: string | null;
};

async function getStorefrontData(slug: string) {
  const admin = createAdminClient();

  const { data: dealership } = await admin
    .from("dealerships")
    .select("id, name, slug, phone, logo_url, storefront_enabled, subscription_status, plan, is_free_account, trial_ends_at")
    .eq("slug", slug)
    .single();

  if (!dealership) return null;

  if (!dealership.storefront_enabled) return { blocked: "disabled" as const, dealership };

  const status = dealership.subscription_status;
  const isFree = dealership.is_free_account;
  if (!isFree && status !== "active" && status !== "trialing") {
    if (dealership.trial_ends_at) {
      const grace = new Date(new Date(dealership.trial_ends_at).getTime() + 7 * 86_400_000);
      if (new Date() > grace) return { blocked: "expired" as const, dealership };
    } else if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
      return { blocked: "expired" as const, dealership };
    }
  }

  const { data: widgetConfig } = await admin
    .from("widget_configs")
    .select("config, api_key")
    .eq("dealership_id", dealership.id)
    .eq("status", "active")
    .single();

  const cfg = widgetConfig?.config ?? {};

  return {
    blocked: null,
    dealership,
    config: {
      dealershipId: dealership.id,
      dealershipName: dealership.name,
      slug: dealership.slug,
      phone: dealership.phone,
      logoUrl: dealership.logo_url,
      primaryColor: cfg.primaryColor || "#1a1d1e",
      backgroundColor: cfg.backgroundColor || "#ffffff",
      borderRadius: cfg.borderRadius || "rounded",
      showPricing: cfg.showPricing !== false,
      showCreditApp: cfg.showCreditApp !== false,
      creditAppUrl: cfg.creditAppUrl || "",
      apiKey: widgetConfig?.api_key || null,
    } satisfies StorefrontConfig,
  };
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStorefrontData(slug);

  if (!data) notFound();

  if (data.blocked) {
    return (
      <html lang="en">
        <body style={{ margin: 0, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", background: "#fafafa", color: "#333" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              {data.blocked === "disabled" ? "Storefront Unavailable" : "Temporarily Unavailable"}
            </h1>
            <p style={{ color: "#666", maxWidth: 400 }}>
              {data.blocked === "disabled"
                ? "This storefront is not currently active."
                : "This storefront is temporarily unavailable. Please check back later."}
            </p>
          </div>
        </body>
      </html>
    );
  }

  const { config } = data;
  const colors = deriveColors(config.backgroundColor);
  const radiusMap: Record<string, number> = { sharp: 4, rounded: 12, soft: 20 };
  const radius = radiusMap[config.borderRadius] || 12;

  const muted = colors.isLight
    ? mixHex(colors.bg, "#000000", 0.04)
    : mixHex(colors.bg, "#ffffff", 0.08);
  const secondary = colors.isLight
    ? mixHex(colors.bg, "#000000", 0.03)
    : mixHex(colors.bg, "#ffffff", 0.05);
  const [pr, pg, pb] = hexToRgb(config.primaryColor);
  const primaryFg = luminance(pr, pg, pb) > 0.4 ? "#1a1d1e" : "#ffffff";

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
          background: colors.bg,
          color: colors.text,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <style>{`
          :root {
            --sf-bg: ${colors.bg};
            --sf-card: ${colors.card};
            --sf-border: ${colors.border};
            --sf-text: ${colors.text};
            --sf-text-muted: ${colors.textMuted};
            --sf-img-bg: ${colors.imgBg};
            --sf-hover: ${colors.hoverBg};
            --sf-primary: ${config.primaryColor};
            --sf-radius: ${radius}px;
            --sf-is-light: ${colors.isLight ? "1" : "0"};

            --background: ${colors.bg};
            --foreground: ${colors.text};
            --card: ${colors.card};
            --card-foreground: ${colors.text};
            --popover: ${colors.card};
            --popover-foreground: ${colors.text};
            --primary: ${config.primaryColor};
            --primary-foreground: ${primaryFg};
            --secondary: ${secondary};
            --secondary-foreground: ${colors.text};
            --muted: ${muted};
            --muted-foreground: ${colors.textMuted};
            --accent: ${config.primaryColor};
            --accent-foreground: ${primaryFg};
            --border: ${colors.border};
            --input: ${colors.border};
            --ring: ${config.primaryColor};
          }
          * { box-sizing: border-box; }
          a { color: inherit; text-decoration: none; }
          body.sf-embed [data-sf-header],
          body.sf-embed [data-sf-footer] { display: none !important; }
          body.sf-embed main { padding-top: 0.5rem !important; }
        `}</style>
        <script dangerouslySetInnerHTML={{ __html: `try{if(window.self!==window.top)document.body.classList.add("sf-embed")}catch(e){document.body.classList.add("sf-embed")}` }} />
        <StorefrontHeader config={config} />
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem" }}>
          {children}
        </main>
        <footer data-sf-footer style={{ borderTop: `1px solid ${colors.border}`, padding: "1.5rem 1rem", textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontSize: 12, color: colors.textMuted }}>
            Powered by{" "}
            <a href="https://vehiclehound.com" target="_blank" rel="noopener noreferrer" style={{ color: config.primaryColor }}>
              VehicleHound
            </a>
          </p>
        </footer>
        {config.apiKey && <StorefrontTracker apiKey={config.apiKey} />}
      </body>
    </html>
  );
}
