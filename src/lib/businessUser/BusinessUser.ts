import { createClient } from "@/app/utils/supabase/server";
import { Database } from "../../../lib/database.types";
import { stripe } from '../stripe/stripeClient'
import { Time } from "@internationalized/date";
import { SupabaseClient } from "@supabase/supabase-js";
import { createStripeCustomer } from "@lib/stripe/createStripeCustomer";
import { createStripeAccount } from "@lib/stripe/createStripeAccount";
import { UserAuth } from "@lib/auth/UserAuth";
import { Availability } from "@/features/availability/server/models/Availability";
import { Service } from "@lib/service/Service";
import { BusinessPolicy } from "@lib/businessPolicy/BusinessPolicy";
import { createStripeOnboardingLink } from "@lib/stripe/createStripeOnboardingLink";
import { Client } from "@lib/clients/Client";
import { Appointment } from "@/features/manualBooking/server/models/Appointment";
import { Notification } from "@lib/notifications/Notification";
import { checkAndAssignFoundingMember } from "@/lib/foundingMember";

export interface BusinessType {
    id: string,
    name: string,
    email: string,
    stripeAccountId: string,
    stripeCustomerId: string,
    completedStripeOnboarding: boolean,
    completedOnboarding: boolean,
    urlName: string,
    currentOnboardingLink: string,
    accountSettings: AccountSettings,
    planType: 'STARTER' | 'GROWTH',
    hadTrial: boolean,
    publishedSite: boolean,
    paymentMethodConfigId: string
}

interface AccountSettings {
    business_address: {
        no_address: boolean
        line_1: string
        line_2: string
        city: string
        state: string
        zip_code: string
    },
    notifications: {
        email: boolean
        email_24: boolean
        email_1: boolean
    },
    app_reminders: {
        email_24: boolean,
        email_1: boolean
    }
}

export class BusinessUser {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public stripeAccountId: string,
        public stripeCustomerId: string,
        public completedStripeOnboarding: boolean,
        public completedOnboarding: boolean,
        public urlName: string,
        public currentOnboardingLink: string,
        public accountSettings: AccountSettings,
        public planType: 'STARTER' | 'GROWTH',
        public hadTrial: boolean,
        public publishedSite: boolean,
        public paymentMethodConfigId: string
    ) { }

    private static async businessNameExists(name: string, supabase: SupabaseClient<Database>): Promise<boolean> {
        const { data } = await supabase.from('business_users').select().eq('business_name', name).maybeSingle()
        return data !== null
    }

    private static async emailInUse(email: string, supabase: SupabaseClient<Database>) {
        const { data } = await supabase.from('business_users').select().eq('email', email).maybeSingle()
        return data !== null
    }

    toClient() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            stripeAccountId: this.stripeAccountId,
            stripeCustomerId: this.stripeCustomerId,
            completedStripeOnboarding: this.completedStripeOnboarding,
            completedOnboarding: this.completedOnboarding,
            urlName: this.urlName,
            currentOnboardingLink: this.currentOnboardingLink,
            accountSettings: this.accountSettings,
            planType: this.planType,
            hadTrial: this.hadTrial,
            publishedSite: this.publishedSite,
            paymentMethodConfigId: this.paymentMethodConfigId
        }
    }

    private static fromRow(row: Database['public']['Tables']['business_users']['Row']) {
        return new BusinessUser(
            row.business_id,
            row.business_name,
            row.email,
            row.stripe_acc_id!,
            row.stripe_customer_id!,
            row.completed_stripe_onboarding,
            row.is_onboarded,
            row.url_name,
            row.current_onboarding_link!,
            row.account_settings as unknown as AccountSettings,
            row.plan_type,
            row.had_trial,
            row.published_site,
            row.payment_method_config_id
        )
    }

    static async fetchWithUserId(supabase: SupabaseClient<Database, any>, userId: string) {
        try {
            const { data: row, error } = await supabase.from('business_users').select().eq('user_id', userId).single()
            if (error) throw Error(error.message)
            return BusinessUser.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }

    static async create(supabase: SupabaseClient<Database, any>, email: string, password: string, name: string) {
        try {
            if (await this.businessNameExists(name, supabase)) {
                throw Error('Business name already exists')
            }
            if (await this.emailInUse(email, supabase)) {
                throw Error('Email is already in use')
            }
            const user = await UserAuth.register(supabase, email, password)
            const account = await createStripeAccount()
            const customer = await createStripeCustomer(email)
            const onboardingLink = await createStripeOnboardingLink(account.id)

            const { data: businessUser } = await supabase.from('business_users').insert(
                {
                    business_name: name,
                    user_id: user?.id,
                    email: email,
                    stripe_acc_id: account.id,
                    default_availability: "",
                    stripe_customer_id: customer.id,
                    url_name: name.split(" ").join("").toLowerCase(),
                    current_onboarding_link: onboardingLink,
                    account_settings: {
                        "app_reminders": {
                            "email_1": false,
                            "email_24": true
                        },
                        "notifications": {
                            "email": true,
                            "email_1": false,
                            "email_24": true
                        },
                        "business_address": {
                            "city": "",
                            "state": "",
                            "line_1": "",
                            "line_2": "",
                            "zip_code": "",
                            "no_address": false
                        }
                    }
                }
            ).select().maybeSingle()

            const business = businessUser!
            const availability = await Availability.createDefault(supabase, business?.business_id!)
            await Service.createDefault(supabase, businessUser?.business_id!, Array.isArray(availability) ? availability[0].id : availability.id
            )
            await BusinessPolicy.createDefault(supabase, business.business_id)

            checkAndAssignFoundingMember(business.business_id).catch(console.error)

            return BusinessUser.fromRow(business)

        } catch (error: any) {
            throw Error(error.message ?? error)
        }

    }
    static async fetch(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('business_users').select().eq('business_id', businessId).single()
            if (error) throw Error(error.message)
            return BusinessUser.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetchByURLName(supabase: SupabaseClient<Database>, urlName: string) {
        try {
            const { data: row, error } = await supabase.from('business_users').select().eq('url_name', urlName).single()
            if (error) throw Error(error.message)
            return BusinessUser.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async getServices(supabase: SupabaseClient<Database, any>) {
        return await Service.fetch(supabase, this.id)
    }
    async getAvailabilities(supabase: SupabaseClient<Database, any>) {
        return await Availability.fetch(supabase, this.id)
    }
    async getClients(supabase: SupabaseClient<Database, any>) {
        return await Client.fetch(supabase, this.id)
    }
    async getBannedClients(supabase: SupabaseClient<Database, any>) {
        return await Client.fetchBannedClients(supabase, this.id)
    }
    async getAppointments(supabase: SupabaseClient<Database, any>) {
        return await Appointment.fetch(supabase, this.id)
    }
    async getConfirmedAppointments(supabase: SupabaseClient<Database, any>) {
        return await Appointment.fetchByStatus(supabase, this.id, 'CONFIRMED')
    }
    async getCancelledAppointments(supabase: SupabaseClient<Database, any>) {
        return await Appointment.fetchByStatus(supabase, this.id, 'CANCELLED')
    }
    async getPendingAppointments(supabase: SupabaseClient<Database, any>) {
        return await Appointment.fetchByStatus(supabase, this.id, 'PENDING')
    }
    async getProcessingAppointments(supabase: SupabaseClient<Database, any>) {
        return await Appointment.fetchByStatus(supabase, this.id, 'PROCESSING')
    }
    async getCompletedAppointments(supabase: SupabaseClient<Database, any>) {
        return await Appointment.fetchByStatus(supabase, this.id, 'COMPLETED')
    }
    async getNotifications(supabase: SupabaseClient<Database, any>) {
        return await Notification.fetch(supabase, this.id)
    }
    async getPolicy(supabase: SupabaseClient<Database, any>) {
        return await BusinessPolicy.fetch(supabase, this.id)
    }
}
