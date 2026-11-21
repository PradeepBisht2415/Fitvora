-- Migration: In-App Support Inbox & Ticketing Schema
-- File: supabase/migrations/20261121000007_support_schema.sql

create table if not exists public.support_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'waiting_member', 'resolved', 'closed')),
  priority text not null default 'normal' check (priority in ('normal', 'premium')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_support_threads_user on public.support_threads (user_id, last_message_at desc);
create index if not exists idx_support_threads_priority on public.support_threads (priority, last_message_at desc);
create index if not exists idx_support_messages_thread on public.support_messages (thread_id, created_at asc);

alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

-- Thread policies
create policy "Users can view their own threads"
  on public.support_threads for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own threads"
  on public.support_threads for insert
  with check (auth.uid() = user_id);

create policy "Admins can update threads"
  on public.support_threads for update
  using (public.is_admin() or auth.uid() = user_id)
  with check (public.is_admin() or auth.uid() = user_id);

-- Message policies
create policy "Users can view messages from their threads"
  on public.support_messages for select
  using (
    exists (
      select 1 from public.support_threads t
      where t.id = support_messages.thread_id
      and (t.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can insert messages to their threads"
  on public.support_messages for insert
  with check (
    auth.uid() = sender_id and (
      exists (
        select 1 from public.support_threads t
        where t.id = support_messages.thread_id
        and (t.user_id = auth.uid() or public.is_admin())
      )
    )
  );
