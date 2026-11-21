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
