-- Credit applications table
CREATE TABLE IF NOT EXISTS public.credit_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,

  -- Applicant
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date_of_birth date,
  ssn_encrypted text,
  address text,
  city text,
  state text,
  zip text,
  residential_status text,
  monthly_payment numeric,

  -- Employment
  employer text,
  occupation text,
  employment_status text,
  employer_address text,
  employer_city text,
  employer_state text,
  employer_zip text,
  employer_phone text,
  monthly_income numeric,
  years_employed integer,
  months_employed integer,
  other_income_sources text,
  additional_monthly_income numeric,

  -- Co-applicant
  has_co_applicant boolean NOT NULL DEFAULT false,
  co_first_name text,
  co_last_name text,
  co_email text,
  co_phone text,
  co_date_of_birth date,
  co_ssn_encrypted text,
  co_address text,
  co_city text,
  co_state text,
  co_zip text,
  co_residential_status text,
  co_monthly_payment numeric,
  co_employer text,
  co_occupation text,
  co_employment_status text,
  co_monthly_income numeric,

  -- Business
  is_business_app boolean NOT NULL DEFAULT false,
  business_name text,
  business_type text,
  business_ein text,

  -- Files (storage paths)
  front_id_path text,
  insurance_path text,
  registration_path text,
  pdf_path text,

  -- Meta
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'approved', 'denied')),
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_applications_dealership ON public.credit_applications(dealership_id);
CREATE INDEX idx_credit_applications_status ON public.credit_applications(status);
CREATE INDEX idx_credit_applications_created ON public.credit_applications(created_at DESC);

ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealership members can view their applications"
  ON public.credit_applications FOR SELECT TO authenticated
  USING (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can update their applications"
  ON public.credit_applications FOR UPDATE TO authenticated
  USING (dealership_id = get_my_dealership_id())
  WITH CHECK (dealership_id = get_my_dealership_id());

-- Storage bucket for credit app files (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'credit-app-files',
  'credit-app-files',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Dealership members can read credit app files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'credit-app-files'
    AND (storage.foldername(name))[1] = (get_my_dealership_id())::text
  );
