-- Add deal_defaults to dealerships
ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS deal_defaults jsonb DEFAULT '{
  "credit_tiers": [
    { "name": "Tier 1 (750+)",    "apr": 4.99,  "money_factor": 0.00110 },
    { "name": "Tier 2 (700-749)", "apr": 6.49,  "money_factor": 0.00150 },
    { "name": "Tier 3 (650-699)", "apr": 8.99,  "money_factor": 0.00200 },
    { "name": "Tier 4 (600-649)", "apr": 12.99, "money_factor": 0.00300 },
    { "name": "Tier 5 (<600)",    "apr": 17.99, "money_factor": 0.00400 }
  ],
  "doc_fee": 499,
  "title_reg_fee": 350,
  "default_tax_rate": 8.875,
  "default_lease_term": 36,
  "default_finance_term": 60,
  "default_annual_mileage": 10000,
  "excess_mileage_charge": 0.25,
  "acquisition_fee": 895,
  "disposition_fee": 395
}'::jsonb;

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id   uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  email           text,
  phone           text,
  address         text,
  city            text,
  state           text,
  zip             text,
  status          text NOT NULL DEFAULT 'lead',
  source          text,
  notes           jsonb DEFAULT '[]'::jsonb,
  vehicle_interests uuid[] DEFAULT '{}',
  credit_app_id   uuid REFERENCES public.credit_applications(id) ON DELETE SET NULL,
  assigned_to     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_customers_dealership ON public.customers(dealership_id, status);
CREATE INDEX idx_customers_name ON public.customers(dealership_id, last_name, first_name);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealership members can view their customers"
  ON public.customers FOR SELECT TO authenticated
  USING (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can insert customers"
  ON public.customers FOR INSERT TO authenticated
  WITH CHECK (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can update their customers"
  ON public.customers FOR UPDATE TO authenticated
  USING (dealership_id = get_my_dealership_id())
  WITH CHECK (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can delete their customers"
  ON public.customers FOR DELETE TO authenticated
  USING (dealership_id = get_my_dealership_id());

-- Deal sheets table
CREATE TABLE IF NOT EXISTS public.deal_sheets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id   uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  customer_id     uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title           text,
  options         jsonb NOT NULL DEFAULT '[]'::jsonb,
  pdf_path        text,
  status          text NOT NULL DEFAULT 'draft',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_deal_sheets_customer ON public.deal_sheets(customer_id);
CREATE INDEX idx_deal_sheets_dealership ON public.deal_sheets(dealership_id, created_at DESC);

ALTER TABLE public.deal_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealership members can view their deal sheets"
  ON public.deal_sheets FOR SELECT TO authenticated
  USING (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can insert deal sheets"
  ON public.deal_sheets FOR INSERT TO authenticated
  WITH CHECK (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can update their deal sheets"
  ON public.deal_sheets FOR UPDATE TO authenticated
  USING (dealership_id = get_my_dealership_id())
  WITH CHECK (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can delete their deal sheets"
  ON public.deal_sheets FOR DELETE TO authenticated
  USING (dealership_id = get_my_dealership_id());
