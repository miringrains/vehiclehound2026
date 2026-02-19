create table public.dealerships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  website text,
  logo_url text,
  storefront_enabled boolean not null default false,
  credit_app_emails jsonb not null default '[]'::jsonb,
  max_users integer not null default 4,
  active_users_count integer not null default 0,
  subscription_status text,
  is_free_account boolean not null default false,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_dealerships_slug on public.dealerships (slug);

alter table public.dealerships enable row level security;

create policy "Users can view their own dealership"
  on public.dealerships for select
  using (
    id in (
      select dealership_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Owners can update their dealership"
  on public.dealerships for update
  using (
    id in (
      select dealership_id from public.profiles
      where id = auth.uid()
        and dealership_role in ('owner', 'manager')
    )
  );
