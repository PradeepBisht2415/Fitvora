-- Migration: Private Progress Photos Storage & Schema
-- File: supabase/migrations/20261121000006_photos_schema.sql

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  captured_at date not null default current_date,
  consent_version text not null default 'v1.0',
  notes text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_progress_photos_user on public.progress_photos (user_id, captured_at desc);

alter table public.progress_photos enable row level security;

-- Members can manage their own non-deleted photos
create policy "Users can view their own progress photos"
  on public.progress_photos for select
  using ((auth.uid() = user_id and deleted_at is null) or public.is_admin());

create policy "Users can insert their own progress photos"
  on public.progress_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress photos"
  on public.progress_photos for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can delete their own progress photos"
  on public.progress_photos for delete
  using (auth.uid() = user_id or public.is_admin());
