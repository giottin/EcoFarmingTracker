create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.is_workspace_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.workspace_members
      where user_id = (select auth.uid())
        and role = 'admin'
    );
$$;

revoke execute on function private.is_workspace_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_workspace_admin() to authenticated;

create table public.access_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_requests_email_length check (char_length(email) between 3 and 320),
  constraint access_requests_status check (status in ('pending', 'rejected'))
);

alter table public.access_requests enable row level security;

revoke all on table public.access_requests from anon, authenticated;
grant select, insert on table public.access_requests to authenticated;
grant update (status, updated_at) on table public.access_requests to authenticated;

grant insert on table public.workspace_members to authenticated;

create policy "players can create their own access request"
on public.access_requests
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  and status = 'pending'
);

create policy "players can read their own access request"
on public.access_requests
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "admins can read access requests"
on public.access_requests
for select
to authenticated
using ((select private.is_workspace_admin()));

create policy "admins can reject access requests"
on public.access_requests
for update
to authenticated
using ((select private.is_workspace_admin()))
with check (
  (select private.is_workspace_admin())
  and status = 'rejected'
);

create policy "admins can remove access requests"
on public.access_requests
for delete
to authenticated
using ((select private.is_workspace_admin()));

create policy "admins can read all memberships"
on public.workspace_members
for select
to authenticated
using ((select private.is_workspace_admin()));

create policy "admins can add members"
on public.workspace_members
for insert
to authenticated
with check (
  (select private.is_workspace_admin())
  and role = 'member'
);

alter publication supabase_realtime add table public.access_requests;
