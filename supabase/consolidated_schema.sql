-- ==========================================
-- FILE: 20261121000001_core_schema.sql
-- ==========================================
-- Fitvora Core Database Schema Migration
-- Migration: 20261121000001_core_schema.sql
-- Description: Base tables, enums, triggers, and Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('visitor', 'member', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('invited', 'registered', 'active', 'paused', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  role user_role NOT NULL DEFAULT 'visitor',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Memberships table
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lifecycle_status membership_status NOT NULL DEFAULT 'invited',
  joined_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_memberships_user UNIQUE (user_id)
);

-- 3. Consent records (DPDP compliance)
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assessment_id UUID,
  purpose TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  ip_hash TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- 4. Audit logs (Administrative & sensitive activity tracking)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_consent_records_user ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_assessment ON public.consent_records(assessment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- Updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_memberships_updated_at ON public.memberships;
CREATE TRIGGER trg_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile trigger on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Memberships Policies
DROP POLICY IF EXISTS "Users can view own membership" ON public.memberships;
CREATE POLICY "Users can view own membership" ON public.memberships
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;
CREATE POLICY "Admins can manage memberships" ON public.memberships
  FOR ALL USING (public.is_admin());

-- Consent Records Policies
DROP POLICY IF EXISTS "Users can view own consents" ON public.consent_records;
CREATE POLICY "Users can view own consents" ON public.consent_records
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated inserts for consents" ON public.consent_records;
CREATE POLICY "Allow authenticated inserts for consents" ON public.consent_records
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

-- Audit Logs Policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);


-- ==========================================
-- FILE: 20261121000002_assessment_schema.sql
-- ==========================================
-- Fitvora Assessment Database Schema Migration
-- Migration: 20261121000002_assessment_schema.sql

-- 1. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  draft_token_hash TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age INTEGER NOT NULL CHECK (age >= 18),
  gender TEXT,
  height_cm NUMERIC(5,2) NOT NULL CHECK (height_cm BETWEEN 100 AND 250),
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg BETWEEN 30 AND 300),
  target_direction TEXT NOT NULL CHECK (target_direction IN ('lose_weight', 'gain_weight', 'maintain_health')),
  target_weight_kg NUMERIC(5,2),
  timeline_weeks INTEGER,
  routine_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  food_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  health_screening JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_version TEXT NOT NULL,
  health_consent_granted BOOLEAN NOT NULL CHECK (health_consent_granted = true),
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'needs_info', 'not_suitable')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Assessment Reviews Table
CREATE TABLE IF NOT EXISTS public.assessment_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'needs_info', 'not_suitable')),
  safety_flags TEXT[] DEFAULT '{}',
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_token_hash ON public.assessments(draft_token_hash);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_email ON public.assessments(email);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_reviews_assessment ON public.assessment_reviews(assessment_id);

-- Updated_at Trigger
DROP TRIGGER IF EXISTS trg_assessments_updated_at ON public.assessments;
CREATE TRIGGER trg_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_reviews ENABLE ROW LEVEL SECURITY;

-- Assessments Policies:
-- Anonymous/public users CANNOT directly select from assessments (only via secure RPC with token hash or server-side admin client)
-- Users can view their own assessment once linked to user_id
DROP POLICY IF EXISTS "Users can view own linked assessment" ON public.assessments;
CREATE POLICY "Users can view own linked assessment" ON public.assessments
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Allow insert by public service role or via API endpoint
DROP POLICY IF EXISTS "Allow service role inserts for assessments" ON public.assessments;
CREATE POLICY "Allow service role inserts for assessments" ON public.assessments
  FOR INSERT WITH CHECK (true);

-- Admins can update assessments (e.g. changing status)
DROP POLICY IF EXISTS "Admins can update assessments" ON public.assessments;
CREATE POLICY "Admins can update assessments" ON public.assessments
  FOR UPDATE USING (public.is_admin());

-- Assessment Reviews Policies
DROP POLICY IF EXISTS "Admins can manage assessment reviews" ON public.assessment_reviews;
CREATE POLICY "Admins can manage assessment reviews" ON public.assessment_reviews
  FOR ALL USING (public.is_admin());

-- Secure RPC to get limited public assessment status by opaque token hash
CREATE OR REPLACE FUNCTION public.get_assessment_status_by_token(p_token_hash TEXT)
RETURNS TABLE (
  status TEXT,
  submitted_at TIMESTAMPTZ,
  first_name TEXT,
  target_direction TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.status, a.submitted_at, a.first_name, a.target_direction
  FROM public.assessments a
  WHERE a.draft_token_hash = p_token_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- FILE: 20261121000003_subscriptions_schema.sql
-- ==========================================
-- ==============================================================================
-- Fitvora Migration: 20261121000003_subscriptions_schema.sql
-- Subscriptions, Plans Catalog, Payment Events, and Row-Level Security
-- ==============================================================================

-- 1. Plans Catalog
CREATE TABLE IF NOT EXISTS public.plans_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_paise INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    billing_interval TEXT NOT NULL DEFAULT 'month',
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial Normal and Premium plans
INSERT INTO public.plans_catalog (id, name, price_paise, currency, billing_interval, features, is_active)
VALUES
    (
        'normal',
        'Normal Plan',
        49900,
        'INR',
        'month',
        '[
            "Customized 7-day Indian home food plan",
            "Exact portions in household measures (katori, roti, grams)",
            "Smart meal swap alternatives for every meal",
            "Personalized hydration and routine guidance",
            "Monthly plan renewal & dietary adjustments"
        ]'::jsonb,
        true
    ),
    (
        'premium',
        'Premium Plan',
        99900,
        'INR',
        'month',
        '[
            "Identical high standard of customized diet planning",
            "Priority queue for diet plan delivery and revisions (within 24 hours)",
            "Weekly structured check-in form and adherence review",
            "Direct priority messaging for quick questions",
            "Monthly plan renewal & progress adjustments"
        ]'::jsonb,
        true
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_paise = EXCLUDED.price_paise,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- 2. Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.plans_catalog(id),
    provider_customer_id TEXT,
    provider_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub_id ON public.subscriptions(provider_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 3. Payment Events (Idempotency and Audit)
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    processed_status TEXT NOT NULL CHECK (processed_status IN ('processed', 'ignored', 'failed')),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_provider_id ON public.payment_events(provider_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_type ON public.payment_events(event_type);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.plans_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Plans Catalog: Anyone can read active plans
CREATE POLICY "Public plans read"
    ON public.plans_catalog FOR SELECT
    USING (is_active = true OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Subscriptions: Members read their own subscriptions; Admins read all
CREATE POLICY "Members view their own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (
        auth.uid() = user_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admin update subscriptions"
    ON public.subscriptions FOR UPDATE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Payment Events: Restricted to Service Role and Admins
CREATE POLICY "Admin view payment events"
    ON public.payment_events FOR SELECT
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ==========================================
-- FILE: 20261121000004_diet_plans_schema.sql
-- ==========================================
-- ==============================================================================
-- Fitvora Migration: 20261121000004_diet_plans_schema.sql
-- Indian Meal Library, 7-Day Personalized Diet Plans, and Scheduled Meals
-- ==============================================================================

-- 1. Meal Templates (Reusable Indian Home-Food Library)
CREATE TABLE IF NOT EXISTS public.meal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner', 'post_dinner')),
    diet_category TEXT NOT NULL CHECK (diet_category IN ('vegetarian', 'eggetarian', 'non_vegetarian')),
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    default_portion TEXT NOT NULL,
    preparation_notes TEXT,
    regional_tags TEXT[] DEFAULT '{}',
    allergen_tags TEXT[] DEFAULT '{}',
    approx_calories INTEGER,
    approx_protein_g NUMERIC(4,1),
    alternatives JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_templates_type ON public.meal_templates(meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_templates_diet ON public.meal_templates(diet_category);
CREATE INDEX IF NOT EXISTS idx_meal_templates_active ON public.meal_templates(is_active);

-- 2. Diet Plans (Weekly Plan Entity with Versioning)
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    effective_start_date DATE NOT NULL,
    effective_end_date DATE,
    guidance_notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON public.diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_status ON public.diet_plans(status);

-- 3. Diet Plan Meals (Scheduled meals across 7 days)
CREATE TABLE IF NOT EXISTS public.diet_plan_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diet_plan_id UUID NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, ..., 6=Sat
    meal_type TEXT NOT NULL,
    scheduled_time TEXT NOT NULL, -- e.g. "08:30", "13:00"
    meal_template_id UUID REFERENCES public.meal_templates(id) ON DELETE SET NULL,
    custom_title TEXT,
    custom_portion TEXT NOT NULL,
    custom_notes TEXT,
    custom_alternatives JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diet_plan_meals_plan ON public.diet_plan_meals(diet_plan_id);
CREATE INDEX IF NOT EXISTS idx_diet_plan_meals_day ON public.diet_plan_meals(day_of_week);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plan_meals ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Meal Templates: Anyone (visitor or member) can read active templates
CREATE POLICY "Public read active meal templates"
    ON public.meal_templates FOR SELECT
    USING (is_active = true OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin manage meal templates"
    ON public.meal_templates FOR ALL
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Diet Plans: Members can only read their own PUBLISHED plans. Admins can read/manage all.
CREATE POLICY "Members view their published diet plans"
    ON public.diet_plans FOR SELECT
    USING (
        (auth.uid() = user_id AND status = 'published')
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admin manage diet plans"
    ON public.diet_plans FOR ALL
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Diet Plan Meals: Members read meals for published plans belonging to them
CREATE POLICY "Members view published diet plan meals"
    ON public.diet_plan_meals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.diet_plans
            WHERE diet_plans.id = diet_plan_meals.diet_plan_id
              AND (
                  (diet_plans.user_id = auth.uid() AND diet_plans.status = 'published')
                  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
              )
        )
    );

CREATE POLICY "Admin manage diet plan meals"
    ON public.diet_plan_meals FOR ALL
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ==========================================
-- FILE: 20261121000005_progress_schema.sql
-- ==========================================
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


-- ==========================================
-- FILE: 20261121000006_photos_schema.sql
-- ==========================================
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


-- ==========================================
-- FILE: 20261121000007_support_schema.sql
-- ==========================================
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


-- ==========================================
-- FILE: 20261121000008_checkins_schema.sql
-- ==========================================
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


-- ==========================================
-- FILE: 20261121000009_reminders_schema.sql
-- ==========================================
-- Migration: Opt-In Meal Reminders Preferences
-- File: supabase/migrations/20261121000009_reminders_schema.sql

alter table public.profiles
  add column if not exists meal_reminders_enabled boolean not null default false,
  add column if not exists reminder_channel text not null default 'email' check (reminder_channel in ('email', 'sms', 'in_app'));

create index if not exists idx_profiles_reminders on public.profiles (meal_reminders_enabled) where meal_reminders_enabled = true;


-- ==========================================
-- FILE: seed/meal_templates.sql
-- ==========================================
-- ==============================================================================
-- Fitvora Seed: 20261121000004_meal_templates_seed.sql
-- Authentic Indian Home-Food Meal Templates with Household Measures
-- ==============================================================================

INSERT INTO public.meal_templates (
    title,
    meal_type,
    diet_category,
    ingredients,
    default_portion,
    preparation_notes,
    regional_tags,
    allergen_tags,
    approx_calories,
    approx_protein_g,
    alternatives
) VALUES
-- BREAKFAST
(
    'Vegetable Poha with Roasted Peanuts',
    'breakfast',
    'vegetarian',
    '[{"name": "Flattened rice (poha)", "quantity": "60", "unit": "g"}, {"name": "Onion & green peas", "quantity": "50", "unit": "g"}, {"name": "Roasted peanuts", "quantity": "15", "unit": "g"}, {"name": "Mustard seeds & curry leaves", "quantity": "1", "unit": "tsp"}, {"name": "Lemon juice", "quantity": "1", "unit": "tsp"}]'::jsonb,
    '1 medium bowl (approx. 200g)',
    'Lightly tempered with mustard seeds and curry leaves. Squeeze fresh lemon before eating.',
    ARRAY['maharashtrian', 'pan_indian'],
    ARRAY['peanuts'],
    310,
    7.5,
    '[{"title": "Vegetable Upma with 1 boiled egg or paneer cubes", "portion": "1 medium bowl"}, {"title": "Oats Cheela with mint chutney", "portion": "2 small cheelas"}]'::jsonb
),
(
    'Besan Chilla with Mint Coriander Chutney',
    'breakfast',
    'vegetarian',
    '[{"name": "Gram flour (besan)", "quantity": "70", "unit": "g"}, {"name": "Finely chopped tomatoes & onions", "quantity": "40", "unit": "g"}, {"name": "Coriander & green chillies", "quantity": "1", "unit": "tbsp"}, {"name": "Mint chutney", "quantity": "2", "unit": "tbsp"}]'::jsonb,
    '2 medium chillas + 2 tbsp chutney',
    'Cook on non-stick tawa with 1 tsp cold-pressed mustard or groundnut oil.',
    ARRAY['north_indian'],
    ARRAY['gluten'],
    280,
    14.0,
    '[{"title": "Moong Dal Cheela with paneer stuffing", "portion": "2 medium cheelas"}, {"title": "Sprouted Methi Thepla with curd", "portion": "2 thin theplas + 1/2 katori curd"}]'::jsonb
),
(
    'Steamed Idli with Sambhar and Coconut Chutney',
    'breakfast',
    'vegetarian',
    '[{"name": "Fermented rice & urad dal idlis", "quantity": "3", "unit": "pcs"}, {"name": "Vegetable sambhar (drumstick, pumpkin, tomato)", "quantity": "1", "unit": "medium bowl"}, {"name": "Fresh coconut chutney", "quantity": "1", "unit": "tbsp"}]'::jsonb,
    '3 standard idlis + 1 katori sambhar + 1 tbsp chutney',
    'Fermented batter aids digestion and gut health. Sambhar enriched with toor dal.',
    ARRAY['south_indian'],
    ARRAY['mustard'],
    290,
    9.0,
    '[{"title": "Rava Dosa with vegetable sambhar", "portion": "1 medium dosa"}, {"title": "Poha with curd", "portion": "1 bowl"}]'::jsonb
),
(
    'Paneer Bhurji with 2 Phulkas',
    'breakfast',
    'vegetarian',
    '[{"name": "Fresh homemade paneer", "quantity": "80", "unit": "g"}, {"name": "Whole wheat phulkas (no ghee)", "quantity": "2", "unit": "pcs"}, {"name": "Onion, tomato, bell pepper", "quantity": "60", "unit": "g"}]'::jsonb,
    '1 katori bhurji + 2 standard phulkas',
    'SautÃ© paneer with cumin, turmeric, and fresh vegetables for rich vegetarian morning protein.',
    ARRAY['north_indian'],
    ARRAY['dairy', 'gluten'],
    360,
    18.5,
    '[{"title": "Tofu Bhurji with 2 Phulkas (dairy-free)", "portion": "1 katori + 2 phulkas"}, {"title": "Egg Bhurji with 2 Phulkas", "portion": "2 eggs + 2 phulkas"}]'::jsonb
),
(
    'Boiled Eggs with 2 Multigrain Toasts & Cucumber Slices',
    'breakfast',
    'eggetarian',
    '[{"name": "Boiled eggs", "quantity": "2", "unit": "whole"}, {"name": "Multigrain bread", "quantity": "2", "unit": "slices"}, {"name": "Sliced cucumber & tomato with chaat masala", "quantity": "100", "unit": "g"}]'::jsonb,
    '2 boiled eggs + 2 slices toast + cucumber salad',
    'Season eggs with crushed black pepper and a pinch of roasted jeera.',
    ARRAY['pan_indian'],
    ARRAY['eggs', 'gluten'],
    320,
    19.0,
    '[{"title": "2-Egg Veggie Omelette with 1 roti", "portion": "1 omelette + 1 roti"}, {"title": "Paneer sandwich (whole wheat)", "portion": "1 sandwich"}]'::jsonb
),

-- LUNCH
(
    'Dal Tadka, 2 Whole Wheat Phulkas & Bhindi Sabzi',
    'lunch',
    'vegetarian',
    '[{"name": "Yellow toor dal", "quantity": "1", "unit": "katori (150g)"}, {"name": "Phulkas (whole wheat)", "quantity": "2", "unit": "pcs"}, {"name": "Bhindi (okra) dry sabzi", "quantity": "1", "unit": "katori"}, {"name": "Kachumber salad (cucumber, onion, lemon)", "quantity": "1", "unit": "katori"}]'::jsonb,
    '1 katori dal + 2 phulkas + 1 katori sabzi + fresh salad',
    'Staple everyday Indian home lunch. Balance of complex carbs, protein, and dietary fiber.',
    ARRAY['north_indian', 'central_indian'],
    ARRAY['gluten'],
    390,
    14.5,
    '[{"title": "Moong Dal with 2 Phulkas & Lauki Sabzi", "portion": "1 katori dal + 2 roti + 1 katori sabzi"}, {"title": "Mix Veg Curry with 1 katori brown rice & dal", "portion": "Standard plate"}]'::jsonb
),
(
    'Rajma Masala with Steamed Basmati Rice & Cucumber Raita',
    'lunch',
    'vegetarian',
    '[{"name": "Cooked red kidney beans (rajma)", "quantity": "1.5", "unit": "katoris"}, {"name": "Steamed white or brown rice", "quantity": "1", "unit": "katori (150g)"}, {"name": "Curd raita with cucumber & roasted cumin", "quantity": "1/2", "unit": "katori"}]'::jsonb,
    '1.5 katori rajma + 1 katori rice + 1/2 katori raita',
    'Classic comfort pairing. Rajma provides plant-based iron and sustained glycemic response.',
    ARRAY['north_indian'],
    ARRAY['dairy'],
    420,
    16.0,
    '[{"title": "Chole (Chickpeas) with 2 Phulkas and salad", "portion": "1 katori chole + 2 phulkas"}, {"title": "Black Eyed Peas (Lobia) with Rice", "portion": "1 katori lobia + 1 katori rice"}]'::jsonb
),
(
    'Homestyle Chicken Curry with 2 Phulkas & Kachumber Salad',
    'lunch',
    'non_vegetarian',
    '[{"name": "Skinless chicken curry (onion-tomato gravy)", "quantity": "150", "unit": "g"}, {"name": "Whole wheat phulkas", "quantity": "2", "unit": "pcs"}, {"name": "Kachumber salad with lemon", "quantity": "1", "unit": "katori"}]'::jsonb,
    '3-4 pcs chicken in light curry + 2 phulkas + fresh salad',
    'Cooked without cream or butter; uses whole spices (cinnamon, cloves, cardamom).',
    ARRAY['pan_indian'],
    ARRAY['gluten'],
    440,
    31.0,
    '[{"title": "Fish Curry (Rohu or Pomfret) with 1 katori rice", "portion": "1 bowl curry + 1 katori rice"}, {"title": "Egg Curry with 2 Phulkas", "portion": "2 eggs in curry + 2 phulkas"}]'::jsonb
),
(
    'South Indian Curd Rice with Mild Tadka & Sprouted Moong Salad',
    'lunch',
    'vegetarian',
    '[{"name": "Soft cooked rice with fresh curd", "quantity": "1.5", "unit": "katoris"}, {"name": "Mustard, curry leaf, and ginger tadka", "quantity": "1", "unit": "tsp"}, {"name": "Sprouted moong salad", "quantity": "1/2", "unit": "katori"}]'::jsonb,
    '1.5 katori curd rice + 1/2 katori sprouted moong',
    'Probiotic-rich and cooling for digestion. Excellent for active workdays.',
    ARRAY['south_indian'],
    ARRAY['dairy', 'mustard'],
    350,
    13.0,
    '[{"title": "Lemon Rice with 1 katori dal & salad", "portion": "1 bowl rice + 1 katori dal"}, {"title": "Dahi Poha with pomegranate seeds", "portion": "1 bowl"}]'::jsonb
),

-- SNACKS
(
    'Roasted Chana with Spiced Chaas (Buttermilk)',
    'evening_snack',
    'vegetarian',
    '[{"name": "Dry roasted chana with skin", "quantity": "35", "unit": "g (1 handful)"}, {"name": "Chilled buttermilk with roasted cumin & mint", "quantity": "200", "unit": "ml (1 glass)"}]'::jsonb,
    '1 handful roasted chana + 1 tall glass chaas',
    'Crunchy, satiating evening bridge snack that curbs sweet cravings before dinner.',
    ARRAY['pan_indian'],
    ARRAY['dairy'],
    160,
    8.5,
    '[{"title": "Makhana (Foxnuts) lightly roasted in 1/2 tsp ghee", "portion": "1 big bowl (30g)"}, {"title": "Sprouted Chana Chaat with lemon", "portion": "1/2 katori"}]'::jsonb
),
(
    'Sprouted Moong Chaat with Pomegranate & Lime',
    'evening_snack',
    'vegetarian',
    '[{"name": "Steamed sprouted green moong", "quantity": "1", "unit": "katori (100g)"}, {"name": "Finely chopped cucumber & tomato", "quantity": "40", "unit": "g"}, {"name": "Pomegranate seeds", "quantity": "1", "unit": "tbsp"}, {"name": "Chaat masala & lemon juice", "quantity": "1", "unit": "tsp"}]'::jsonb,
    '1 medium katori (approx. 150g)',
    'High enzyme and micronutrient count. Steam sprouts for 3 minutes for easy digestion.',
    ARRAY['pan_indian'],
    ARRAY[]::text[],
    145,
    8.0,
    '[{"title": "Boiled Chickpea salad with lime", "portion": "1/2 katori"}, {"title": "Cucumber carrot sticks with hummus", "portion": "1 bowl"}]'::jsonb
),

-- DINNER
(
    'Moong Dal Khichdi with 1 Katori Fresh Curd',
    'dinner',
    'vegetarian',
    '[{"name": "Yellow moong dal and rice (1:1 ratio)", "quantity": "1.5", "unit": "katoris"}, {"name": "Desi cow ghee", "quantity": "1/2", "unit": "tsp"}, {"name": "Plain fresh homemade curd", "quantity": "1", "unit": "katori (100g)"}]'::jsonb,
    '1.5 katori warm khichdi + 1 katori curd',
    'Light, restorative, and complete amino acid profile. Perfect for restorative night sleep.',
    ARRAY['pan_indian'],
    ARRAY['dairy'],
    370,
    15.0,
    '[{"title": "Dalia Khichdi (Broken wheat & vegetables) with curd", "portion": "1.5 katoris + 1 katori curd"}, {"title": "Brown Rice Moong Dal Pulao with Raita", "portion": "1.5 katoris"}]'::jsonb
),
(
    'Palak Paneer with 2 Multigrain Phulkas & Beetroot Salad',
    'dinner',
    'vegetarian',
    '[{"name": "Fresh spinach purÃ©e with paneer cubes", "quantity": "1", "unit": "katori (150g)"}, {"name": "Multigrain phulkas (wheat, jowar, ragi)", "quantity": "2", "unit": "pcs"}, {"name": "Sliced beetroot & carrot with lemon", "quantity": "1", "unit": "katori"}]'::jsonb,
    '1 katori palak paneer + 2 multigrain phulkas + salad',
    'Rich in plant iron, folate, and slow-release casein protein.',
    ARRAY['north_indian'],
    ARRAY['dairy', 'gluten'],
    410,
    18.0,
    '[{"title": "Matar Paneer with 2 Phulkas", "portion": "1 katori + 2 phulkas"}, {"title": "Methi Paneer with 2 Jowar rotis", "portion": "1 katori + 2 rotis"}]'::jsonb
),
(
    'Ghar Ki Lauki (Bottle Gourd) Sabzi with 2 Phulkas & Arhar Dal',
    'dinner',
    'vegetarian',
    '[{"name": "Lauki cooked with cumin and tomatoes", "quantity": "1", "unit": "katori"}, {"name": "Light arhar (toor) dal", "quantity": "1", "unit": "katori"}, {"name": "Whole wheat phulkas", "quantity": "2", "unit": "pcs"}]'::jsonb,
    '1 katori lauki + 1 katori dal + 2 phulkas',
    'Gentle on gut and liver before sleep; prevents morning water retention.',
    ARRAY['north_indian', 'central_indian'],
    ARRAY['gluten'],
    340,
    12.5,
    '[{"title": "Tinda or Turai (Ridge Gourd) Sabzi with 2 Phulkas & Dal", "portion": "1 katori sabzi + 1 katori dal + 2 phulkas"}, {"title": "Pumpkin Sabzi with 2 Phulkas & Moong Dal", "portion": "Standard plate"}]'::jsonb
),
(
    'High-Protein Soya Chunk Vegetable Pulao with Mint Raita',
    'dinner',
    'vegetarian',
    '[{"name": "Basmati rice cooked with whole spices", "quantity": "1", "unit": "katori (150g)"}, {"name": "Soya chunks (boiled & sautÃ©ed)", "quantity": "40", "unit": "g dry"}, {"name": "French beans, carrots, peas", "quantity": "50", "unit": "g"}, {"name": "Low-fat curd raita with mint", "quantity": "1", "unit": "katori"}]'::jsonb,
    '1.5 katori soya pulao + 1 katori mint raita',
    'Lean vegetarian protein power plate with high dietary fiber and minimal saturated fat.',
    ARRAY['pan_indian'],
    ARRAY['dairy'],
    395,
    25.0,
    '[{"title": "Paneer & Pea Pulao with Raita", "portion": "1.5 katoris pulao + 1 katori raita"}, {"title": "Egg Pulao (2 eggs) with Kachumber", "portion": "1.5 katoris"}]'::jsonb
)
ON CONFLICT DO NOTHING;

