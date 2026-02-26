"use client";

import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Code2,
  Globe,
  Palette,
  FileText,
  Shield,
  Clock,
  Smartphone,
  Layers,
  Sparkles,
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
        {/* Feature 1: Inventory Management — dark */}
        <FeatureShowcase
          badge="Inventory Management"
          title={
            <>
              Your entire lot.{" "}
              <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
                One command center.
              </span>
            </>
          }
          description="Add vehicles individually or import thousands at once. Track every unit from intake to sold — with real-time analytics on what's getting attention."
          highlights={[
            {
              icon: LayoutDashboard,
              title: "Live Overview",
              description:
                "See active inventory, engagement trends, and new leads the moment you log in.",
            },
            {
              icon: TrendingUp,
              title: "Know What Sells",
              description:
                "Track views and applications per vehicle so you stock what your market actually wants.",
            },
            {
              icon: BarChart3,
              title: "Bulk Operations",
              description:
                "CSV imports, batch status updates, and photo management — built for volume.",
            },
          ]}
          demo={
            <BrowserFrame url="portal.vehiclehound.com/dashboard">
              <DashboardDemo />
            </BrowserFrame>
          }
        />

        {/* Feature 2: Embeddable Widgets — light */}
        <FeatureShowcase
          id="widgets"
          badge="Embeddable Widgets"
          title={
            <>
              Your inventory.{" "}
              <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                Their website.
              </span>
            </>
          }
          description="Paste two lines of code and your full inventory appears on any website — searchable, responsive, and always up to date. No rebuilds, no maintenance."
          highlights={[
            {
              icon: Code2,
              title: "Two-Line Setup",
              description:
                "One script tag, one div. Works on WordPress, Squarespace, Wix, or any custom site.",
            },
            {
              icon: Globe,
              title: "Always in Sync",
              description:
                "Update a vehicle in the portal and it's instantly reflected on every widget.",
            },
            {
              icon: Layers,
              title: "Inventory, Details & Credit Apps",
              description:
                "Three widgets for different needs — browse, drill down, or apply for financing.",
            },
          ]}
          demo={<WidgetDemo />}
          reversed
          light
        />

        {/* Feature 3: Credit Applications — dark */}
        <FeatureShowcase
          badge="Credit Applications"
          title={
            <>
              Leads that come to{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                you.
              </span>
            </>
          }
          description="Customers apply for financing directly on your site or storefront. You get the full application, their documents, and a professional PDF — instantly."
          highlights={[
            {
              icon: FileText,
              title: "Professional Applications",
              description:
                "Clean, branded forms your customers trust — with the grid-style PDFs your finance team expects.",
            },
            {
              icon: Clock,
              title: "Instant Delivery",
              description:
                "Application and uploaded documents hit your inbox and portal the second they submit.",
            },
            {
              icon: Shield,
              title: "Secure by Default",
              description:
                "Sensitive data encrypted at rest. Every submission logged with timestamps and IP.",
            },
          ]}
          demo={<CreditAppDemo />}
        />

        {/* Feature 4: Storefront — light */}
        <FeatureShowcase
          badge="Branded Storefront"
          title={
            <>
              A dealership site{" "}
              <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                in minutes.
              </span>
            </>
          }
          description="Don't have a website? Every dealership gets a fully branded, mobile-optimized storefront. Your logo, your colors, your inventory — live on its own URL."
          highlights={[
            {
              icon: Palette,
              title: "Fully Branded",
              description:
                "Upload your logo, pick your colors, and your storefront matches your identity automatically.",
            },
            {
              icon: Smartphone,
              title: "Built for Every Screen",
              description:
                "Responsive from phone to desktop — because your customers are shopping everywhere.",
            },
            {
              icon: Sparkles,
              title: "Financing Built In",
              description:
                "Credit application forms integrated right into the storefront. Browse to apply in one flow.",
            },
          ]}
          demo={<StorefrontDemo />}
          reversed
          light
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
              Straightforward pricing
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="mt-4 text-lg text-muted-foreground">
              14-day free trial. No credit card. Cancel anytime.
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
