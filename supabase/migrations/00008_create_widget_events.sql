create table widget_events (
  id            uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references dealerships(id) on delete cascade,
  event         text not null,
  vehicle_id    uuid,
  payload       jsonb default '{}',
  session_id    text not null,
  created_at    timestamptz default now()
);

create index idx_widget_events_dealership on widget_events(dealership_id, created_at desc);
create index idx_widget_events_event on widget_events(dealership_id, event);
create index idx_widget_events_vehicle on widget_events(vehicle_id) where vehicle_id is not null;
