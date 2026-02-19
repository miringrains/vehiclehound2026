create table public.dealership_audit_logs (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references public.dealerships (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_user_id uuid references public.profiles (id) on delete set null,
  details jsonb default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_dealership on public.dealership_audit_logs (dealership_id);
create index idx_audit_logs_created on public.dealership_audit_logs (created_at desc);

alter table public.dealership_audit_logs enable row level security;

create policy "Users can view audit logs for their dealership"
  on public.dealership_audit_logs for select
  using (
    dealership_id in (
      select dealership_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "System can insert audit logs"
  on public.dealership_audit_logs for insert
  with check (true);

-- Auth logs for security auditing
create table public.auth_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  event text not null,
  ip_address inet,
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_auth_logs_user on public.auth_logs (user_id);
create index idx_auth_logs_created on public.auth_logs (created_at desc);

alter table public.auth_logs enable row level security;

create policy "Users can view their own auth logs"
  on public.auth_logs for select
  using (user_id = auth.uid());

create policy "System can insert auth logs"
  on public.auth_logs for insert
  with check (true);
