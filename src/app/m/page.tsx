"use client";

import {
  LayoutDashboard,
  TrendingUp,
  RefreshCw,
  Code2,
  Globe,
  Layers,
  FileText,
  UserPlus,
  Shield,
  Presentation,
  FileDown,
  MessageSquare,
  Palette,
  Smartphone,
  Link2,
} from "lucide-react";
import { Hero } from "./_components/Hero";

import { FeatureShowcase } from "./_components/FeatureShowcase";
import { DashboardDemo } from "./_components/DashboardDemo";
import { WidgetDemo } from "./_components/WidgetDemo";
import { CreditAppDemo } from "./_components/CreditAppDemo";
import { DealSheetDemo } from "./_components/DealSheetDemo";
import { StorefrontDemo } from "./_components/StorefrontDemo";
import { BrowserFrame } from "./_components/BrowserFrame";
import { PricingCards } from "./_components/PricingCards";
import { FinalCTA } from "./_components/FinalCTA";
import { ScrollReveal } from "./_components/ScrollReveal";

export default function LandingPage() {
  return (
    <>
      <Hero />


      <div id="features">
        {/* Feature 1: Dual inventory management — dark */}
        <FeatureShowcase
          badge="Inventory Management"
          title={
            <>
              Built For Both{" "}
              <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
                Retail And Leasing.
              </span>
            </>
          }
          description="Stop trying to force lease specials into software designed only for physical car lots. VehicleHound handles both natively. Manage your retail units and broker lease deals side-by-side, seamlessly organized in one clean dashboard."
          highlights={[
            {
              icon: LayoutDashboard,
              title: "One Dashboard, Both Worlds",
              description:
                "Retail inventory and lease specials live in the same place — sorted, filtered, and tracked together.",
            },
            {
              icon: TrendingUp,
              title: "Know What Moves",
              description:
                "See which units get views, which generate applications, and which sit. Stock smarter.",
            },
            {
              icon: RefreshCw,
              title: "Bulk Operations",
              description:
                "CSV imports, batch updates, multi-photo uploads. Built for volume, not one-at-a-time entry.",
            },
          ]}
          demo={
            <BrowserFrame url="portal.vehiclehound.com/dashboard">
              <DashboardDemo />
            </BrowserFrame>
          }
        />

        {/* Feature 2: Embeddable widgets — light */}
        <FeatureShowcase
          id="widgets"
          badge="Website Widgets"
          title={
            <>
              Drop Your Inventory Onto{" "}
              <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                Any Website.
              </span>
            </>
          }
          description="Keep your current Wix, Squarespace, or WordPress site, but give it an actual engine. Paste two lines of code to embed your live inventory and secure credit application right onto your pages. Update a price in your portal, and it syncs to your website instantly. No developer required."
          highlights={[
            {
              icon: Code2,
              title: "Two Lines of Code",
              description:
                "One script tag, one div. Your full inventory appears — searchable, responsive, branded.",
            },
            {
              icon: Globe,
              title: "Instant Sync",
              description:
                "Change a price or mark a unit sold in the portal. It's reflected on your site immediately.",
            },
            {
              icon: Layers,
              title: "Three Widgets",
              description:
                "Inventory grid, vehicle detail pages, and a standalone credit application — pick what you need.",
            },
          ]}
          demo={<WidgetDemo />}
          reversed
          light
        />

        {/* Feature 3: Credit applications — dark */}
        <FeatureShowcase
          badge="Credit Applications"
          title={
            <>
              From Credit App To{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                CRM Profile, Instantly.
              </span>
            </>
          }
          description="No more double data entry. When a customer submits an application, we automatically generate the exact grid-style PDF your lenders require. Simultaneously, their information builds a new profile in your CRM. The lead comes in, the paperwork is formatted, and the deal is ready to work."
          highlights={[
            {
              icon: FileText,
              title: "Lender-Ready PDFs",
              description:
                "Clean, grid-style applications with your dealership branding — the format your finance team already uses.",
            },
            {
              icon: UserPlus,
              title: "Auto-Built CRM Profiles",
              description:
                "Every submission creates a customer record with their info, documents, and application history.",
            },
            {
              icon: Shield,
              title: "Secure by Default",
              description:
                "SSN data encrypted at rest, submissions logged with IP and timestamps. Built for compliance.",
            },
          ]}
          demo={<CreditAppDemo />}
        />

        {/* Feature 4: Deal sheets — light */}
        <FeatureShowcase
          badge="Deal Sheets"
          title={
            <>
              Present Deals That{" "}
              <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                Actually Look Good.
              </span>
            </>
          }
          description="Help your buyers make decisions without the messy scratchpads and confusing texts. Generate beautifully branded, side-by-side deal comparisons directly from your CRM. Show them their options clearly, look like a premium operation, and get the &ldquo;yes.&rdquo;"
          highlights={[
            {
              icon: Presentation,
              title: "Side-by-Side Scenarios",
              description:
                "Compare finance vs. lease, different terms, or different vehicles — up to 4 options at a glance.",
            },
            {
              icon: FileDown,
              title: "PDF Export & Sharing",
              description:
                "Generate a polished PDF and send it directly to your customer. Professional, fast, done.",
            },
            {
              icon: MessageSquare,
              title: "Close Faster",
              description:
                "Clear comparisons mean fewer back-and-forth texts. Your buyer sees the numbers and decides.",
            },
          ]}
          demo={
            <BrowserFrame url="portal.vehiclehound.com/deal-sheets">
              <DealSheetDemo />
            </BrowserFrame>
          }
          reversed
          light
        />

        {/* Feature 5: Storefront — dark */}
        <FeatureShowcase
          badge="Branded Storefront"
          title={
            <>
              No Website?{" "}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                You Do Now.
              </span>
            </>
          }
          description="If you don't have a digital home yet, VehicleHound auto-generates a clean, mobile-ready storefront the moment you sign up. Add your logo, pick your colors, and start sending clients a link you're actually proud of."
          highlights={[
            {
              icon: Palette,
              title: "Your Brand, Instantly",
              description:
                "Upload your logo, pick a primary color, and your storefront matches your identity automatically.",
            },
            {
              icon: Smartphone,
              title: "Mobile-First",
              description:
                "Fully responsive from phone to desktop — because your customers are shopping on everything.",
            },
            {
              icon: Link2,
              title: "One Link, Full Experience",
              description:
                "Browse inventory, view details, apply for financing — all from a single shareable URL.",
            },
          ]}
          demo={<StorefrontDemo />}
        />
      </div>

      {/* Pricing Teaser */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
              Pricing
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.025em] text-gray-900 sm:text-4xl lg:text-[2.75rem]">
              Pricing That Actually Makes Sense.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="mt-4 text-lg text-gray-500">
              No hidden setup fees, no required onboarding calls, and no paying
              for bloated features you&apos;ll never use. 14-day free trial. Cancel
              anytime.
            </p>
          </ScrollReveal>
        </div>
        <div className="mt-12">
          <PricingCards light />
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
