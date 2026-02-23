"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { portalNav, type NavGroup, type NavItem } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/config/routes";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dealershipName, setDealershipName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("dealership_id, dealership_role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (!data) return;
          setUserRole(data.dealership_role);
          if (data.dealership_id) {
            supabase
              .from("dealerships")
              .select("name")
              .eq("id", data.dealership_id)
              .single()
              .then(({ data: dlr }) => {
                if (dlr?.name) setDealershipName(dlr.name);
              });
          }
        });
    });
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(routes.login);
    setOpen(false);
  }

  const filteredNav = portalNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.roles) return true;
        if (!userRole) return false;
        return item.roles.includes(userRole as "owner" | "manager" | "user");
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1">
          <Menu size={20} strokeWidth={ICON_STROKE_WIDTH} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[280px] p-0 border-r-0 bg-[oklch(0.09_0.005_285)] flex flex-col"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        {/* Header — logo + dealership */}
        <div className="px-5 pt-6 pb-2 space-y-3">
          <Link href={routes.dashboard} onClick={() => setOpen(false)}>
            <Logo height={28} />
          </Link>
          {dealershipName && (
            <div className="flex items-center gap-1.5 px-0.5">
              <Building2 size={12} className="text-muted-foreground shrink-0" strokeWidth={ICON_STROKE_WIDTH} />
              <span className="text-caption text-muted-foreground font-medium truncate">{dealershipName}</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="mx-5 border-t border-white/[0.06]" />

        {/* Navigation — scrollable */}
        <ScrollArea className="flex-1 py-3 px-3">
          <nav className="flex flex-col gap-5">
            {filteredNav.map((group, i) => (
              <MobileNavGroup key={i} group={group} pathname={pathname} onNavigate={() => setOpen(false)} />
            ))}
          </nav>
        </ScrollArea>

        {/* Logout */}
        <div className="border-t border-white/[0.06] p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            onClick={handleLogout}
          >
            <LogOut size={18} strokeWidth={ICON_STROKE_WIDTH} />
            <span className="text-body-sm">Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavGroup({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate: () => void;
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
          <MobileNavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function MobileNavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-body-sm transition-colors",
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
