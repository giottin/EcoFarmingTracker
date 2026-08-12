create table public.saved_signs (
  id bigint generated always as identity primary key,
  content text not null,
  created_at timestamptz not null default now(),
  constraint saved_signs_content_length check (char_length(content) between 1 and 4000)
);

alter table public.saved_signs enable row level security;
revoke all on table public.saved_signs from anon, authenticated;
revoke all on sequence public.saved_signs_id_seq from anon, authenticated;
grant select, insert, delete on table public.saved_signs to anon, authenticated;
grant usage, select on sequence public.saved_signs_id_seq to anon, authenticated;

create policy "members can read saved signs" on public.saved_signs for select to anon, authenticated
using ((select private.has_workspace_access()));
create policy "members can add saved signs" on public.saved_signs for insert to anon, authenticated
with check ((select private.has_workspace_access()));
create policy "members can delete saved signs" on public.saved_signs for delete to anon, authenticated
using ((select private.has_workspace_access()));
