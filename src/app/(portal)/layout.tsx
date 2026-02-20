import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Content panel — elevated surface on dark backdrop */}
      <div className="lg:pl-[var(--sidebar-width)]">
        <div className="p-2 lg:p-3">
          <div className="min-h-[calc(100vh-1rem)] lg:min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-border/50 bg-card">
            <TopBar />
            <main className="mx-auto max-w-[var(--content-max-width)] px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="fixed top-0 left-0 z-[var(--z-sticky)] flex h-[calc(var(--topbar-height)+0.5rem)] items-center px-4 pt-2 lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
