import 'server-only';
import Razorpay from 'razorpay';
import type { PlanTier } from '@/types/billing.types';

// Pre-defined or dynamic Razorpay Plan IDs for recurring subscriptions
export const RAZORPAY_PLAN_MAP: Record<PlanTier, { name: string; amountPaise: number; defaultPlanId: string }> = {
  normal: {
    name: 'Normal Plan (₹499/mo)',
    amountPaise: 49900,
    defaultPlanId: process.env.RAZORPAY_PLAN_ID_NORMAL || 'plan_fitvora_normal_499',
  },
  premium: {
    name: 'Premium Plan (₹999/mo)',
    amountPaise: 99900,
    defaultPlanId: process.env.RAZORPAY_PLAN_ID_PREMIUM || 'plan_fitvora_premium_999',
  },
};

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Provide a mock/stub instance if keys are not configured yet, preventing crash during build
    razorpayInstance = new Razorpay({
      key_id: 'rzp_test_placeholder',
      key_secret: 'placeholder_secret',
    });
    return razorpayInstance;
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
}

export interface CreateCustomerParams {
  name: string;
  email: string;
  phone?: string | null;
  notes?: Record<string, string>;
}

export async function createOrGetRazorpayCustomer(params: CreateCustomerParams) {
  const client = getRazorpayClient();
  try {
    const customer = await client.customers.create({
      name: params.name,
      email: params.email,
      contact: params.phone || undefined,
      notes: params.notes,
      fail_existing: 0,
    });
    return customer;
  } catch (error) {
    console.error('Failed to create/get Razorpay customer:', error);
    throw error;
  }
}

export interface CreateSubscriptionParams {
  planId: PlanTier;
  customerId?: string;
  totalCount?: number;
  notes?: Record<string, string>;
}

export async function createRazorpaySubscription(params: CreateSubscriptionParams) {
  const client = getRazorpayClient();
  const planConfig = RAZORPAY_PLAN_MAP[params.planId];

  try {
    // Razorpay subscription creation
    const subscription = await client.subscriptions.create({
      plan_id: planConfig.defaultPlanId,
      total_count: params.totalCount ?? 12, // Default 12 billing cycles
      quantity: 1,
      customer_notify: 1,
      notes: {
        plan_tier: params.planId,
        ...params.notes,
      },
    });

    return subscription;
  } catch (error) {
    console.error('Failed to create Razorpay subscription:', error);
    // If the plan does not exist on Razorpay in sandbox yet, fallback with a descriptive error
    throw error;
  }
}

export async function cancelRazorpaySubscription(subscriptionId: string, cancelAtCycleEnd = true) {
  const client = getRazorpayClient();
  try {
    const response = await client.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
    return response;
  } catch (error) {
    console.error(`Failed to cancel Razorpay subscription ${subscriptionId}:`, error);
    throw error;
  }
}

export async function fetchRazorpaySubscription(subscriptionId: string) {
  const client = getRazorpayClient();
  try {
    return await client.subscriptions.fetch(subscriptionId);
  } catch (error) {
    console.error(`Failed to fetch Razorpay subscription ${subscriptionId}:`, error);
    throw error;
  }
}
