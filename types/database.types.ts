export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'visitor' | 'member' | 'admin';
export type MembershipStatus =
  | 'invited'
  | 'registered'
  | 'active'
  | 'paused'
  | 'inactive';

export type AssessmentStatus =
  | 'pending_review'
  | 'approved'
  | 'needs_info'
  | 'not_suitable';

export type TargetDirection = 'lose_weight' | 'gain_weight' | 'maintain_health';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string | null;
          email: string;
          phone: string | null;
          timezone: string;
          role: UserRole;
          avatar_url: string | null;
          meal_reminders_enabled: boolean;
          reminder_channel: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string;
          last_name?: string | null;
          email: string;
          phone?: string | null;
          timezone?: string;
          role?: UserRole;
          avatar_url?: string | null;
          meal_reminders_enabled?: boolean;
          reminder_channel?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string | null;
          email?: string;
          phone?: string | null;
          timezone?: string;
          role?: UserRole;
          avatar_url?: string | null;
          meal_reminders_enabled?: boolean;
          reminder_channel?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          lifecycle_status: MembershipStatus;
          joined_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lifecycle_status?: MembershipStatus;
          joined_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lifecycle_status?: MembershipStatus;
          joined_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          user_id: string | null;
          draft_token_hash: string;
          first_name: string;
          email: string;
          phone: string | null;
          age: number;
          gender: string | null;
          height_cm: number;
          weight_kg: number;
          target_direction: TargetDirection;
          target_weight_kg: number | null;
          timeline_weeks: number | null;
          routine_data: Json;
          food_preferences: Json;
          health_screening: Json;
          consent_version: string;
          health_consent_granted: boolean;
          status: AssessmentStatus;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          draft_token_hash: string;
          first_name: string;
          email: string;
          phone?: string | null;
          age: number;
          gender?: string | null;
          height_cm: number;
          weight_kg: number;
          target_direction: TargetDirection;
          target_weight_kg?: number | null;
          timeline_weeks?: number | null;
          routine_data?: Json;
          food_preferences?: Json;
          health_screening?: Json;
          consent_version: string;
          health_consent_granted: boolean;
          status?: AssessmentStatus;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          draft_token_hash?: string;
          first_name?: string;
          email?: string;
          phone?: string | null;
          age?: number;
          gender?: string | null;
          height_cm?: number;
          weight_kg?: number;
          target_direction?: TargetDirection;
          target_weight_kg?: number | null;
          timeline_weeks?: number | null;
          routine_data?: Json;
          food_preferences?: Json;
          health_screening?: Json;
          consent_version?: string;
          health_consent_granted?: boolean;
          status?: AssessmentStatus;
          submitted_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assessment_reviews: {
        Row: {
          id: string;
          assessment_id: string;
          reviewer_id: string;
          decision: 'approved' | 'needs_info' | 'not_suitable';
          safety_flags: string[];
          reviewer_notes: string | null;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          reviewer_id: string;
          decision: 'approved' | 'needs_info' | 'not_suitable';
          safety_flags?: string[];
          reviewer_notes?: string | null;
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          reviewer_id?: string;
          decision?: 'approved' | 'needs_info' | 'not_suitable';
          safety_flags?: string[];
          reviewer_notes?: string | null;
          reviewed_at?: string;
        };
        Relationships: [];
      };
      consent_records: {
        Row: {
          id: string;
          user_id: string | null;
          assessment_id: string | null;
          purpose: string;
          policy_version: string;
          ip_hash: string | null;
          granted_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          assessment_id?: string | null;
          purpose: string;
          policy_version: string;
          ip_hash?: string | null;
          granted_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          assessment_id?: string | null;
          purpose?: string;
          policy_version?: string;
          ip_hash?: string | null;
          granted_at?: string;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      plans_catalog: {
        Row: {
          id: string;
          name: string;
          price_paise: number;
          currency: string;
          billing_interval: string;
          features: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          price_paise: number;
          currency?: string;
          billing_interval?: string;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price_paise?: number;
          currency?: string;
          billing_interval?: string;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          status: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          status: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          status?: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          id: string;
          provider_event_id: string;
          event_type: string;
          signature_verified: boolean;
          processed_status: 'processed' | 'ignored' | 'failed';
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_event_id: string;
          event_type: string;
          signature_verified?: boolean;
          processed_status: 'processed' | 'ignored' | 'failed';
          payload: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_event_id?: string;
          event_type?: string;
          signature_verified?: boolean;
          processed_status?: 'processed' | 'ignored' | 'failed';
          payload?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      meal_templates: {
        Row: {
          id: string;
          title: string;
          meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'post_dinner';
          diet_category: 'vegetarian' | 'eggetarian' | 'non_vegetarian';
          ingredients: Json;
          default_portion: string;
          preparation_notes: string | null;
          regional_tags: string[];
          allergen_tags: string[];
          approx_calories: number | null;
          approx_protein_g: number | null;
          alternatives: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'post_dinner';
          diet_category: 'vegetarian' | 'eggetarian' | 'non_vegetarian';
          ingredients?: Json;
          default_portion: string;
          preparation_notes?: string | null;
          regional_tags?: string[];
          allergen_tags?: string[];
          approx_calories?: number | null;
          approx_protein_g?: number | null;
          alternatives?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          meal_type?: 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'post_dinner';
          diet_category?: 'vegetarian' | 'eggetarian' | 'non_vegetarian';
          ingredients?: Json;
          default_portion?: string;
          preparation_notes?: string | null;
          regional_tags?: string[];
          allergen_tags?: string[];
          approx_calories?: number | null;
          approx_protein_g?: number | null;
          alternatives?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      diet_plans: {
        Row: {
          id: string;
          user_id: string;
          version: number;
          status: 'draft' | 'published' | 'archived';
          effective_start_date: string;
          effective_end_date: string | null;
          guidance_notes: string | null;
          created_by: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          version?: number;
          status?: 'draft' | 'published' | 'archived';
          effective_start_date: string;
          effective_end_date?: string | null;
          guidance_notes?: string | null;
          created_by: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          version?: number;
          status?: 'draft' | 'published' | 'archived';
          effective_start_date?: string;
          effective_end_date?: string | null;
          guidance_notes?: string | null;
          created_by?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      diet_plan_meals: {
        Row: {
          id: string;
          diet_plan_id: string;
          day_of_week: number;
          meal_type: string;
          scheduled_time: string;
          meal_template_id: string | null;
          custom_title: string | null;
          custom_portion: string;
          custom_notes: string | null;
          custom_alternatives: Json;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          diet_plan_id: string;
          day_of_week: number;
          meal_type: string;
          scheduled_time: string;
          meal_template_id?: string | null;
          custom_title?: string | null;
          custom_portion: string;
          custom_notes?: string | null;
          custom_alternatives?: Json;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          diet_plan_id?: string;
          day_of_week?: number;
          meal_type?: string;
          scheduled_time?: string;
          meal_template_id?: string | null;
          custom_title?: string | null;
          custom_portion?: string;
          custom_notes?: string | null;
          custom_alternatives?: Json;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      weight_entries: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          recorded_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          recorded_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          weight_kg?: number;
          recorded_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      progress_photos: {
        Row: {
          id: string;
          user_id: string;
          storage_path: string;
          captured_at: string;
          consent_version: string;
          notes: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          storage_path: string;
          captured_at?: string;
          consent_version?: string;
          notes?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          storage_path?: string;
          captured_at?: string;
          consent_version?: string;
          notes?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      support_threads: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          status: 'open' | 'waiting_member' | 'resolved' | 'closed';
          priority: 'normal' | 'premium';
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          status?: 'open' | 'waiting_member' | 'resolved' | 'closed';
          priority?: 'normal' | 'premium';
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          status?: 'open' | 'waiting_member' | 'resolved' | 'closed';
          priority?: 'normal' | 'premium';
          last_message_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      support_messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_id: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          sender_id?: string;
          body?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          adherence_rating: number;
          energy_level: number;
          appetite_notes: string | null;
          challenges_text: string | null;
          current_weight_kg: number | null;
          admin_feedback: string | null;
          status: 'submitted' | 'reviewed';
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          adherence_rating: number;
          energy_level: number;
          appetite_notes?: string | null;
          challenges_text?: string | null;
          current_weight_kg?: number | null;
          admin_feedback?: string | null;
          status?: 'submitted' | 'reviewed';
          submitted_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          adherence_rating?: number;
          energy_level?: number;
          appetite_notes?: string | null;
          challenges_text?: string | null;
          current_weight_kg?: number | null;
          admin_feedback?: string | null;
          status?: 'submitted' | 'reviewed';
          submitted_at?: string;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_assessment_status_by_token: {
        Args: {
          p_token_hash: string;
        };
        Returns: {
          status: AssessmentStatus;
          submitted_at: string;
          first_name: string;
          target_direction: TargetDirection;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      membership_status: MembershipStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Membership = Database['public']['Tables']['memberships']['Row'];
export type MembershipInsert = Database['public']['Tables']['memberships']['Insert'];
export type MembershipUpdate = Database['public']['Tables']['memberships']['Update'];

export type Assessment = Database['public']['Tables']['assessments']['Row'];
export type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];
export type AssessmentUpdate = Database['public']['Tables']['assessments']['Update'];

export type AssessmentReview = Database['public']['Tables']['assessment_reviews']['Row'];
export type AssessmentReviewInsert = Database['public']['Tables']['assessment_reviews']['Insert'];

export type ConsentRecord = Database['public']['Tables']['consent_records']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

export type PlanCatalog = Database['public']['Tables']['plans_catalog']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];
export type PaymentEvent = Database['public']['Tables']['payment_events']['Row'];

export type MealTemplate = Database['public']['Tables']['meal_templates']['Row'];
export type MealTemplateInsert = Database['public']['Tables']['meal_templates']['Insert'];
export type DietPlan = Database['public']['Tables']['diet_plans']['Row'];
export type DietPlanInsert = Database['public']['Tables']['diet_plans']['Insert'];
export type DietPlanMeal = Database['public']['Tables']['diet_plan_meals']['Row'];
export type DietPlanMealInsert = Database['public']['Tables']['diet_plan_meals']['Insert'];

export type WeightEntry = Database['public']['Tables']['weight_entries']['Row'];
export type WeightEntryInsert = Database['public']['Tables']['weight_entries']['Insert'];
export type WeightEntryUpdate = Database['public']['Tables']['weight_entries']['Update'];

export type ProgressPhoto = Database['public']['Tables']['progress_photos']['Row'];
export type ProgressPhotoInsert = Database['public']['Tables']['progress_photos']['Insert'];

export type SupportThread = Database['public']['Tables']['support_threads']['Row'];
export type SupportThreadInsert = Database['public']['Tables']['support_threads']['Insert'];
export type SupportThreadUpdate = Database['public']['Tables']['support_threads']['Update'];

export type SupportMessage = Database['public']['Tables']['support_messages']['Row'];
export type SupportMessageInsert = Database['public']['Tables']['support_messages']['Insert'];

export type CheckIn = Database['public']['Tables']['check_ins']['Row'];
export type CheckInInsert = Database['public']['Tables']['check_ins']['Insert'];
export type CheckInUpdate = Database['public']['Tables']['check_ins']['Update'];
