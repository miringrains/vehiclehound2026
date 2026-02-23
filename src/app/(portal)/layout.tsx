import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AuroraBackdrop } from "@/components/shared/AuroraBackdrop";
import { TrialBanner } from "@/components/shared/TrialBanner";
import { SubscriptionGate } from "@/components/shared/SubscriptionGate";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Aurora behind everything */}
      <AuroraBackdrop subtle />

      {/* Desktop sidebar — dark layer on aurora */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Light floating content panel */}
      <div className="relative z-[1] flex flex-col lg:pl-[var(--sidebar-width)] h-screen p-2 lg:p-3">
        <div className="light-panel flex-1 min-h-0 rounded-2xl bg-background shadow-xl overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden light-scroll">
            <TrialBanner />
            <TopBar />
            <main className="mx-auto max-w-[var(--content-max-width)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              <SubscriptionGate>
                {children}
              </SubscriptionGate>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
