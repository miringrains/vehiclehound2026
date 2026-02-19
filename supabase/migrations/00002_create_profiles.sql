create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  pending_email text,
  system_role text not null default 'user' check (system_role in ('sa', 'a', 'user')),
  dealership_role text not null default 'user' check (dealership_role in ('owner', 'manager', 'user')),
  dealership_id uuid references public.dealerships (id) on delete set null,
  invited_by uuid references public.profiles (id) on delete set null,
  joined_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_dealership on public.profiles (dealership_id);
create index idx_profiles_email on public.profiles (email);

alter table public.profiles enable row level security;

create policy "Users can view profiles in their dealership"
  on public.profiles for select
  using (
    dealership_id in (
      select dealership_id from public.profiles
      where id = auth.uid()
    )
    or id = auth.uid()
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Super admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and system_role = 'sa'
    )
  );

-- Auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
