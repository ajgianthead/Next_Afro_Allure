'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '../utils/supabase/server'
import { createAdminClient } from '../utils/supabase/admin'
import { Database } from '../../../lib/database.types'
import { Time } from '@internationalized/date'
import { stripe } from '@/lib/stripe/stripeClient'
import { createSubscriptionCheckout } from 'app/for-businesses/actions'
import Stripe from 'stripe'
import { BusinessUser } from '@lib/businessUser/BusinessUser'


export const createBusinessUser = async (email: string, name: string, password: string, marketingOptIn: boolean = false) => {
    try {
        const supabase = await createClient()
        const headerList = await headers()
        const ipAddress = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
        const businessUser = await BusinessUser.create(supabase, email, password, name, marketingOptIn, ipAddress)

        // This is the main signup path (the ad-funnel path has its own
        // specialty/city/service wizard that sets is_onboarded itself on
        // completion — don't touch that one). Without this, is_onboarded
        // stays false forever for anyone who signs up here, which silently
        // disables every dashboard product tour (they're all gated on it).
        // Service role: right after signUp there may be no session yet (email
        // confirmation), and row-level security would block the update.
        await createAdminClient()
            .from('business_users')
            .update({ is_onboarded: true })
            .eq('business_id', businessUser.id)

        return businessUser.toClient()
    } catch (error: any) {
        return Error(error.message)
    }

}
export const loginBusinessUser = async (email: string, password: string) => {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw Error(error.message)
        if (data.user?.user_metadata?.account_type !== 'business') {
            await supabase.auth.signOut()
            throw Error('No business account found for this email.')
        }
        return data
    } catch (error: any) {
        return Error(error.message)
    }
}


export const signOutAction = async () => {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    redirect('/login')
}
