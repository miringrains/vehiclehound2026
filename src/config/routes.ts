export const routes = {
  home: "/",

  // Auth
  login: "/login",
  signup: "/signup",
  start: (plan: string, interval: string) => `/start/${plan}/${interval}`,
  signupSuccess: "/signup-success",
  signupCancel: "/signup-cancel",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  invitation: (token: string) => `/invitation/${token}`,
  verifyEmail: "/verify-email",

  // Portal
  dashboard: "/dashboard",

  inventory: "/inventory",
  vehicleDetail: (id: string) => `/inventory/${id}`,
  vehicleEdit: (id: string) => `/inventory/${id}/edit`,
  vehicleNew: "/inventory/new",

  import: "/import",
  importCsv: "/import/csv",
  importVauto: "/import/vauto",
  importGwg: "/import/gwg",

  reports: "/reports",
  report: (type: string) => `/reports/${type}`,

  creditApplications: "/credit-applications",
  creditApplication: (id: string) => `/credit-applications/${id}`,

  integrations: "/integrations",
  webflow: "/integrations/webflow",
  webflowSetup: "/integrations/webflow/setup",
  webflowFieldMapping: "/integrations/webflow/field-mapping",
  webflowSyncLogs: "/integrations/webflow/sync-logs",
  widgets: "/integrations/widgets",
  widgetNew: "/integrations/widgets/new",
  widget: (id: string) => `/integrations/widgets/${id}`,
  widgetEmbed: (id: string) => `/integrations/widgets/${id}/embed-code`,
  widgetPreview: (id: string) => `/integrations/widgets/${id}/preview`,

  settings: "/settings",
  settingsAccount: "/settings/account",
  settingsDealership: "/settings/dealership",
  settingsUsers: "/settings/users",

  billing: "/billing",

  // Super Admin
  superAdmin: "/super-admin",
  superAdminDealerships: "/super-admin/dealerships",
  superAdminDealership: (id: string) => `/super-admin/dealerships/${id}`,
  superAdminAdmins: "/super-admin/admins",
  superAdminUsers: "/super-admin/users",
  superAdminTokens: "/super-admin/tokens",
  superAdminIntegrations: "/super-admin/integrations",

  // Public
  storefront: (slug: string) => `/s/${slug}`,
  storefrontVehicle: (slug: string, id: string) => `/s/${slug}/vehicle/${id}`,
  storefrontCreditApp: (slug: string) => `/s/${slug}/credit-application`,
  storefrontCreditAppVehicle: (slug: string, id: string) =>
    `/s/${slug}/credit-application/${id}`,
  publicVehicle: (id: string) => `/vehicles/${id}`,
} as const;
