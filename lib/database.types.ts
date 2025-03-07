export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          business: string
          client: string | null
          client_metadata: Json | null
          created_at: string
          deposit_charge_id: string | null
          end: string
          id: string
          paid_deposit: boolean
          policy_id: string | null
          require_deposit: boolean
          reschedules: number
          service_data: Json | null
          start: string
          status: Database["public"]["Enums"]["status"]
          updated_at: string
        }
        Insert: {
          business?: string
          client?: string | null
          client_metadata?: Json | null
          created_at?: string
          deposit_charge_id?: string | null
          end: string
          id?: string
          paid_deposit?: boolean
          policy_id?: string | null
          require_deposit?: boolean
          reschedules?: number
          service_data?: Json | null
          start: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
        }
        Update: {
          business?: string
          client?: string | null
          client_metadata?: Json | null
          created_at?: string
          deposit_charge_id?: string | null
          end?: string
          id?: string
          paid_deposit?: boolean
          policy_id?: string | null
          require_deposit?: boolean
          reschedules?: number
          service_data?: Json | null
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
          availabilities: Json[] | null
          booking_policies: string
          business_id: string
          business_name: string
          clients: string[] | null
          completed_stripe_onboarding: boolean
          created_at: string
          email: string
          is_onboarded: boolean
          stripe_acc_id: string | null
          updated_at: string
          url_name: string
          user_id: string,
          current_onboarding_link: string,
          default_availability: string,
        }
        Insert: {
          availabilities?: Json[] | null
          booking_policies?: string
          business_id?: string
          business_name: string
          clients?: string[] | null
          completed_stripe_onboarding?: boolean
          created_at?: string
          email: string
          is_onboarded?: boolean
          stripe_acc_id?: string | null
          updated_at?: string
          url_name?: string
          user_id?: string
          current_onboarding_link?: string | null
          default_availability?: string,
        }
        Update: {
          availabilities?: Json[] | null
          booking_policies?: string
          business_id?: string
          business_name?: string
          clients?: string[] | null
          completed_stripe_onboarding?: boolean
          created_at?: string
          email?: string
          is_onboarded?: boolean
          stripe_acc_id?: string | null
          updated_at?: string
          url_name?: string
          user_id?: string
          current_onboarding_link?: string | null
          default_availability?: string
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
      services: {
        Row: {
          addons: Json[] | null
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
          availability: string
        }
        Insert: {
          addons?: Json[] | null
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
          availability: string
        }
        Update: {
          addons?: Json[] | null
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
          availability?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      status: "PENDING" | "CONFIRMED" | "DENIED" | "CANCELLED" | "COMPLETED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
