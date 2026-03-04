-- Add co-applicant employer details and expanded business fields
ALTER TABLE public.credit_applications
  ADD COLUMN IF NOT EXISTS co_employer_address text,
  ADD COLUMN IF NOT EXISTS co_employer_city text,
  ADD COLUMN IF NOT EXISTS co_employer_state text,
  ADD COLUMN IF NOT EXISTS co_employer_zip text,
  ADD COLUMN IF NOT EXISTS co_employer_phone text,
  ADD COLUMN IF NOT EXISTS co_years_employed integer,
  ADD COLUMN IF NOT EXISTS co_months_employed integer,
  ADD COLUMN IF NOT EXISTS co_other_income_sources text,
  ADD COLUMN IF NOT EXISTS co_additional_monthly_income numeric,
  ADD COLUMN IF NOT EXISTS business_nature text,
  ADD COLUMN IF NOT EXISTS business_address text,
  ADD COLUMN IF NOT EXISTS business_city text,
  ADD COLUMN IF NOT EXISTS business_state text,
  ADD COLUMN IF NOT EXISTS business_zip text,
  ADD COLUMN IF NOT EXISTS business_phone text,
  ADD COLUMN IF NOT EXISTS years_in_business integer;
