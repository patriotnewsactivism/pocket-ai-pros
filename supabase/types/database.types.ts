export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bots: {
        Row: {
          configuration: Json | null
          conversations_count: number | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          training_data: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          configuration?: Json | null
          conversations_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          training_data?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          configuration?: Json | null
          conversations_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          training_data?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          bot_id: string | null
          created_at: string | null
          id: string
          messages: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bot_id?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          status: string | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          status?: string | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          status?: string | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      reseller_applications: {
        Row: {
          company: string
          email: string
          expected_clients: number | null
          experience: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          company: string
          email: string
          expected_clients?: number | null
          experience?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          company?: string
          email?: string
          expected_clients?: number | null
          experience?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      resellers: {
        Row: {
          clients_count: number | null
          commission_rate: number | null
          created_at: string | null
          id: string
          last_payout_date: string | null
          paid_earnings: number | null
          pending_earnings: number | null
          status: string | null
          total_earnings: number | null
          user_id: string | null
        }
        Insert: {
          clients_count?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          last_payout_date?: string | null
          paid_earnings?: number | null
          pending_earnings?: number | null
          status?: string | null
          total_earnings?: number | null
          user_id?: string | null
        }
        Update: {
          clients_count?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          last_payout_date?: string | null
          paid_earnings?: number | null
          pending_earnings?: number | null
          status?: string | null
          total_earnings?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resellers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          bots_limit: number
          conversations_limit: number
          created_at: string | null
          expires_at: string | null
          id: string
          plan: string
          price: number
          started_at: string | null
          status: string | null
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          bots_limit: number
          conversations_limit: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan: string
          price: number
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          bots_limit?: number
          conversations_limit?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan?: string
          price?: number
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bots_limit: number | null
          company: string | null
          current_period_end: string | null
          conversations_limit: number | null
          conversations_used: number | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          plan: string | null
          referral_code: string | null
          referred_by: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bots_limit?: number | null
          company?: string | null
          current_period_end?: string | null
          conversations_limit?: number | null
          conversations_used?: number | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: string | null
          referral_code?: string | null
          referred_by?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bots_limit?: number | null
          company?: string | null
          current_period_end?: string | null
          conversations_limit?: number | null
          conversations_used?: number | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: string | null
          referral_code?: string | null
          referred_by?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_reseller_earnings: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
