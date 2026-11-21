-- Migration: Progress Tracking (Weight Entries)
-- File: supabase/migrations/20261121000005_progress_schema.sql

create table if not exists public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg between 30 and 300),
  recorded_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  constraint unique_user_recorded_date unique (user_id, recorded_at)
);

create index if not exists idx_weight_entries_user_date on public.weight_entries (user_id, recorded_at desc);

alter table public.weight_entries enable row level security;

-- Members can manage their own weight entries
create policy "Users can view their own weight entries"
  on public.weight_entries for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own weight entries"
  on public.weight_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weight entries"
  on public.weight_entries for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can delete their own weight entries"
  on public.weight_entries for delete
  using (auth.uid() = user_id or public.is_admin());
