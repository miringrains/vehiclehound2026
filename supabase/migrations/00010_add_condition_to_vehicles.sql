-- Add condition column (new/used) to vehicles table
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS condition text CHECK (condition IN ('new', 'used'));
