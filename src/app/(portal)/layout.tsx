import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main content area */}
      <div className="lg:pl-[var(--sidebar-width)]">
        <TopBar />
        <main className="mx-auto max-w-[var(--content-max-width)] px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile nav trigger in topbar area */}
      <div className="fixed top-0 left-0 z-[var(--z-sticky)] flex h-[var(--topbar-height)] items-center px-4 lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
