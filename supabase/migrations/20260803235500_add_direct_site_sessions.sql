create table public.workspace_sessions (
  token_hash bytea primary key,
  email text not null references public.allowed_emails(email) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '365 days')
);

alter table public.workspace_sessions enable row level security;
revoke all on table public.workspace_sessions from anon, authenticated;
drop function if exists public.claim_workspace_access(text);
revoke update on table public.workspace_members from authenticated;

create or replace function private.current_workspace_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select allowed.role
  from public.workspace_sessions session
  join public.allowed_emails allowed on allowed.email = session.email
  where session.token_hash = extensions.digest(
    coalesce((current_setting('request.headers', true)::json ->> 'x-eco-session'), ''),
    'sha256'
  )
  and session.expires_at > now()
  limit 1
$$;

create or replace function private.has_workspace_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_workspace_role() is not null
$$;

revoke all on function private.current_workspace_role() from public;
revoke all on function private.has_workspace_access() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.current_workspace_role() to anon, authenticated;
grant execute on function private.has_workspace_access() to anon, authenticated;

create or replace function public.enter_workspace(requested_email text)
returns table (session_token text, email text, role text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(requested_email));
  allowed_role text;
  new_token text;
begin
  select allowed.role into allowed_role
  from public.allowed_emails allowed
  where allowed.email = normalized_email;

  if allowed_role is null then
    return;
  end if;

  new_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.workspace_sessions (token_hash, email)
  values (extensions.digest(new_token, 'sha256'), normalized_email);

  return query select new_token, normalized_email, allowed_role;
end;
$$;

revoke all on function public.enter_workspace(text) from public;
grant execute on function public.enter_workspace(text) to anon, authenticated;

create or replace function public.current_workspace_access()
returns table (email text, role text)
language sql
stable
security definer
set search_path = ''
as $$
  select session.email, allowed.role
  from public.workspace_sessions session
  join public.allowed_emails allowed on allowed.email = session.email
  where session.token_hash = extensions.digest(
    coalesce((current_setting('request.headers', true)::json ->> 'x-eco-session'), ''),
    'sha256'
  )
  and session.expires_at > now()
  limit 1
$$;

revoke all on function public.current_workspace_access() from public;
grant execute on function public.current_workspace_access() to anon, authenticated;

create or replace function public.leave_workspace()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.workspace_sessions
  where token_hash = extensions.digest(
    coalesce((current_setting('request.headers', true)::json ->> 'x-eco-session'), ''),
    'sha256'
  )
$$;

revoke all on function public.leave_workspace() from public;
grant execute on function public.leave_workspace() to anon, authenticated;

create or replace function public.remove_allowed_email(requested_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(requested_email));
  target_role text;
begin
  if private.current_workspace_role() <> 'admin' then
    raise exception 'Administrator access required';
  end if;

  select allowed.role into target_role
  from public.allowed_emails allowed
  where allowed.email = normalized_email;

  if target_role = 'admin' then
    raise exception 'Administrator addresses cannot be removed here';
  end if;

  delete from public.workspace_members where lower(workspace_members.email) = normalized_email;
  delete from public.allowed_emails where allowed_emails.email = normalized_email;
end;
$$;

revoke all on function public.remove_allowed_email(text) from public;
grant execute on function public.remove_allowed_email(text) to anon, authenticated;

do $$
declare policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('farming_fields', 'farming_settings', 'allowed_emails')
  loop
    execute format('drop policy %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end
$$;

alter table public.farming_fields alter column created_by drop not null;
alter table public.farming_fields alter column created_by drop default;

grant select, insert, delete on table public.farming_fields to anon;
grant update (name, crop_id, plant_time, harvest_time, self_regen_fully_grown, is_planted, sort_order, updated_at)
  on table public.farming_fields to anon;
grant usage, select on sequence public.farming_fields_id_seq to anon;
grant select on table public.farming_settings to anon;
grant update (growth_time_modifier, updated_by, updated_at) on table public.farming_settings to anon;
grant select, insert on table public.allowed_emails to anon;

create policy "members can read fields" on public.farming_fields for select to anon, authenticated
using ((select private.has_workspace_access()));
create policy "members can add fields" on public.farming_fields for insert to anon, authenticated
with check ((select private.has_workspace_access()));
create policy "members can update fields" on public.farming_fields for update to anon, authenticated
using ((select private.has_workspace_access())) with check ((select private.has_workspace_access()));
create policy "members can delete fields" on public.farming_fields for delete to anon, authenticated
using ((select private.has_workspace_access()));

create policy "members can read settings" on public.farming_settings for select to anon, authenticated
using ((select private.has_workspace_access()));
create policy "members can update settings" on public.farming_settings for update to anon, authenticated
using ((select private.has_workspace_access())) with check ((select private.has_workspace_access()));

create policy "admins can read allowlist" on public.allowed_emails for select to anon, authenticated
using ((select private.current_workspace_role()) = 'admin');
create policy "admins can add to allowlist" on public.allowed_emails for insert to anon, authenticated
with check ((select private.current_workspace_role()) = 'admin' and role = 'member');
