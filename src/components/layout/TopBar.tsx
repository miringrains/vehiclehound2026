"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";

export function TopBar() {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] flex h-[var(--topbar-height)] items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <div className="lg:hidden">
          <MobileNav />
        </div>
        <Breadcrumbs />
      </div>
      <UserMenu />
    </header>
  );
}
