import { z } from 'zod';

// Step 1: About You
export const aboutYouSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, 'Please enter your first name (at least 2 characters)')
    .max(50, 'First name is too long'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(10, 'Mobile number is required')
    .refine(
      (val) => /^[6-9]\d{9}$/.test(val.replace(/\s+/g, '').replace(/^\+91/, '')),
      'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'
    ),
  age: z.coerce
    .number()
    .int('Age must be a whole number')
    .min(18, 'Fitvora is designed for adults aged 18 and older')
    .max(100, 'Please enter a valid age under 100'),
  gender: z
    .enum(['female', 'male', 'non_binary', 'prefer_not_to_say'])
    .optional(),
});

// Step 2: Body and Goal
export const bodyGoalSchema = z.object({
  height_cm: z.coerce
    .number()
    .min(100, 'Height must be at least 100 cm')
    .max(250, 'Height must be under 250 cm'),
  weight_kg: z.coerce
    .number()
    .min(30, 'Weight must be at least 30 kg')
    .max(300, 'Weight must be under 300 kg'),
  target_direction: z.enum(['lose_weight', 'gain_weight', 'maintain_health']),
  target_weight_kg: z.coerce
    .number()
    .min(30, 'Target weight must be at least 30 kg')
    .max(300, 'Target weight must be under 300 kg')
    .optional()
    .nullable(),
  timeline_weeks: z.coerce
    .number()
    .int()
    .min(4, 'Minimum suggested timeline is 4 weeks')
    .max(52, 'Maximum timeline is 52 weeks')
    .optional()
    .nullable(),
});

// Step 3: Daily Routine & Schedule
export const routineSchema = z.object({
  wake_time: z.string().min(1, 'Please select your usual wake time'),
  sleep_time: z.string().min(1, 'Please select your usual sleep time'),
  work_shift: z.enum([
    'standard_day',
    'overnight_shift',
    'rotating',
    'flexible',
  ]),
  meal_frequency: z.enum([
    '2_meals',
    '3_meals',
    '4_meals',
    '5_plus_meals',
  ]),
  activity_level: z.enum([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
  ]),
});

// Step 4: Food & Regional Preferences
export const preferencesSchema = z.object({
  diet_type: z.enum(['vegetarian', 'eggetarian', 'non_vegetarian']),
  allergies: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
  regional_preference: z.enum([
    'north_indian',
    'south_indian',
    'maharashtrian',
    'gujarati',
    'bengali',
    'pan_indian',
    'other',
  ]),
  cooking_access: z.enum([
    'cooks_at_home',
    'family_cooks',
    'cook_or_maid',
    'tiffin_or_mess',
  ]),
});

// Step 5: Wellness & Safety Screening
export const wellnessSchema = z.object({
  conditions: z.array(z.string()).default([]),
  is_pregnant_or_nursing: z.boolean().default(false),
  medications: z.string().max(500).optional().nullable(),
  eating_disorder_history: z.boolean().default(false),
});

// Step 6: Review & Consent
export const consentSchema = z.object({
  health_consent_granted: z
    .boolean()
    .refine((val) => val === true, {
      message:
        'Consent to process health and dietary preferences is required for meal planning',
    }),
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
  marketing_opt_in: z.boolean().default(false),
});

// Master Submission Schema combining all steps
export const assessmentSubmissionSchema = z.object({
  about: aboutYouSchema,
  body: bodyGoalSchema,
  routine: routineSchema,
  preferences: preferencesSchema,
  wellness: wellnessSchema,
  consent: consentSchema,
});

export type AboutYouData = z.infer<typeof aboutYouSchema>;
export type BodyGoalData = z.infer<typeof bodyGoalSchema>;
export type RoutineData = z.infer<typeof routineSchema>;
export type PreferencesData = z.infer<typeof preferencesSchema>;
export type WellnessData = z.infer<typeof wellnessSchema>;
export type ConsentData = z.infer<typeof consentSchema>;
export type AssessmentSubmissionData = z.infer<
  typeof assessmentSubmissionSchema
>;

export const DEFAULT_ASSESSMENT_DATA: AssessmentSubmissionData = {
  about: {
    first_name: '',
    email: '',
    phone: '',
    age: 25,
    gender: 'prefer_not_to_say',
  },
  body: {
    height_cm: 165,
    weight_kg: 68,
    target_direction: 'lose_weight',
    target_weight_kg: 62,
    timeline_weeks: 12,
  },
  routine: {
    wake_time: '07:00',
    sleep_time: '23:00',
    work_shift: 'standard_day',
    meal_frequency: '3_meals',
    activity_level: 'sedentary',
  },
  preferences: {
    diet_type: 'vegetarian',
    allergies: [],
    dislikes: [],
    regional_preference: 'pan_indian',
    cooking_access: 'cooks_at_home',
  },
  wellness: {
    conditions: [],
    is_pregnant_or_nursing: false,
    medications: '',
    eating_disorder_history: false,
  },
  consent: {
    health_consent_granted: true,
    terms_accepted: true,
    marketing_opt_in: false,
  },
};
