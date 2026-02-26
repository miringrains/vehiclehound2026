"use client";

import {
  LayoutDashboard,
  Upload,
  BarChart3,
  Users,
  Code2,
  Globe,
  Zap,
  FileText,
  Mail,
  Shield,
  Palette,
  Smartphone,
} from "lucide-react";
import { Hero } from "./_components/Hero";
import { StatsBar } from "./_components/StatsBar";
import { FeatureShowcase } from "./_components/FeatureShowcase";
import { DashboardDemo } from "./_components/DashboardDemo";
import { WidgetDemo } from "./_components/WidgetDemo";
import { CreditAppDemo } from "./_components/CreditAppDemo";
import { StorefrontDemo } from "./_components/StorefrontDemo";
import { BrowserFrame } from "./_components/BrowserFrame";
import { PricingCards } from "./_components/PricingCards";
import { FinalCTA } from "./_components/FinalCTA";
import { ScrollReveal } from "./_components/ScrollReveal";

export default function LandingPage() {
  return (
    <>
      <Hero />

      <StatsBar />

      <div id="features">
        {/* Feature 1: Inventory Management */}
        <FeatureShowcase
          badge="Inventory Management"
          title={
            <>
              Your entire inventory.{" "}
              <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
                One dashboard.
              </span>
            </>
          }
          description="Add vehicles with a guided wizard, bulk import from CSV, track status, manage photos, and organize everything from a single command center."
          highlights={[
            {
              icon: LayoutDashboard,
              title: "Real-time Dashboard",
              description:
                "Live stats on inventory, widget views, and credit applications with sparkline trends.",
            },
            {
              icon: Upload,
              title: "CSV Bulk Import",
              description:
                "Upload hundreds of vehicles at once with automatic field mapping and validation.",
            },
            {
              icon: BarChart3,
              title: "Analytics & Insights",
              description:
                "Track which vehicles get the most views and convert to credit applications.",
            },
          ]}
          demo={
            <BrowserFrame url="portal.vehiclehound.com/dashboard">
              <DashboardDemo />
            </BrowserFrame>
          }
        />

        {/* Feature 2: Embeddable Widgets */}
        <FeatureShowcase
          id="widgets"
          badge="Embeddable Widgets"
          title={
            <>
              Drop two lines of code.{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Inventory everywhere.
              </span>
            </>
          }
          description="Embed a fully interactive inventory browser, vehicle detail pages, or standalone credit application on any website. No iframes, no headaches."
          highlights={[
            {
              icon: Code2,
              title: "Simple Integration",
              description:
                "A single script tag turns any div into a live, searchable inventory grid.",
            },
            {
              icon: Globe,
              title: "Works Anywhere",
              description:
                "WordPress, Squarespace, Wix, custom sites — if it supports HTML, it works.",
            },
            {
              icon: Zap,
              title: "Full CSS Isolation",
              description:
                "Widget styles never conflict with your site. Zero bleed-through, guaranteed.",
            },
          ]}
          demo={<WidgetDemo />}
          reversed
        />

        {/* Feature 3: Credit Applications */}
        <FeatureShowcase
          badge="Credit Applications"
          title={
            <>
              From application to{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                inbox in seconds.
              </span>
            </>
          }
          description="Customers fill out a branded credit application. You get a professional PDF and their license delivered straight to your email — no portal login needed."
          highlights={[
            {
              icon: FileText,
              title: "Professional PDF Generation",
              description:
                "Clean grid-style forms with your dealership logo, just like traditional applications.",
            },
            {
              icon: Mail,
              title: "Email Attachments",
              description:
                "The PDF and uploaded ID are attached directly to the notification email.",
            },
            {
              icon: Shield,
              title: "Encrypted & Secure",
              description:
                "SSN data encrypted at rest. All submissions logged with IP and timestamp.",
            },
          ]}
          demo={<CreditAppDemo />}
        />

        {/* Feature 4: Storefront */}
        <FeatureShowcase
          badge="Branded Storefront"
          title={
            <>
              A dealership website{" "}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                that builds itself.
              </span>
            </>
          }
          description="Every dealership gets a custom-branded storefront with their own subdomain. Customers browse inventory, view details, and apply for financing — all on your brand."
          highlights={[
            {
              icon: Palette,
              title: "Custom Branding",
              description:
                "Your logo, colors, and domain. Storefronts automatically match your brand identity.",
            },
            {
              icon: Smartphone,
              title: "Mobile Optimized",
              description:
                "Fully responsive design that looks great on every device, from phones to desktops.",
            },
            {
              icon: Users,
              title: "Built-in Lead Capture",
              description:
                "Credit application forms integrated directly into the storefront experience.",
            },
          ]}
          demo={<StorefrontDemo />}
          reversed
        />
      </div>

      {/* Pricing Teaser */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
              Pricing
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Simple, transparent pricing
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free for 14 days. No credit card required. Upgrade or cancel anytime.
            </p>
          </ScrollReveal>
        </div>
        <div className="mt-12">
          <PricingCards />
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
