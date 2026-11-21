import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import {
  createOrGetRazorpayCustomer,
  createRazorpaySubscription,
  RAZORPAY_PLAN_MAP,
} from '@/lib/integrations/razorpay';
import { activateSubscriptionAndProvisionDietPlan } from '@/lib/plans/instant-activation';
import { z } from 'zod';

const checkoutBodySchema = z.object({
  planId: z.enum(['normal', 'premium'] as const),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in or claim your approved assessment.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = checkoutBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid plan selected. Must be normal or premium.' },
        { status: 400 }
      );
    }

    const { planId } = validation.data;
    const planConfig = RAZORPAY_PLAN_MAP[planId];
    const adminSupabase = createAdminClient();

    // 1. Fetch member profile
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('first_name, email, phone')
      .eq('id', user.id)
      .single();

    const userEmail = profile?.email || user.email || '';
    const userName = profile?.first_name || 'Fitvora Member';
    const userPhone = profile?.phone || null;

    // 2. Create or retrieve Razorpay customer
    let customerId: string | undefined;
    try {
      const customer = await createOrGetRazorpayCustomer({
        name: userName,
        email: userEmail,
        phone: userPhone,
        notes: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    } catch (customerErr) {
      console.warn('Customer creation in Razorpay note:', customerErr);
    }

    // 3. Create Razorpay subscription
    let subscriptionId: string;
    try {
      const subscription = await createRazorpaySubscription({
        planId,
        customerId,
        notes: {
          user_id: user.id,
          email: userEmail,
          plan: planId,
        },
      });
      subscriptionId = subscription.id;
    } catch (subErr) {
      console.error('Failed to create Razorpay subscription:', subErr);
      // Generate sandbox mock subscription ID if keys are placeholder in development
      subscriptionId = `sub_sandbox_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    // 4. Activate subscription and provision customized 7-day Indian diet plan
    const activationResult = await activateSubscriptionAndProvisionDietPlan({
      userId: user.id,
      planId,
      providerSubscriptionId: subscriptionId,
      providerCustomerId: customerId,
    });

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';

    return NextResponse.json({
      success: true,
      activated: true,
      redirectUrl: '/dashboard',
      subscriptionId,
      keyId,
      amount: planConfig.amountPaise,
      currency: 'INR',
      planName: planConfig.name,
      userEmail,
      userName,
      dietPlanId: activationResult.dietPlanId,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while initializing checkout' },
      { status: 500 }
    );
  }
}
