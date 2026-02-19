import {
  LayoutDashboard,
  Car,
  PlusCircle,
  List,
  Upload,
  BarChart3,
  FileText,
  Plug,
  Settings,
  CreditCard,
  Users,
  Building2,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { routes } from "./routes";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: ("owner" | "manager" | "user")[];
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const portalNav: NavGroup[] = [
  {
    label: "",
    items: [
      { label: "Dashboard", href: routes.dashboard, icon: LayoutDashboard },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "New Vehicle", href: routes.vehicleNew, icon: PlusCircle },
      { label: "Manage Inventory", href: routes.inventory, icon: List },
      { label: "CSV Import", href: routes.importCsv, icon: Upload },
      { label: "Insights", href: routes.reports, icon: BarChart3 },
      {
        label: "Applications",
        href: routes.creditApplications,
        icon: FileText,
      },
    ],
  },
  {
    label: "Storefront & Tools",
    items: [
      { label: "Storefront & Tools", href: routes.integrations, icon: Plug },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Account", href: routes.settingsAccount, icon: Settings },
      { label: "Billing", href: routes.billing, icon: CreditCard },
      {
        label: "User Management",
        href: routes.settingsUsers,
        icon: Users,
        roles: ["owner", "manager"],
      },
      {
        label: "Dealership Settings",
        href: routes.settingsDealership,
        icon: Building2,
        roles: ["owner", "manager"],
      },
    ],
  },
];

export const superAdminNav: NavGroup[] = [
  {
    label: "",
    items: [
      { label: "Dashboard", href: routes.superAdmin, icon: LayoutDashboard },
      {
        label: "Dealerships",
        href: routes.superAdminDealerships,
        icon: Building2,
      },
      { label: "Manage Admins", href: routes.superAdminAdmins, icon: Shield },
      {
        label: "Integrations",
        href: routes.superAdminIntegrations,
        icon: Plug,
      },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Account", href: routes.settingsAccount, icon: Settings },
      { label: "Billing", href: routes.billing, icon: CreditCard },
    ],
  },
];
