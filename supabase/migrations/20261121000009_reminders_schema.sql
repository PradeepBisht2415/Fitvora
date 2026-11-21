-- Migration: Opt-In Meal Reminders Preferences
-- File: supabase/migrations/20261121000009_reminders_schema.sql

alter table public.profiles
  add column if not exists meal_reminders_enabled boolean not null default false,
  add column if not exists reminder_channel text not null default 'email' check (reminder_channel in ('email', 'sms', 'in_app'));

create index if not exists idx_profiles_reminders on public.profiles (meal_reminders_enabled) where meal_reminders_enabled = true;
