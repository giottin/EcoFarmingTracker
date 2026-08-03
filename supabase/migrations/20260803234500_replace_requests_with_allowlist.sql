alter table public.workspace_members
  add column if not exists email text;

update public.workspace_members membership
set email = lower(auth_user.email)
from auth.users auth_user
where auth_user.id = membership.user_id
  and membership.email is null;

create index if not exists workspace_members_email_idx
  on public.workspace_members (lower(email));

create table public.allowed_emails (
  email text primary key,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  constraint allowed_emails_normalized check (email = lower(trim(email))),
  constraint allowed_emails_length check (char_length(email) between 3 and 320),
  constraint allowed_emails_role check (role in ('admin', 'member'))
);

insert into public.allowed_emails (email, role)
select lower(auth_user.email), membership.role
from public.workspace_members membership
join auth.users auth_user on auth_user.id = membership.user_id
where auth_user.email is not null
on conflict (email) do update set role = excluded.role;

alter table public.allowed_emails enable row level security;
revoke all on table public.allowed_emails from anon, authenticated;
grant select, insert on table public.allowed_emails to authenticated;
grant update (email) on table public.workspace_members to authenticated;

create policy "admins can read allowed emails"
on public.allowed_emails for select to authenticated
using ((select private.is_workspace_admin()));

create policy "admins can add allowed emails"
on public.allowed_emails for insert to authenticated
with check ((select private.is_workspace_admin()) and role = 'member');

create or replace function public.claim_workspace_access(requested_email text)
returns table (email text, role text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(requested_email));
  allowed_role text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select allowed.role into allowed_role
  from public.allowed_emails allowed
  where allowed.email = normalized_email;

  if allowed_role is null then
    return;
  end if;

  insert into public.workspace_members (user_id, display_name, role, email)
  values (auth.uid(), split_part(normalized_email, '@', 1), allowed_role, normalized_email)
  on conflict (user_id) do update
  set display_name = excluded.display_name,
      role = excluded.role,
      email = excluded.email;

  return query select normalized_email, allowed_role;
end;
$$;

revoke all on function public.claim_workspace_access(text) from public, anon;
grant execute on function public.claim_workspace_access(text) to authenticated;

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
  if auth.uid() is null or not private.is_workspace_admin() then
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

revoke all on function public.remove_allowed_email(text) from public, anon;
grant execute on function public.remove_allowed_email(text) to authenticated;

drop table if exists public.access_requests;
alter publication supabase_realtime add table public.allowed_emails;
