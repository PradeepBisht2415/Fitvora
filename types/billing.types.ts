export type PlanTier = 'normal' | 'premium';

export interface PlanCatalogItem {
  id: PlanTier;
  name: string;
  price_paise: number;
  currency: string;
  billing_interval: string;
  features: string[];
  is_active: boolean;
}

export type SubscriptionStatus =
  | 'created'
  | 'authenticated'
  | 'active'
  | 'pending'
  | 'halted'
  | 'cancelled'
  | 'completed'
  | 'expired';

export interface CheckoutSessionRequest {
  planId: PlanTier;
}

export interface CheckoutSessionResponse {
  subscriptionId: string;
  keyId: string;
  amount: number;
  currency: string;
  planName: string;
  userEmail: string;
  userName: string;
}

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    subscription?: {
      entity: {
        id: string;
        plan_id: string;
        customer_id: string;
        status: string;
        current_start: number | null;
        current_end: number | null;
        ended_at: number | null;
        quantity: number;
        charge_at: number | null;
        start_at: number | null;
        end_at: number | null;
        auth_attempts: number;
        total_count: number;
        paid_count: number;
        customer_notify: boolean;
        created_at: number;
        expire_by: number | null;
        short_url: string;
        has_scheduled_changes: boolean;
        change_scheduled_at: number | null;
        source: string;
        notes?: Record<string, string>;
      };
    };
    payment?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id?: string;
        invoice_id?: string;
        international: boolean;
        method: string;
        amount_refunded: number;
        refund_status: string | null;
        captured: boolean;
        description: string;
        card_id: string | null;
        bank: string | null;
        wallet: string | null;
        vpa: string | null;
        email: string;
        contact: string;
        error_code?: string;
        error_description?: string;
        created_at: number;
      };
    };
  };
  created_at: number;
}
