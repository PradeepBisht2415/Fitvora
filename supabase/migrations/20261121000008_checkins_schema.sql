-- Migration: Premium Weekly Structured Check-In Schema
-- File: supabase/migrations/20261121000008_checkins_schema.sql

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start_date date not null,
  adherence_rating integer not null check (adherence_rating between 1 and 5),
  energy_level integer not null check (energy_level between 1 and 5),
  appetite_notes text,
  challenges_text text,
  current_weight_kg numeric(5,2),
  admin_feedback text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint unique_user_week unique (user_id, week_start_date)
);

create index if not exists idx_check_ins_user on public.check_ins (user_id, week_start_date desc);
create index if not exists idx_check_ins_status on public.check_ins (status, submitted_at desc);

alter table public.check_ins enable row level security;

-- Check-in policies
create policy "Users can view their own check-ins"
  on public.check_ins for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own check-ins"
  on public.check_ins for insert
  with check (auth.uid() = user_id);

create policy "Admins can update check-ins"
  on public.check_ins for update
  using (public.is_admin() or auth.uid() = user_id)
  with check (public.is_admin() or auth.uid() = user_id);
