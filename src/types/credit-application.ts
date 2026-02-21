export type CreditApplicationStatus = "new" | "reviewed" | "approved" | "denied";

export type CreditApplication = {
  id: string;
  dealership_id: string;
  vehicle_id: string | null;

  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  ssn_encrypted: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  residential_status: string | null;
  monthly_payment: number | null;

  employer: string | null;
  occupation: string | null;
  employment_status: string | null;
  employer_address: string | null;
  employer_city: string | null;
  employer_state: string | null;
  employer_zip: string | null;
  employer_phone: string | null;
  monthly_income: number | null;
  years_employed: number | null;
  months_employed: number | null;
  other_income_sources: string | null;
  additional_monthly_income: number | null;

  has_co_applicant: boolean;
  co_first_name: string | null;
  co_last_name: string | null;
  co_email: string | null;
  co_phone: string | null;
  co_date_of_birth: string | null;
  co_ssn_encrypted: string | null;
  co_address: string | null;
  co_city: string | null;
  co_state: string | null;
  co_zip: string | null;
  co_residential_status: string | null;
  co_monthly_payment: number | null;
  co_employer: string | null;
  co_occupation: string | null;
  co_employment_status: string | null;
  co_monthly_income: number | null;

  is_business_app: boolean;
  business_name: string | null;
  business_type: string | null;
  business_ein: string | null;

  front_id_path: string | null;
  insurance_path: string | null;
  registration_path: string | null;
  pdf_path: string | null;

  status: CreditApplicationStatus;
  ip_address: string | null;
  created_at: string;
  updated_at: string;

  // Joined fields
  vehicle?: {
    year: number | null;
    make: string | null;
    model: string | null;
    stock_number: string | null;
  } | null;
};

export type CreditApplicationFormData = {
  dealership_id: string;
  vehicle_id?: string;

  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  residential_status: string;
  monthly_payment: number | null;

  employer: string;
  occupation: string;
  employment_status: string;
  employer_address?: string;
  employer_city?: string;
  employer_state?: string;
  employer_zip?: string;
  employer_phone?: string;
  monthly_income: number;
  years_employed?: number;
  months_employed?: number;
  other_income_sources?: string;
  additional_monthly_income?: number;

  has_co_applicant: boolean;
  co_first_name?: string;
  co_last_name?: string;
  co_email?: string;
  co_phone?: string;
  co_date_of_birth?: string;
  co_ssn?: string;
  co_address?: string;
  co_city?: string;
  co_state?: string;
  co_zip?: string;
  co_residential_status?: string;
  co_monthly_payment?: number;
  co_employer?: string;
  co_occupation?: string;
  co_employment_status?: string;
  co_monthly_income?: number;

  is_business_app: boolean;
  business_name?: string;
  business_type?: string;
  business_ein?: string;
};

export type WidgetConfig = {
  id: string;
  dealership_id: string;
  api_key: string;
  name: string;
  config: {
    primaryColor: string;
    hoverColor: string;
    showPricing: boolean;
    itemsPerPage: number;
    defaultSort: string;
    creditAppUrl: string;
    borderRadius: "sharp" | "rounded" | "soft";
    backgroundColor: string;
    showCreditApp: boolean;
  };
  allowed_domains: string[];
  status: "active" | "paused";
  created_at: string;
  updated_at: string;
};
