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
            "Direct founder priority messaging for quick questions",
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
