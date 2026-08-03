drop table if exists public.access_requests;

create index if not exists workspace_sessions_email_idx
  on public.workspace_sessions (email);
