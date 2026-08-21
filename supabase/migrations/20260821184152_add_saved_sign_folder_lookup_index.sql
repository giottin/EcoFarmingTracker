-- The folder relation is used by updates and ON DELETE SET NULL. Keeping an
-- index on the foreign key prevents those operations from scanning the whole
-- shared panel library as it grows.
create index if not exists saved_signs_folder_id_idx on public.saved_signs(folder_id);
