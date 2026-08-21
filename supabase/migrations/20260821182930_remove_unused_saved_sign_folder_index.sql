-- The shared library is loaded as a whole and grouped in the browser, so this
-- index has no query to support and only adds write maintenance overhead.
drop index if exists public.saved_signs_folder_id_idx;
