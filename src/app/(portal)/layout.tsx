import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AuroraBackdrop } from "@/components/shared/AuroraBackdrop";

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
            <TopBar />
            <main className="mx-auto max-w-[var(--content-max-width)] px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile nav — dark layer */}
      <div className="fixed top-0 left-0 z-[var(--z-sticky)] flex h-[calc(var(--topbar-height)+0.5rem)] items-center px-4 pt-2 lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
