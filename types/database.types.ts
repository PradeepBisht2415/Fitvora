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
    };
    Enums: {
      user_role: UserRole;
      membership_status: MembershipStatus;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Membership = Database['public']['Tables']['memberships']['Row'];
export type MembershipInsert = Database['public']['Tables']['memberships']['Insert'];
export type MembershipUpdate = Database['public']['Tables']['memberships']['Update'];

export type ConsentRecord = Database['public']['Tables']['consent_records']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
