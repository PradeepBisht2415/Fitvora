-- Migration: Fix User Deletion Cascade on Child Tables
-- File: supabase/migrations/20261121000010_cascade_user_deletes.sql
-- Description: Ensures deleting a user from auth.users (or public.profiles) 
-- cascades cleanly through all dependent tables without violating foreign key constraints.

-- 1. Support messages: cascade delete if sender profile is removed
ALTER TABLE public.support_messages 
  DROP CONSTRAINT IF EXISTS support_messages_sender_id_fkey;

ALTER TABLE public.support_messages 
  ADD CONSTRAINT support_messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Diet plans: allow cascade or set null if author/creator profile is deleted
ALTER TABLE public.diet_plans 
  DROP CONSTRAINT IF EXISTS diet_plans_created_by_fkey;

ALTER TABLE public.diet_plans 
  ADD CONSTRAINT diet_plans_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Assessment reviews: allow cascade if reviewer profile is removed
ALTER TABLE public.assessment_reviews 
  DROP CONSTRAINT IF EXISTS assessment_reviews_reviewer_id_fkey;

ALTER TABLE public.assessment_reviews 
  ADD CONSTRAINT assessment_reviews_reviewer_id_fkey 
  FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
