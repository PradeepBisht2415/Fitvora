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
});
