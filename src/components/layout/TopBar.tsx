"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "./UserMenu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] flex h-[var(--topbar-height)] items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm lg:px-8">
      <Breadcrumbs />
      <UserMenu />
    </header>
  );
}
