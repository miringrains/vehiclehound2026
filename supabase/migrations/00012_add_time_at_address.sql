-- Add time at current address fields for applicant and co-applicant
ALTER TABLE public.credit_applications
  ADD COLUMN IF NOT EXISTS years_at_address integer,
  ADD COLUMN IF NOT EXISTS months_at_address integer,
  ADD COLUMN IF NOT EXISTS co_years_at_address integer,
  ADD COLUMN IF NOT EXISTS co_months_at_address integer;
