"use client";

import { useRouter } from "next/navigation";
import { Settings, CreditCard, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/config/routes";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

export function UserMenu() {
  const { user } = useUser();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(routes.login);
  }

  const email = user?.email ?? "";
  const initials = email ? email[0].toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-muted outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-caption">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-body-sm font-medium truncate">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(routes.settingsAccount)}>
          <User size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-2" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(routes.billing)}>
          <CreditCard size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-2" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(routes.settings)}>
          <Settings size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut size={14} strokeWidth={ICON_STROKE_WIDTH} className="mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
