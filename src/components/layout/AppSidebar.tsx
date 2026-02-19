"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { portalNav, type NavGroup, type NavItem } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(routes.login);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-[var(--z-sticky)] flex w-[var(--sidebar-width)] flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-[var(--topbar-height)] items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Car size={18} strokeWidth={ICON_STROKE_WIDTH} className="text-primary-foreground" />
        </div>
        <span className="text-heading-4 text-foreground">VehicleHound</span>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-6">
          {portalNav.map((group, i) => (
            <NavGroupSection key={i} group={group} pathname={pathname} />
          ))}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut size={18} strokeWidth={ICON_STROKE_WIDTH} />
          <span className="text-body-sm">Logout</span>
        </Button>
      </div>
    </aside>
  );
}

function NavGroupSection({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  return (
    <div>
      {group.label && (
        <p className="text-overline text-muted-foreground mb-2 px-2">
          {group.label}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </div>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-body-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
      )}
    >
      <item.icon size={18} strokeWidth={ICON_STROKE_WIDTH} />
      <span>{item.label}</span>
    </Link>
  );
}
