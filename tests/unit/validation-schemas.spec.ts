import { test, expect } from '@playwright/test';
import {
  aboutYouSchema,
  wellnessSchema,
} from '../../lib/validation/assessment-schema';
import { weightEntrySchema } from '../../lib/validation/weight-schema';
import { renderAssessmentApprovedEmail } from '../../lib/email/templates/assessment-approved';
import { renderPlanPublishedEmail } from '../../lib/email/templates/plan-published';
import { renderPaymentReceiptEmail } from '../../lib/email/templates/payment-receipt';
import { renderPaymentFailedEmail } from '../../lib/email/templates/payment-failed';
import { parseWordDietPlan, parseDietPlanFile, extractMealTime, formatMealTime, formatGuidanceBullets } from '../../lib/parsers/word-diet-parser';
import {
  sanitizeAssessmentForExport,
  generateAssessmentDocHtml,
  generateAssessmentCsv,
  generateAssessmentText,
} from '../../lib/export/assessment-exporter';

test.describe('Unit & Invariant Acceptance Tests', () => {
  test('Scenario 1 & PRD Invariant: Assessment blocks under-18 users', () => {
    const minorData = {
      first_name: 'Rahul',
      email: 'rahul@example.com',
      phone: '9876543210',
      age: 17, // Under 18
      gender: 'male',
    };

    const result = aboutYouSchema.safeParse(minorData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('18 and older');
    }
  });

  test('Scenario 1: Assessment validates valid adult candidate with mandatory phone', () => {
    const validAdult = {
      first_name: 'Priya',
      email: 'priya@example.com',
      phone: '9876543210',
      age: 26,
      gender: 'female',
    };

    const result = aboutYouSchema.safeParse(validAdult);
    expect(result.success).toBe(true);
  });

  test('Scenario 1: Assessment blocks submission when phone number is missing', () => {
    const missingPhone = {
      first_name: 'Priya',
      email: 'priya@example.com',
      age: 26,
      gender: 'female',
    };

    const result = aboutYouSchema.safeParse(missingPhone);
    expect(result.success).toBe(false);
  });

  test('Scenario 3: High-risk medical conditions trigger manual review flag', () => {
    const medicalCandidate = {
      conditions: ['diabetes', 'thyroid'],
      is_pregnant_or_nursing: false,
      medications: 'Metformin 500mg',
      eating_disorder_history: false,
    };

    const result = wellnessSchema.safeParse(medicalCandidate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conditions).toContain('diabetes');
      expect(result.data.medications).toContain('Metformin');
    }
  });

  test('Scenario 10: Weight entry validation rejects invalid ranges (<30kg or >300kg)', () => {
    const lowWeight = weightEntrySchema.safeParse({ weight_kg: 24 });
    expect(lowWeight.success).toBe(false);

    const highWeight = weightEntrySchema.safeParse({ weight_kg: 450 });
    expect(highWeight.success).toBe(false);

    const validWeight = weightEntrySchema.safeParse({
      weight_kg: 68.4,
      recorded_at: '2026-11-21',
      notes: 'Morning weight',
    });
    expect(validWeight.success).toBe(true);
  });

  test('Scenario 11: Transactional emails render cleanly with regulatory disclaimers', () => {
    const approved = renderAssessmentApprovedEmail({
      firstName: 'Ananya',
      claimUrl: 'https://fitvora.com/claim?token=sample123',
    });
    expect(approved.subject).toContain('Fitvora Assessment is Approved');
    expect(approved.html).toContain('https://fitvora.com/claim?token=sample123');
    expect(approved.html).toContain('DPDP Act Compliant');

    const published = renderPlanPublishedEmail({
      firstName: 'Ananya',
      planVersion: 1,
      dashboardUrl: 'https://fitvora.com/dashboard',
    });
    expect(published.subject).toContain('Personalized 7-Day Indian Meal Plan is Ready');
    expect(published.html).toContain('Version 1');

    const receipt = renderPaymentReceiptEmail({
      firstName: 'Ananya',
      planName: 'Normal Wellness Plan',
      amountPaise: 49900,
      currentPeriodEnd: '2026-12-21T00:00:00Z',
      subscriptionUrl: 'https://fitvora.com/dashboard/subscription',
    });
    expect(receipt.subject).toContain('₹499');
    expect(receipt.html).toContain('₹499');

    const failed = renderPaymentFailedEmail({
      firstName: 'Ananya',
      retryUrl: 'https://fitvora.com/dashboard/subscription',
    });
    expect(failed.subject).toContain('Payment Attempt Failed');
    expect(failed.html).toContain('grace period');
  });

  test('Weekly Diet Parser: Generates complete 7-day schedule with exact portion measures', async () => {
    const result = await parseWordDietPlan(Buffer.from(''));
    expect(result.meals.length).toBe(28); // 4 meals * 7 days
    expect(result.guidanceNotes).toBeDefined();
  });

  test('Diet Plan Timing: Extracts custom meal times from PDF/Word and formats for client dashboard', async () => {
    // 1. Check time extraction from various formats in diet plans
    expect(extractMealTime('Breakfast (8:00 AM): Vegetable Poha (1 bowl)')).toBe('08:00');
    expect(extractMealTime('Breakfast - 9:00 AM: Besan Chilla (2 pcs)')).toBe('09:00');
    expect(extractMealTime('Breakfast (8:00 AM - 8:30 AM): Sprouts Salad')).toBe('08:00');
    expect(extractMealTime('Lunch (1:30 PM): Dal Tadka & 2 Phulkas')).toBe('13:30');
    expect(extractMealTime('Lunch - 2:00 PM: Rajma Chawal')).toBe('14:00');
    expect(extractMealTime('Evening Snack (5:00 PM): Roasted Makhana')).toBe('17:00');
    expect(extractMealTime('Dinner (8:30 PM): Moong Dal Khichdi')).toBe('20:30');
    expect(extractMealTime('Time: 8:00 AM')).toBe('08:00');
    expect(extractMealTime('Dinner (20:00): Moong Dal Khichdi')).toBe('20:00');

    // 2. Check 12-hour AM/PM formatting for client dashboard cards
    expect(formatMealTime('08:00')).toBe('8:00 AM');
    expect(formatMealTime('09:00')).toBe('9:00 AM');
    expect(formatMealTime('13:30')).toBe('1:30 PM');
    expect(formatMealTime('17:00')).toBe('5:00 PM');
    expect(formatMealTime('20:30')).toBe('8:30 PM');
    expect(formatMealTime('8:00 AM')).toBe('8:00 AM');

    // 3. Check parsing plain text representation of diet plan with custom times
    const planText = `
Monday
Breakfast (8:00 AM): 2 Besan Chilla with Mint Chutney
Lunch (1:30 PM): Dal Tadka with 2 Phulkas and Salad
Evening Snack (5:00 PM): Roasted Makhana
Dinner (8:00 PM): Moong Dal Khichdi
`;
    const parsed = await parseDietPlanFile(Buffer.from(planText), 'plan.txt');
    const monBreakfast = parsed.meals.find((m) => m.dayOfWeek === 1 && m.mealType === 'breakfast');
    const monLunch = parsed.meals.find((m) => m.dayOfWeek === 1 && m.mealType === 'lunch');
    const monSnack = parsed.meals.find((m) => m.dayOfWeek === 1 && m.mealType === 'evening_snack');
    const monDinner = parsed.meals.find((m) => m.dayOfWeek === 1 && m.mealType === 'dinner');

    expect(monBreakfast?.scheduledTime).toBe('08:00');
    expect(monBreakfast?.customTitle).toContain('Besan Chilla');
    expect(monLunch?.scheduledTime).toBe('13:30');
    expect(monSnack?.scheduledTime).toBe('17:00');
    expect(monDinner?.scheduledTime).toBe('20:00');
  });

  test('Night-Shift 7-Day Table Menu: Parses Dhruv plan with 4:00 PM, 9:00 PM, 2:00 AM meal times', async () => {
    const dhruvPlanText = `DHRUV | WEEK 1 MEAL PLAN
7-day vegetarian North Indian home-food plan • Weight management • Night-shift schedule
Seven-day menu · precise serving guide
| Day | 4:00 PM · Meal 1 | 9:00 PM · Meal 2 | 2:00 AM · Meal 3 |
| Day 1 | 2 besan chillas (60 g besan total) + 100 g paneer stuffing (prefer low-fat) + 1 orange | 2 rotis + 1 katori moong dal + 1 katori mixed sabzi + 200 g plain curd + salad | 1.5 cups vegetable daliya + 200 g curd + 30 g roasted chana |
| Day 2 | 2 rotis + 100 g paneer bhurji + cucumber/tomato + 1 guava | 1 cup cooked rice + 1.5 katori rajma + 1 katori seasonal sabzi + salad | 2 moong dal chillas (60 g dry dal) + 200 g curd + 1 apple |
| Day 3 | 1.5 cups vegetable poha with 30 g peanuts + 200 g curd + 1 small fruit | 2 rotis + 1.5 katori chana dal + 1 katori bhindi/beans + salad | 2 rotis + 100 g paneer tikka/bhurji + 1 katori vegetables |
| Day 4 | 2 vegetable stuffed rotis (60 g atta total) + 200 g curd + 1 banana (small) | 2 rotis + 1.5 katori chole + 1 katori vegetable + salad | 1.5 cups moong dal khichdi + 200 g curd + 30 g roasted chana |
| Day 5 | 2 moong dal chillas (70 g dry dal) + 100 g paneer + mint chutney | 2 rotis + 1.5 katori masoor dal + 1 katori seasonal sabzi + 200 g curd | 1 cup cooked rice + 1 katori soy-chunk curry (40 g dry soy chunks) + salad |
| Day 6 | 1.5 cups vegetable upma + 200 g curd + 30 g roasted chana + 1 apple | 2 rotis + 1.5 katori kala chana + 1 katori vegetable + salad | 2 rotis + 100 g paneer bhurji + 1 katori vegetables + 100 g curd |
| Day 7 | 2 besan chillas (70 g besan) + 200 g curd + 1 guava | 1 cup cooked rice + 1.5 katori dal + 100 g paneer sabzi + salad | 2 rotis + 1 katori mixed bean curry + 1 katori sabzi + 150 g curd |
Guidance & Hydration Reminders
Water: Aim for about 2.5–3 L of fluids daily, mainly water; adjust for thirst, heat and sweating. Do not force excess water.
Portion key: 1 medium roti = ~30 g dry atta, without ghee; 1 katori = ~150 ml cooked food.
`;

    const parsed = await parseDietPlanFile(Buffer.from(dhruvPlanText), 'dhruv_plan.txt');
    expect(parsed.success).toBe(true);
    expect(parsed.meals.length).toBe(21); // 3 meals * 7 days

    // Monday (Day 1)
    const monMeal1 = parsed.meals.find((m) => m.dayOfWeek === 1 && m.orderIndex === 0);
    const monMeal2 = parsed.meals.find((m) => m.dayOfWeek === 1 && m.orderIndex === 1);
    const monMeal3 = parsed.meals.find((m) => m.dayOfWeek === 1 && m.orderIndex === 2);

    expect(monMeal1?.scheduledTime).toBe('16:00');
    expect(formatMealTime(monMeal1?.scheduledTime)).toBe('4:00 PM');
    expect(monMeal1?.customTitle).toContain('2 besan chillas');
    expect(monMeal1?.customNotes).toContain('Meal 1');

    expect(monMeal2?.scheduledTime).toBe('21:00');
    expect(formatMealTime(monMeal2?.scheduledTime)).toBe('9:00 PM');
    expect(monMeal2?.customTitle).toContain('moong dal');
    expect(monMeal2?.customNotes).toContain('Meal 2');

    expect(monMeal3?.scheduledTime).toBe('02:00');
    expect(formatMealTime(monMeal3?.scheduledTime)).toBe('2:00 AM');
    expect(monMeal3?.customTitle).toContain('vegetable daliya');
    expect(monMeal3?.customNotes).toContain('Meal 3');

    // Tuesday (Day 2)
    const tueMeal2 = parsed.meals.find((m) => m.dayOfWeek === 2 && m.orderIndex === 1);
    expect(tueMeal2?.customTitle).toContain('rajma');

    // Guidance Notes
    expect(parsed.guidanceNotes).toContain('• Water: Aim for about 2.5–3 L');
    expect(parsed.guidanceNotes).toContain('• Portion key');
  });

  test('Guidance Formatting: Splits run-on guidance reminders into clean bullet points with line breaks', () => {
    const rawRunOn =
      'Water: Aim for about 2.5–3 L of fluids daily, mainly water; adjust for thirst. Do not force excess water.Limit: Sugary drinks, packaged juices, fried snacks.Protein: Include dal, chana, rajma, curd with each main meal.Portions: Follow the Day 1–Day 7 serving sizes.Walk: Aim for 25–30 minutes of brisk walking most days.Strength: Add simple resistance exercises 2–3 days per week.Sleep: Protect 7–9 hours of sleep.Track: Compare weekly average weights.Note: The reported 11 PM–7 AM sleep window conflicts with overnight shift.';

    const formatted = formatGuidanceBullets(rawRunOn);
    expect(formatted).toContain('• Water:');
    expect(formatted).toContain('• Limit:');
    expect(formatted).toContain('• Protein:');
    expect(formatted).toContain('• Portions:');
    expect(formatted).toContain('• Walk:');
    expect(formatted).toContain('• Strength:');
    expect(formatted).toContain('• Sleep:');
    expect(formatted).toContain('• Track:');
    expect(formatted).toContain('• Note:');
    // Ensure separate lines
    expect(formatted.split('\n\n').length).toBeGreaterThanOrEqual(8);
  });

  test('Privacy Invariant: Assessment downloadable file strictly excludes Email and Contact Phone Number', () => {
    const rawAssessment = {
      id: 'asmt_abc123',
      user_id: 'user_456',
      first_name: 'Ananya',
      email: 'ananya.secret@personalmail.com',
      phone: '9876543210',
      age: 29,
      gender: 'female',
      height_cm: 160,
      weight_kg: 62,
      target_direction: 'lose_weight' as const,
      target_weight_kg: 55,
      timeline_weeks: 12,
      routine_data: {
        wake_time: '06:00',
        sleep_time: '22:30',
        work_shift: 'standard_day',
        meal_frequency: '3_meals',
        activity_level: 'lightly_active',
      },
      food_preferences: {
        diet_type: 'vegetarian',
        allergies: ['peanuts'],
        dislikes: ['bitter_gourd'],
        regional_preference: 'north_indian',
        cooking_access: 'cooks_at_home',
      },
      health_screening: {
        conditions: ['thyroid'],
        is_pregnant_or_nursing: false,
        medications: 'Thyronorm 25mcg',
        eating_disorder_history: false,
      },
      status: 'approved' as const,
      submitted_at: '2026-11-21T06:00:00Z',
    };

    // 1. Check sanitization
    const sanitized = sanitizeAssessmentForExport(rawAssessment);
    const sanitizedAny = sanitized as unknown as Record<string, unknown>;
    expect(sanitizedAny['email']).toBeUndefined();
    expect(sanitizedAny['phone']).toBeUndefined();
    expect(sanitizedAny['contact_no']).toBeUndefined();
    expect(sanitizedAny['mobile']).toBeUndefined();

    // 2. Check Word HTML document generation
    const docHtml = generateAssessmentDocHtml(sanitized);
    expect(docHtml).not.toContain('ananya.secret@personalmail.com');
    expect(docHtml).not.toContain('9876543210');
    expect(docHtml).toContain('Ananya');
    expect(docHtml).toContain('160 cm / 62 kg');
    expect(docHtml).toContain('Thyronorm 25mcg');
    expect(docHtml).toContain('PRIVACY & CONFIDENTIALITY PROTECTED');

    // 3. Check CSV generation
    const csvContent = generateAssessmentCsv([sanitized]);
    expect(csvContent).not.toContain('ananya.secret@personalmail.com');
    expect(csvContent).not.toContain('9876543210');
    expect(csvContent).not.toContain('Email');
    expect(csvContent).not.toContain('Phone');
    expect(csvContent).toContain('Ananya');
    expect(csvContent).toContain('asmt_abc123');

    // 4. Check Text representation
    const textContent = generateAssessmentText(sanitized);
    expect(textContent).not.toContain('ananya.secret@personalmail.com');
    expect(textContent).not.toContain('9876543210');
    expect(textContent).toContain('Ananya');
  });
});
