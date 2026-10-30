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
    PostgrestVersion: "12.2.3"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          log_type: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          log_type: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          log_type?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          acknowledged_at: string | null
          amount_due: number
          business: string
          cancellation_reason: string[] | null
          client: string | null
          client_metadata: Json | null
          created_at: string
          deposit_charge_id: string | null
          deposit_price: number | null
          deposit_tax_transaction: string | null
          discount_cents: number
          end: string
          eoa_tax_transaction: string | null
          id: string
          late_fee_added_at: string | null
          late_fee_cents: number
          loyalty_reward_id: string | null
          no_show_fee_cents: number | null
          no_show_fee_charge_id: string | null
          no_show_fee_charged_at: string | null
          no_show_fee_error: string | null
          no_show_fee_status: string | null
          paid_amount: number
          paid_deposit: boolean
          payment_link_id: string
          policy_id: string | null
          rebook_nudged_at: string | null
          refund_id: string | null
          refund_status: Database["public"]["Enums"]["refund_status"]
          refunded_amount: number | null
          refunded_at: string | null
          reminder_ids: Json | null
          require_deposit: boolean
          reschedules: number
          selected_addons: Json[]
          selected_options: Json | null
          service_charge_id: string | null
          service_data: Json | null
          service_paid: boolean | null
          service_paid_type: Database["public"]["Enums"]["paid_type"] | null
          start: string
          status: Database["public"]["Enums"]["status"]
          substraction: boolean
          time_range: unknown
          tip_cents: number
          updated_at: string
          waitlist_notified_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          amount_due?: number
          business?: string
          cancellation_reason?: string[] | null
          client?: string | null
          client_metadata?: Json | null
          created_at?: string
          deposit_charge_id?: string | null
          deposit_price?: number | null
          deposit_tax_transaction?: string | null
          discount_cents?: number
          end: string
          eoa_tax_transaction?: string | null
          id?: string
          late_fee_added_at?: string | null
          late_fee_cents?: number
          loyalty_reward_id?: string | null
          no_show_fee_cents?: number | null
          no_show_fee_charge_id?: string | null
          no_show_fee_charged_at?: string | null
          no_show_fee_error?: string | null
          no_show_fee_status?: string | null
          paid_amount?: number
          paid_deposit?: boolean
          payment_link_id?: string
          policy_id?: string | null
          rebook_nudged_at?: string | null
          refund_id?: string | null
          refund_status?: Database["public"]["Enums"]["refund_status"]
          refunded_amount?: number | null
          refunded_at?: string | null
          reminder_ids?: Json | null
          require_deposit?: boolean
          reschedules?: number
          selected_addons?: Json[]
          selected_options?: Json | null
          service_charge_id?: string | null
          service_data?: Json | null
          service_paid?: boolean | null
          service_paid_type?: Database["public"]["Enums"]["paid_type"] | null
          start: string
          status?: Database["public"]["Enums"]["status"]
          substraction?: boolean
          time_range?: unknown
          tip_cents?: number
          updated_at?: string
          waitlist_notified_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          amount_due?: number
          business?: string
          cancellation_reason?: string[] | null
          client?: string | null
          client_metadata?: Json | null
          created_at?: string
          deposit_charge_id?: string | null
          deposit_price?: number | null
          deposit_tax_transaction?: string | null
          discount_cents?: number
          end?: string
          eoa_tax_transaction?: string | null
          id?: string
          late_fee_added_at?: string | null
          late_fee_cents?: number
          loyalty_reward_id?: string | null
          no_show_fee_cents?: number | null
          no_show_fee_charge_id?: string | null
          no_show_fee_charged_at?: string | null
          no_show_fee_error?: string | null
          no_show_fee_status?: string | null
          paid_amount?: number
          paid_deposit?: boolean
          payment_link_id?: string
          policy_id?: string | null
          rebook_nudged_at?: string | null
          refund_id?: string | null
          refund_status?: Database["public"]["Enums"]["refund_status"]
          refunded_amount?: number | null
          refunded_at?: string | null
          reminder_ids?: Json | null
          require_deposit?: boolean
          reschedules?: number
          selected_addons?: Json[]
          selected_options?: Json | null
          service_charge_id?: string | null
          service_data?: Json | null
          service_paid?: boolean | null
          service_paid_type?: Database["public"]["Enums"]["paid_type"] | null
          start?: string
          status?: Database["public"]["Enums"]["status"]
          substraction?: boolean
          time_range?: unknown
          tip_cents?: number
          updated_at?: string
          waitlist_notified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_fkey"
            columns: ["business"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "appointments_loyalty_reward_id_fkey"
            columns: ["loyalty_reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
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
      banned_clients: {
        Row: {
          business_id: string | null
          client_id: string
          created_at: string
          id: string
        }
        Insert: {
          business_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
        }
        Update: {
          business_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banned_clients_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "banned_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["client_id"]
          },
        ]
      }
      booking_sessions: {
        Row: {
          amount: number | null
          business_id: string
          clientInfo: Json | null
          confirmed_at: string | null
          created_at: string
          currency: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          payment_intent_id: string | null
          selected_datetime: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["booking_session_status"]
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          business_id?: string
          clientInfo?: Json | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          selected_datetime?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_session_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          business_id?: string
          clientInfo?: Json | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          selected_datetime?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_session_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_sessions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "booking_sessions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_waitlist: {
        Row: {
          business_id: string
          created_at: string
          email: string
          first_name: string
          from_date: string
          id: string
          last_name: string
          last_notified_at: string | null
          note: string | null
          notified_count: number
          phone: string
          service_id: string | null
          status: string
          time_of_day: string
          to_date: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email: string
          first_name: string
          from_date: string
          id?: string
          last_name?: string
          last_notified_at?: string | null
          note?: string | null
          notified_count?: number
          phone?: string
          service_id?: string | null
          status?: string
          time_of_day?: string
          to_date: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string
          first_name?: string
          from_date?: string
          id?: string
          last_name?: string
          last_notified_at?: string | null
          note?: string | null
          notified_count?: number
          phone?: string
          service_id?: string | null
          status?: string
          time_of_day?: string
          to_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_waitlist_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "booking_waitlist_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_clients: {
        Row: {
          banned: boolean
          business: string
          client: string
          created_at: string
          id: number
        }
        Insert: {
          banned?: boolean
          business: string
          client: string
          created_at?: string
          id?: number
        }
        Update: {
          banned?: boolean
          business?: string
          client?: string
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_clients_business_fkey"
            columns: ["business"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_clients_client_fkey"
            columns: ["client"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["client_id"]
          },
        ]
      }
      business_policies: {
        Row: {
          book_ahead_value: string
          business: string
          cancel_day_limit: number | null
          created_at: string
          deposit: Json
          id: string
          important_info: string | null
          late_fee: Json
          no_show: Json
          no_show_fee: Json
          read_before_booking: string | null
          reschedule_day_limit: number | null
          reschedule_limit: number | null
          updated_at: string
        }
        Insert: {
          book_ahead_value?: string
          business?: string
          cancel_day_limit?: number | null
          created_at?: string
          deposit: Json
          id?: string
          important_info?: string | null
          late_fee: Json
          no_show: Json
          no_show_fee?: Json
          read_before_booking?: string | null
          reschedule_day_limit?: number | null
          reschedule_limit?: number | null
          updated_at?: string
        }
        Update: {
          book_ahead_value?: string
          business?: string
          cancel_day_limit?: number | null
          created_at?: string
          deposit?: Json
          id?: string
          important_info?: string | null
          late_fee?: Json
          no_show?: Json
          no_show_fee?: Json
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
          account_settings: Json | null
          booking_policies: string
          brand_color: string | null
          business_id: string
          business_name: string
          clients: string[] | null
          completed_stripe_onboarding: boolean
          complimentary_until: string | null
          created_at: string
          current_onboarding_link: string | null
          default_availability: string
          early_access: boolean | null
          email: string
          founding_member: boolean | null
          founding_member_number: number | null
          founding_member_since: string | null
          had_trial: boolean
          has_marketplace_profile: boolean | null
          is_onboarded: boolean
          last_checkin_sent_at: string | null
          latitude: number | null
          legacy_url_names: string[]
          location: unknown
          longitude: number | null
          marketing_opt_in: boolean
          payment_method_config_id: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          published_site: boolean
          sms_business_texts: boolean
          sms_enabled: boolean
          sms_phone: string | null
          stripe_acc_id: string | null
          stripe_customer_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          tos_accepted_at: string | null
          tos_ip_address: string | null
          total_booking_volume: number | null
          tours_completed: Json | null
          unsubscribe_token: string | null
          updated_at: string
          upgrade_prompt_dismissed_at: string | null
          url_name: string
          user_id: string
          waitlist_enabled: boolean
        }
        Insert: {
          account_settings?: Json | null
          booking_policies?: string
          brand_color?: string | null
          business_id?: string
          business_name: string
          clients?: string[] | null
          completed_stripe_onboarding?: boolean
          complimentary_until?: string | null
          created_at?: string
          current_onboarding_link?: string | null
          default_availability?: string
          early_access?: boolean | null
          email: string
          founding_member?: boolean | null
          founding_member_number?: number | null
          founding_member_since?: string | null
          had_trial?: boolean
          has_marketplace_profile?: boolean | null
          is_onboarded?: boolean
          last_checkin_sent_at?: string | null
          latitude?: number | null
          legacy_url_names?: string[]
          location?: unknown
          longitude?: number | null
          marketing_opt_in?: boolean
          payment_method_config_id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          published_site?: boolean
          sms_business_texts?: boolean
          sms_enabled?: boolean
          sms_phone?: string | null
          stripe_acc_id?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tos_accepted_at?: string | null
          tos_ip_address?: string | null
          total_booking_volume?: number | null
          tours_completed?: Json | null
          unsubscribe_token?: string | null
          updated_at?: string
          upgrade_prompt_dismissed_at?: string | null
          url_name?: string
          user_id?: string
          waitlist_enabled?: boolean
        }
        Update: {
          account_settings?: Json | null
          booking_policies?: string
          brand_color?: string | null
          business_id?: string
          business_name?: string
          clients?: string[] | null
          completed_stripe_onboarding?: boolean
          complimentary_until?: string | null
          created_at?: string
          current_onboarding_link?: string | null
          default_availability?: string
          early_access?: boolean | null
          email?: string
          founding_member?: boolean | null
          founding_member_number?: number | null
          founding_member_since?: string | null
          had_trial?: boolean
          has_marketplace_profile?: boolean | null
          is_onboarded?: boolean
          last_checkin_sent_at?: string | null
          latitude?: number | null
          legacy_url_names?: string[]
          location?: unknown
          longitude?: number | null
          marketing_opt_in?: boolean
          payment_method_config_id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          published_site?: boolean
          sms_business_texts?: boolean
          sms_enabled?: boolean
          sms_phone?: string | null
          stripe_acc_id?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tos_accepted_at?: string | null
          tos_ip_address?: string | null
          total_booking_volume?: number | null
          tours_completed?: Json | null
          unsubscribe_token?: string | null
          updated_at?: string
          upgrade_prompt_dismissed_at?: string | null
          url_name?: string
          user_id?: string
          waitlist_enabled?: boolean
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          email: string
          first_name: string
          last_name: string
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string
          created_at?: string
          email: string
          first_name?: string
          last_name?: string
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string
          first_name?: string
          last_name?: string
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      client_waitlist: {
        Row: {
          city: string | null
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          early_access_only: boolean | null
          feature_name: string
          id: string
          is_public: boolean | null
        }
        Insert: {
          created_at?: string | null
          early_access_only?: boolean | null
          feature_name: string
          id?: string
          is_public?: boolean | null
        }
        Update: {
          created_at?: string | null
          early_access_only?: boolean | null
          feature_name?: string
          id?: string
          is_public?: boolean | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          business_id: string | null
          business_name: string | null
          created_at: string | null
          email: string | null
          founder_notes: string | null
          id: string
          message: string
          resolved_at: string | null
          status: string
          type: string
        }
        Insert: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          founder_notes?: string | null
          id?: string
          message: string
          resolved_at?: string | null
          status?: string
          type: string
        }
        Update: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          founder_notes?: string | null
          id?: string
          message?: string
          resolved_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      image_section: {
        Row: {
          created_at: string
          editor_id: string | null
          fileBody: Json | null
          id: string
          index: number
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          editor_id?: string | null
          fileBody?: Json | null
          id?: string
          index: number
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          editor_id?: string | null
          fileBody?: Json | null
          id?: string
          index?: number
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_section_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "web_editors"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_ledger: {
        Row: {
          appointment_id: string | null
          business_id: string
          client_id: string
          created_at: string
          id: string
          kind: string
          note: string | null
          notified_at: string | null
          reward_id: string | null
          spend_cents: number
          visits: number
        }
        Insert: {
          appointment_id?: string | null
          business_id: string
          client_id: string
          created_at?: string
          id?: string
          kind: string
          note?: string | null
          notified_at?: string | null
          reward_id?: string | null
          spend_cents?: number
          visits?: number
        }
        Update: {
          appointment_id?: string | null
          business_id?: string
          client_id?: string
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          notified_at?: string | null
          reward_id?: string | null
          spend_cents?: number
          visits?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_ledger_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_ledger_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "loyalty_ledger_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "loyalty_ledger_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_programs: {
        Row: {
          business_id: string
          created_at: string
          earn_type: string
          enabled: boolean
          rebook_bonus_enabled: boolean
          rebook_within_days: number
          referral_enabled: boolean
          referral_reward_cents: number
          reward_expiry_days: number | null
          reward_type: string
          reward_value: number
          spend_threshold_cents: number
          updated_at: string
          visits_required: number
        }
        Insert: {
          business_id: string
          created_at?: string
          earn_type?: string
          enabled?: boolean
          rebook_bonus_enabled?: boolean
          rebook_within_days?: number
          referral_enabled?: boolean
          referral_reward_cents?: number
          reward_expiry_days?: number | null
          reward_type?: string
          reward_value?: number
          spend_threshold_cents?: number
          updated_at?: string
          visits_required?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          earn_type?: string
          enabled?: boolean
          rebook_bonus_enabled?: boolean
          rebook_within_days?: number
          referral_enabled?: boolean
          referral_reward_cents?: number
          reward_expiry_days?: number | null
          reward_type?: string
          reward_value?: number
          spend_threshold_cents?: number
          updated_at?: string
          visits_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_programs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          business_id: string
          client_id: string
          code: string
          expires_at: string | null
          id: string
          issued_at: string
          reward_type: string
          source: string
          status: string
          used_amount_cents: number | null
          used_appointment_id: string | null
          used_at: string | null
          value: number
        }
        Insert: {
          business_id: string
          client_id: string
          code: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          reward_type: string
          source?: string
          status?: string
          used_amount_cents?: number | null
          used_appointment_id?: string | null
          used_at?: string | null
          value: number
        }
        Update: {
          business_id?: string
          client_id?: string
          code?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          reward_type?: string
          source?: string
          status?: string
          used_amount_cents?: number | null
          used_appointment_id?: string | null
          used_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "loyalty_rewards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "loyalty_rewards_used_appointment_id_fkey"
            columns: ["used_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_profile: {
        Row: {
          banner_photo_url: string | null
          business_bio: string | null
          business_id: string | null
          categories: string[] | null
          created_at: string
          experience: number | null
          gallery_photos: string[]
          id: string
          is_licensed: boolean | null
          profile_photo_url: string | null
        }
        Insert: {
          banner_photo_url?: string | null
          business_bio?: string | null
          business_id?: string | null
          categories?: string[] | null
          created_at?: string
          experience?: number | null
          gallery_photos: string[]
          id?: string
          is_licensed?: boolean | null
          profile_photo_url?: string | null
        }
        Update: {
          banner_photo_url?: string | null
          business_bio?: string | null
          business_id?: string | null
          categories?: string[] | null
          created_at?: string
          experience?: number | null
          gallery_photos?: string[]
          id?: string
          is_licensed?: boolean | null
          profile_photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_profile_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
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
      referral_codes: {
        Row: {
          access_token: string
          business_id: string
          client_id: string
          code: string
          created_at: string
          id: string
        }
        Insert: {
          access_token?: string
          business_id: string
          client_id: string
          code: string
          created_at?: string
          id?: string
        }
        Update: {
          access_token?: string
          business_id?: string
          client_id?: string
          code?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "referral_codes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["client_id"]
          },
        ]
      }
      referral_programs: {
        Row: {
          business_id: string
          created_at: string
          enabled: boolean
          max_rewards_per_referrer: number | null
          recipients: string
          reward_expiry_days: number | null
          reward_type: string
          reward_value: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          enabled?: boolean
          max_rewards_per_referrer?: number | null
          recipients?: string
          reward_expiry_days?: number | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          enabled?: boolean
          max_rewards_per_referrer?: number | null
          recipients?: string
          reward_expiry_days?: number | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_programs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          available_at: string | null
          business_id: string
          client_id: string | null
          created_at: string
          id: string
          loyalty_reward_id: string | null
          notified_at: string | null
          recipient: string
          redeemed_amount_cents: number | null
          redeemed_appointment_id: string | null
          redeemed_at: string | null
          referral_id: string
          reward_type: string
          status: string
          value: number
        }
        Insert: {
          available_at?: string | null
          business_id: string
          client_id?: string | null
          created_at?: string
          id?: string
          loyalty_reward_id?: string | null
          notified_at?: string | null
          recipient: string
          redeemed_amount_cents?: number | null
          redeemed_appointment_id?: string | null
          redeemed_at?: string | null
          referral_id: string
          reward_type: string
          status?: string
          value: number
        }
        Update: {
          available_at?: string | null
          business_id?: string
          client_id?: string | null
          created_at?: string
          id?: string
          loyalty_reward_id?: string | null
          notified_at?: string | null
          recipient?: string
          redeemed_amount_cents?: number | null
          redeemed_appointment_id?: string | null
          redeemed_at?: string | null
          referral_id?: string
          reward_type?: string
          status?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "referral_rewards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "referral_rewards_loyalty_reward_id_fkey"
            columns: ["loyalty_reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_redeemed_appointment_id_fkey"
            columns: ["redeemed_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          appointment_id: string
          business_id: string
          code_id: string
          completed_at: string | null
          created_at: string
          id: string
          referred_client_id: string | null
          referred_email: string
          referred_phone: string
          referrer_client_id: string
          status: string
          void_reason: string | null
        }
        Insert: {
          appointment_id: string
          business_id: string
          code_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_client_id?: string | null
          referred_email?: string
          referred_phone?: string
          referrer_client_id: string
          status?: string
          void_reason?: string | null
        }
        Update: {
          appointment_id?: string
          business_id?: string
          code_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_client_id?: string | null
          referred_email?: string
          referred_phone?: string
          referrer_client_id?: string
          status?: string
          void_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "referrals_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_client_id_fkey"
            columns: ["referred_client_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "referrals_referrer_client_id_fkey"
            columns: ["referrer_client_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["client_id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          appointment_id: string
          business_id: string
          charge_type: string
          created_at: string
          failure_reason: string | null
          id: string
          initiated_by: string | null
          note: string | null
          payment_intent_id: string
          reason: string | null
          status: string
          stripe_refund_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id: string
          business_id: string
          charge_type: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          initiated_by?: string | null
          note?: string | null
          payment_intent_id: string
          reason?: string | null
          status: string
          stripe_refund_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string
          business_id?: string
          charge_type?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          initiated_by?: string | null
          note?: string | null
          payment_intent_id?: string
          reason?: string | null
          status?: string
          stripe_refund_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string
          created_at: string
          details: string | null
          id: string
          name: string | null
          rating: number | null
        }
        Insert: {
          business_id?: string
          created_at?: string
          details?: string | null
          id?: string
          name?: string | null
          rating?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          details?: string | null
          id?: string
          name?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
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
          prep: Json | null
          price: number
          rebook_weeks: number | null
          style_options: Json | null
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
          prep?: Json | null
          price: number
          rebook_weeks?: number | null
          style_options?: Json | null
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
          prep?: Json | null
          price?: number
          rebook_weeks?: number | null
          style_options?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_availability_fkey"
            columns: ["availability"]
            isOneToOne: false
            referencedRelation: "availabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_business_fkey"
            columns: ["business"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      sms_opt_outs: {
        Row: {
          opted_out_at: string
          phone: string
        }
        Insert: {
          opted_out_at?: string
          phone: string
        }
        Update: {
          opted_out_at?: string
          phone?: string
        }
        Relationships: []
      }
      sms_usage: {
        Row: {
          business_id: string
          month: string
          sent: number
        }
        Insert: {
          business_id: string
          month: string
          sent?: number
        }
        Update: {
          business_id?: string
          month?: string
          sent?: number
        }
        Relationships: [
          {
            foreignKeyName: "sms_usage_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string | null
          id: string
          name: string
        }
        Insert: {
          category_id?: string | null
          id?: string
          name: string
        }
        Update: {
          category_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          business_id: string | null
          business_name: string | null
          created_at: string | null
          email: string | null
          founder_reply: string | null
          id: string
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
        }
        Insert: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          founder_reply?: string | null
          id?: string
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          founder_reply?: string | null
          id?: string
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_users"
            referencedColumns: ["business_id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          business_id: string | null
          business_name: string | null
          created_at: string
          email: string | null
          feedback: string | null
          id: string
        }
        Insert: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          feedback?: string | null
          id?: string
        }
        Update: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          feedback?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_business_id_fkey"
            columns: ["business_id"]
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
          draft_data: string | null
          editor_data: string | null
          id: string
          image_objects: Json[] | null
          published_at: string | null
          section_data: Json[] | null
          site_data: Json
          theme_data: Json
          type: Database["public"]["Enums"]["web_editor"] | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          draft_data?: string | null
          editor_data?: string | null
          id?: string
          image_objects?: Json[] | null
          published_at?: string | null
          section_data?: Json[] | null
          site_data?: Json
          theme_data?: Json
          type?: Database["public"]["Enums"]["web_editor"] | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          draft_data?: string | null
          editor_data?: string | null
          id?: string
          image_objects?: Json[] | null
          published_at?: string | null
          section_data?: Json[] | null
          site_data?: Json
          theme_data?: Json
          type?: Database["public"]["Enums"]["web_editor"] | null
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
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      assign_founding_member: {
        Args: { p_business_id: string }
        Returns: number
      }
      claim_sms_slot: {
        Args: { p_business: string; p_limit: number }
        Returns: boolean
      }
      cleanup_processing_appointments: { Args: never; Returns: Json }
      confirm_booking_session:
        | {
            Args: {
              p_amount_due: number
              p_booking_session_id: string
              p_business: string
              p_client_metadata: Json
              p_deposit_charge_id: string
              p_deposit_price: number
              p_end: string
              p_paid_deposit: boolean
              p_require_deposit: boolean
              p_reschedules: number
              p_selected_addons: Json
              p_service_data: Json
              p_service_id: string
              p_start: string
              p_status: string
              p_subtraction: boolean
            }
            Returns: undefined
          }
        | {
            Args: {
              p_amount_due: number
              p_booking_session_id: string
              p_business: string
              p_client_metadata: Json
              p_deposit_charge_id: string
              p_deposit_price: number
              p_end: string
              p_paid_deposit: boolean
              p_require_deposit: boolean
              p_reschedules: number
              p_selected_addons: Json
              p_service_data: Json
              p_service_id: string
              p_start: string
              p_status: string
              p_subtraction: number
              p_user_id: string
            }
            Returns: undefined
          }
      daily_cleanup: { Args: never; Returns: Json }
      dashboard_bookings_this_month: {
        Args: { p_business: string }
        Returns: number
      }
      dashboard_new_clients_this_month: {
        Args: { p_business: string }
        Returns: number
      }
      dashboard_returning_rate: { Args: { business: string }; Returns: number }
      dashboard_revenue_this_month: {
        Args: { business: string }
        Returns: number
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      expire_booking_sessions: { Args: never; Returns: Json }
      expire_pending_appointments: { Args: never; Returns: Json }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_booking_performance: {
        Args: { p_business_id: string }
        Returns: {
          average_bookings_per_week: number
          bookings_by_day: Json
          bookings_by_hour: Json
          busiest_day_of_week: string
          cancellation_rate: number
          completion_rate: number
          no_show_rate: number
          total_bookings_last_month: number
          total_bookings_this_month: number
        }[]
      }
      get_client_analytics: {
        Args: { p_business_id: string }
        Returns: {
          average_days_between_visits: number
          average_lifetime_value: number
          average_visits_per_client: number
          client_growth_percent: number
          new_clients_last_month: number
          new_clients_this_month: number
          one_time_clients: number
          retention_rate: number
          returning_clients: number
          total_unique_clients: number
        }[]
      }
      get_client_list: {
        Args: { p_business_id: string }
        Returns: {
          average_days_between_visits: number
          average_spend_per_visit: number
          client_email: string
          client_name: string
          days_since_last_visit: number
          first_visit: string
          is_at_risk: boolean
          is_due_soon: boolean
          is_loyal: boolean
          last_visit: string
          most_booked_service: string
          preferred_day: string
          total_spent: number
          total_visits: number
        }[]
      }
      get_dashboard_growth: {
        Args: { p_stylist_id: string }
        Returns: {
          clients_growth: number
          clients_last_month: number
          clients_this_month: number
          revenue_growth: number
          revenue_last_month: number
          revenue_this_month: number
        }[]
      }
      get_financial_summary: {
        Args: { p_business_id: string }
        Returns: {
          average_monthly_revenue: number
          booking_count_all_time: number
          booking_count_this_year: number
          months_active: number
          total_deposits_all_time: number
          total_deposits_this_year: number
          total_earned_all_time: number
          total_earned_this_year: number
          total_outstanding_balances: number
        }[]
      }
      get_growth_trends: {
        Args: { p_business_id: string }
        Returns: {
          best_growth_month: string
          bookings_last_month: number
          bookings_mom_growth: number
          bookings_this_month: number
          clients_last_month: number
          clients_mom_growth: number
          clients_this_month: number
          on_pace_vs_last_month: string
          projected_month_revenue: number
          revenue_3month_avg: number
          revenue_last_month: number
          revenue_mom_growth: number
          revenue_this_month: number
        }[]
      }
      get_revenue_by_month: {
        Args: { p_business_id: string }
        Returns: {
          average_ticket: number
          booking_count: number
          month: string
          month_label: string
          revenue: number
        }[]
      }
      get_revenue_overview: {
        Args: { p_business_id: string }
        Returns: {
          average_per_appointment: number
          best_month_amount: number
          best_month_date: string
          revenue_growth_percent: number
          total_deposits_collected: number
          total_last_12_months: number
          total_last_3_months: number
          total_last_month: number
          total_outstanding: number
          total_this_month: number
          total_this_year: number
        }[]
      }
      get_service_analytics: {
        Args: { p_business_id: string }
        Returns: {
          addon_revenue: number
          average_price: number
          cancellation_count: number
          repeat_client_count: number
          revenue_percent: number
          service_id: string
          service_name: string
          total_bookings: number
          total_revenue: number
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      is_business_owner: { Args: { bid: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      loyalty_client_for: {
        Args: { appt: Database["public"]["Tables"]["appointments"]["Row"] }
        Returns: string
      }
      loyalty_issue_rewards: {
        Args: { p_appointment?: string; p_business: string; p_client: string }
        Returns: number
      }
      loyalty_new_code: { Args: never; Returns: string }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      referral_attribute: {
        Args: { p_appointment: string; p_code: string }
        Returns: Json
      }
      referral_code_for: {
        Args: { p_business: string; p_client: string }
        Returns: {
          access_token: string
          business_id: string
          client_id: string
          code: string
          created_at: string
          id: string
        }
        SetofOptions: {
          from: "*"
          to: "referral_codes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      referral_digits: { Args: { p: string }; Returns: string }
      referral_is_new_client: {
        Args: {
          p_business: string
          p_email: string
          p_exclude_appointment: string
          p_phone: string
        }
        Returns: boolean
      }
      refresh_appointment_refund_totals: {
        Args: { p_appointment_id: string }
        Returns: undefined
      }
      release_sms_slot: { Args: { p_business: string }; Returns: undefined }
      search_stylists_nearby: {
        Args: { radius_km: number; user_lat: number; user_lon: number }
        Returns: {
          account_settings: Json
          booking_policies: string
          business_id: string
          business_name: string
          completed_stripe_onboarding: boolean
          default_availability: string
          distance_meters: number
          email: string
          has_marketplace_profile: boolean
          is_onboarded: boolean
          latitude: number
          location: unknown
          longitude: number
          url_name: string
        }[]
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      booking_session_status:
        | "initiated"
        | "details_completed"
        | "payment_pending"
        | "confirmed"
        | "expired"
        | "canceled"
        | "date_selected"
      paid_type: "PLATFORM" | "CASH"
      plan_type: "STARTER" | "GROWTH"
      refund_status: "NONE" | "PARTIAL" | "FULL"
      status:
        | "PENDING"
        | "CONFIRMED"
        | "DENIED"
        | "CANCELLED"
        | "COMPLETED"
        | "PROCESSING"
        | "INCOMPLETE"
        | "NO_SHOW"
        | "REFUNDED"
      web_editor: "SECTIONS" | "CUSTOM" | "TEMPLATE"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      booking_session_status: [
        "initiated",
        "details_completed",
        "payment_pending",
        "confirmed",
        "expired",
        "canceled",
        "date_selected",
      ],
      paid_type: ["PLATFORM", "CASH"],
      plan_type: ["STARTER", "GROWTH"],
      refund_status: ["NONE", "PARTIAL", "FULL"],
      status: [
        "PENDING",
        "CONFIRMED",
        "DENIED",
        "CANCELLED",
        "COMPLETED",
        "PROCESSING",
        "INCOMPLETE",
        "NO_SHOW",
        "REFUNDED",
      ],
      web_editor: ["SECTIONS", "CUSTOM", "TEMPLATE"],
    },
  },
} as const
