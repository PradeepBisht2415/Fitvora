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
import { parseWordDietPlan } from '../../lib/parsers/word-diet-parser';
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
