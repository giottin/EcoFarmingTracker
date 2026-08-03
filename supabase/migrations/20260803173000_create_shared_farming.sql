create table public.workspace_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'member',
  created_at timestamptz not null default now(),
  constraint workspace_members_display_name_length check (char_length(display_name) <= 80),
  constraint workspace_members_role check (role in ('admin', 'member'))
);

create table public.farming_fields (
  id bigint generated always as identity primary key,
  name text not null default '',
  crop_id text not null,
  plant_time timestamptz,
  harvest_time timestamptz,
  self_regen_fully_grown boolean not null default false,
  is_planted boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint farming_fields_name_length check (char_length(name) <= 120),
  constraint farming_fields_crop_id_length check (char_length(crop_id) between 1 and 80),
  constraint farming_fields_sort_order_nonnegative check (sort_order >= 0)
);

create table public.farming_settings (
  singleton boolean primary key default true,
  growth_time_modifier numeric(6, 2) not null default 1.00,
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint farming_settings_single_row check (singleton),
  constraint farming_settings_growth_time_modifier_range
    check (growth_time_modifier between 0.10 and 100.00)
);

insert into public.farming_settings (singleton, growth_time_modifier)
values (true, 1.00);

alter table public.farming_fields enable row level security;
alter table public.farming_settings enable row level security;
alter table public.workspace_members enable row level security;

create index farming_fields_created_by_idx on public.farming_fields (created_by);
create index farming_settings_updated_by_idx on public.farming_settings (updated_by);

revoke all on table public.farming_fields from anon, authenticated;
revoke all on table public.farming_settings from anon, authenticated;
revoke all on table public.workspace_members from anon, authenticated;
revoke all on sequence public.farming_fields_id_seq from anon, authenticated;

grant select, insert, delete on table public.farming_fields to authenticated;
grant update (name, crop_id, plant_time, harvest_time, self_regen_fully_grown, is_planted, sort_order, updated_at)
  on table public.farming_fields to authenticated;
grant select on table public.farming_settings to authenticated;
grant update (growth_time_modifier, updated_by, updated_at)
  on table public.farming_settings to authenticated;
grant select on table public.workspace_members to authenticated;
grant usage, select on sequence public.farming_fields_id_seq to authenticated;

create policy "players can read their membership"
on public.workspace_members
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "signed in players can read farming fields"
on public.farming_fields
for select
to authenticated
using (
  exists (
    select 1 from public.workspace_members
    where user_id = (select auth.uid())
  )
);

create policy "signed in players can add farming fields"
on public.farming_fields
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.workspace_members
    where user_id = (select auth.uid())
  )
);

create policy "signed in players can update farming fields"
on public.farming_fields
for update
to authenticated
using (
  exists (
    select 1 from public.workspace_members
    where user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.workspace_members
    where user_id = (select auth.uid())
  )
);

create policy "signed in players can delete farming fields"
on public.farming_fields
for delete
to authenticated
using (
  exists (
    select 1 from public.workspace_members
    where user_id = (select auth.uid())
  )
);

create policy "signed in players can read farming settings"
on public.farming_settings
for select
to authenticated
using (
  exists (
    select 1 from public.workspace_members
    where user_id = (select auth.uid())
  )
);

create policy "signed in players can update farming settings"
on public.farming_settings
for update
to authenticated
using (
  singleton
  and exists (
    select 1 from public.workspace_members
    where user_id = (select auth.uid())
  )
)
with check (
  singleton
  and exists (
    select 1 from public.workspace_members
    where user_id = (select auth.uid())
  )
);

alter publication supabase_realtime add table public.farming_fields;
alter publication supabase_realtime add table public.farming_settings;
