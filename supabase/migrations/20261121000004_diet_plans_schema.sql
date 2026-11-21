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
