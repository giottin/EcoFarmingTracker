-- Folders organize the shared sign library. Existing signs keep a NULL
-- folder_id and therefore remain visible in the “Sans dossier” section.
create table public.saved_sign_folders (
  id bigint generated always as identity primary key,
  name text not null,
  collapsed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint saved_sign_folders_name_length check (char_length(btrim(name)) between 1 and 80)
);

alter table public.saved_sign_folders enable row level security;
revoke all on table public.saved_sign_folders from anon, authenticated;
revoke all on sequence public.saved_sign_folders_id_seq from anon, authenticated;
grant select, insert, update, delete on table public.saved_sign_folders to anon, authenticated;
grant usage, select on sequence public.saved_sign_folders_id_seq to anon, authenticated;

create policy "members can read saved sign folders" on public.saved_sign_folders for select to anon, authenticated
using ((select private.has_workspace_access()));
create policy "members can add saved sign folders" on public.saved_sign_folders for insert to anon, authenticated
with check ((select private.has_workspace_access()));
create policy "members can update saved sign folders" on public.saved_sign_folders for update to anon, authenticated
using ((select private.has_workspace_access()))
with check ((select private.has_workspace_access()));
create policy "members can delete saved sign folders" on public.saved_sign_folders for delete to anon, authenticated
using ((select private.has_workspace_access()));

alter table public.saved_signs
  add column if not exists folder_id bigint references public.saved_sign_folders(id) on delete set null;
create index if not exists saved_signs_folder_id_idx on public.saved_signs(folder_id);

grant update (folder_id) on table public.saved_signs to anon, authenticated;
create policy "members can move saved signs" on public.saved_signs for update to anon, authenticated
using ((select private.has_workspace_access()))
with check ((select private.has_workspace_access()));
