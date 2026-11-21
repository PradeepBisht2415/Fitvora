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
