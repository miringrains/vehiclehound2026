-- Widget configurations table (one per dealership)
CREATE TABLE IF NOT EXISTS public.widget_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid NOT NULL UNIQUE REFERENCES public.dealerships(id) ON DELETE CASCADE,
  api_key text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  name text NOT NULL DEFAULT 'My Integration',
  config jsonb NOT NULL DEFAULT '{
    "primaryColor": "#1a1d1e",
    "hoverColor": "#374151",
    "showPricing": true,
    "itemsPerPage": 12,
    "defaultSort": "newest",
    "creditAppUrl": ""
  }'::jsonb,
  allowed_domains jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_widget_configs_api_key ON public.widget_configs(api_key);

ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealership members can view their widget config"
  ON public.widget_configs FOR SELECT TO authenticated
  USING (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can insert their widget config"
  ON public.widget_configs FOR INSERT TO authenticated
  WITH CHECK (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can update their widget config"
  ON public.widget_configs FOR UPDATE TO authenticated
  USING (dealership_id = get_my_dealership_id())
  WITH CHECK (dealership_id = get_my_dealership_id());

CREATE POLICY "Dealership members can delete their widget config"
  ON public.widget_configs FOR DELETE TO authenticated
  USING (dealership_id = get_my_dealership_id());
