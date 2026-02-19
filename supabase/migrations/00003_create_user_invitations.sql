create table public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references public.dealerships (id) on delete cascade,
  email text not null,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  failed_attempts integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_invitations_token on public.user_invitations (token);
create index idx_invitations_dealership on public.user_invitations (dealership_id);

alter table public.user_invitations enable row level security;

create policy "Owners/managers can view invitations for their dealership"
  on public.user_invitations for select
  using (
    dealership_id in (
      select dealership_id from public.profiles
      where id = auth.uid()
        and dealership_role in ('owner', 'manager')
    )
  );

create policy "Owners can create invitations"
  on public.user_invitations for insert
  with check (
    dealership_id in (
      select dealership_id from public.profiles
      where id = auth.uid()
        and dealership_role = 'owner'
    )
  );

create policy "Owners can update invitations"
  on public.user_invitations for update
  using (
    dealership_id in (
      select dealership_id from public.profiles
      where id = auth.uid()
        and dealership_role = 'owner'
    )
  );

create policy "Owners can delete invitations"
  on public.user_invitations for delete
  using (
    dealership_id in (
      select dealership_id from public.profiles
      where id = auth.uid()
        and dealership_role = 'owner'
    )
  );

-- Public token lookup for accepting invitations (no auth required)
create policy "Anyone can look up invitation by token"
  on public.user_invitations for select
  using (true);
