export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          amount_due: number
          business: string
          cancellation_reason: string[] | null
          client: string | null
          client_metadata: Json | null
          created_at: string
          deposit_charge_id: string | null
          deposit_price: number | null
          deposit_tax_transaction: string | null
          end: string
          eoa_tax_transaction: string | null
          id: string
          paid_deposit: boolean
          payment_link_id: string | null
          policy_id: string | null
          reminder_ids: Json | null
          require_deposit: boolean
          reschedules: number
          selected_addons: Json[]
          service_charge_id: string
          service_data: Json | null
          service_paid: boolean | null
          service_paid_type: Database["public"]["Enums"]["paid_type"] | null
          start: string
          status: Database["public"]["Enums"]["status"]
          updated_at: string
        }
        Insert: {
          amount_due?: number
          business?: string
          cancellation_reason?: string[] | null
          client?: string | null
          client_metadata?: Json | null
          created_at?: string
          deposit_charge_id?: string | null
          deposit_price?: number | null
          deposit_tax_transaction?: string | null
          end: string
          eoa_tax_transaction?: string | null
          id?: string
          paid_deposit?: boolean
          payment_link_id?: string | null
          policy_id?: string | null
          reminder_ids?: Json | null
          require_deposit?: boolean
          reschedules?: number
          selected_addons?: Json[]
          service_charge_id?: string
          service_data?: Json | null
          service_paid?: boolean | null
          service_paid_type?: Database["public"]["Enums"]["paid_type"] | null
          start: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
        }
        Update: {
          amount_due?: number
          business?: string
          cancellation_reason?: string[] | null
          client?: string | null
          client_metadata?: Json | null
          created_at?: string
          deposit_charge_id?: string | null
          deposit_price?: number | null
          deposit_tax_transaction?: string | null
          end?: string
          eoa_tax_transaction?: string | null
          id?: string
          paid_deposit?: boolean
          payment_link_id?: string | null
          policy_id?: string | null
          reminder_ids?: Json | null
          require_deposit?: boolean
          reschedules?: number
          selected_addons?: Json[]
          service_charge_id?: string
          service_data?: Json | null
          service_paid?: boolean | null
          service_paid_type?: Database["public"]["Enums"]["paid_type"] | null
          start?: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_fkey"
            columns: ["business"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      availabilities: {
        Row: {
          availability_data: Json
          business_id: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          availability_data: Json
          business_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          availability_data?: Json
          business_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      business_clients: {
        Row: {
          business: string
          client: string
          created_at: string
          id: number
          status: Database["public"]["Enums"]["status"]
        }
        Insert: {
          business: string
          client: string
          created_at?: string
          id?: number
          status?: Database["public"]["Enums"]["status"]
        }
        Update: {
          business?: string
          client?: string
          created_at?: string
          id?: number
          status?: Database["public"]["Enums"]["status"]
        }
        Relationships: [
          {
            foreignKeyName: "business_clients_business_fkey"
            columns: ["business"]
            isOneToOne: true
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_clients_client_fkey"
            columns: ["client"]
            isOneToOne: true
            referencedRelation: "client_users"
            referencedColumns: ["client_id"]
          },
        ]
      }
      business_policies: {
        Row: {
          business: string
          cancel_day_limit: number | null
          created_at: string
          deposit: Json
          id: string
          important_info: string | null
          late_fee: Json
          no_show: Json
          read_before_booking: string | null
          reschedule_day_limit: number | null
          reschedule_limit: number | null
          updated_at: string
        }
        Insert: {
          business?: string
          cancel_day_limit?: number | null
          created_at?: string
          deposit: Json
          id?: string
          important_info?: string | null
          late_fee: Json
          no_show: Json
          read_before_booking?: string | null
          reschedule_day_limit?: number | null
          reschedule_limit?: number | null
          updated_at?: string
        }
        Update: {
          business?: string
          cancel_day_limit?: number | null
          created_at?: string
          deposit?: Json
          id?: string
          important_info?: string | null
          late_fee?: Json
          no_show?: Json
          read_before_booking?: string | null
          reschedule_day_limit?: number | null
          reschedule_limit?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_policies_business_fkey"
            columns: ["business"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      business_users: {
        Row: {
          booking_policies: string
          business_id: string
          business_name: string
          clients: string[] | null
          completed_stripe_onboarding: boolean
          created_at: string
          current_onboarding_link: string | null
          default_availability: string
          email: string
          is_onboarded: boolean
          stripe_acc_id: string | null
          updated_at: string
          url_name: string
          user_id: string
        }
        Insert: {
          booking_policies?: string
          business_id?: string
          business_name: string
          clients?: string[] | null
          completed_stripe_onboarding?: boolean
          created_at?: string
          current_onboarding_link?: string | null
          default_availability?: string
          email: string
          is_onboarded?: boolean
          stripe_acc_id?: string | null
          updated_at?: string
          url_name?: string
          user_id?: string
        }
        Update: {
          booking_policies?: string
          business_id?: string
          business_name?: string
          clients?: string[] | null
          completed_stripe_onboarding?: boolean
          created_at?: string
          current_onboarding_link?: string | null
          default_availability?: string
          email?: string
          is_onboarded?: boolean
          stripe_acc_id?: string | null
          updated_at?: string
          url_name?: string
          user_id?: string
        }
        Relationships: []
      }
      client_users: {
        Row: {
          appointments: string[] | null
          client_id: string
          created_at: string
          email: string
          phone_number: string
          stripe_acc_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointments?: string[] | null
          client_id?: string
          created_at?: string
          email: string
          phone_number: string
          stripe_acc_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointments?: string[] | null
          client_id?: string
          created_at?: string
          email?: string
          phone_number?: string
          stripe_acc_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          appointment_id: string
          body: string
          business_id: string
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
        }
        Insert: {
          appointment_id: string
          body: string
          business_id: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type: string
        }
        Update: {
          appointment_id?: string
          body?: string
          business_id?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      service_addons: {
        Row: {
          business_id: string
          created_at: string
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          business_id?: string
          created_at?: string
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_addons_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      services: {
        Row: {
          addons: Json[] | null
          availability: string
          business: string
          categories: string[] | null
          created_at: string
          description: string
          id: string
          imagePath: string | null
          length: number
          name: string
          photo_url: string | null
          price: number
          updated_at: string | null
        }
        Insert: {
          addons?: Json[] | null
          availability?: string
          business: string
          categories?: string[] | null
          created_at?: string
          description: string
          id?: string
          imagePath?: string | null
          length: number
          name: string
          photo_url?: string | null
          price: number
          updated_at?: string | null
        }
        Update: {
          addons?: Json[] | null
          availability?: string
          business?: string
          categories?: string[] | null
          created_at?: string
          description?: string
          id?: string
          imagePath?: string | null
          length?: number
          name?: string
          photo_url?: string | null
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_fkey"
            columns: ["business"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      web_editors: {
        Row: {
          business_id: string | null
          created_at: string
          editor_data: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          editor_data?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          editor_data?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web_editors_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      paid_type: "PLATFORM" | "CASH"
      status:
        | "PENDING"
        | "CONFIRMED"
        | "DENIED"
        | "CANCELLED"
        | "COMPLETED"
        | "PROCESSING"
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
    Enums: {
      paid_type: ["PLATFORM", "CASH"],
      status: [
        "PENDING",
        "CONFIRMED",
        "DENIED",
        "CANCELLED",
        "COMPLETED",
        "PROCESSING",
      ],
    },
  },
} as const
