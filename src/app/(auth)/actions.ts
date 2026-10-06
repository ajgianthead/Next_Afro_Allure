'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '../utils/supabase/server'
import { createAdminClient } from '../utils/supabase/admin'
import { Database } from '../../../lib/database.types'
import { Time } from '@internationalized/date'
import { stripe } from '@/lib/stripe/stripeClient'
import type { BillingInterval } from '@/features/billing/plans'
import Stripe from 'stripe'
import { BusinessUser } from '@lib/businessUser/BusinessUser'


// Server actions return plain { ok, error } objects: in production Next.js
// hides the message of any Error passed to the browser, so a failed login or
// signup only showed "An error occurred in the Server Components render".
export type AuthActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

export const createBusinessUser = async (email: string, name: string, password: string, marketingOptIn: boolean = false, interval: BillingInterval = 'month'): Promise<AuthActionResult<ReturnType<BusinessUser['toClient']>>> => {
    try {
        const supabase = await createClient()
        const headerList = await headers()
        const ipAddress = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
        const businessUser = await BusinessUser.create(supabase, email, password, name, marketingOptIn, ipAddress, interval === 'year' ? 'year' : 'month')

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

        return { ok: true, data: businessUser.toClient() }
    } catch (error: any) {
        console.error('Signup failed:', error)
        return { ok: false, error: error?.message || 'Could not create your account. Please try again.' }
    }

}
export const loginBusinessUser = async (email: string, password: string): Promise<AuthActionResult> => {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            console.error('Login failed:', error.message)
            return { ok: false, error: error.message }
        }
        if (data.user?.user_metadata?.account_type !== 'business') {
            await supabase.auth.signOut()
            return { ok: false, error: 'No business account found for this email.' }
        }
        // The session is set as a cookie; no need to send tokens to the browser.
        return { ok: true, data: undefined }
    } catch (error: any) {
        console.error('Login failed:', error)
        return { ok: false, error: error?.message || 'Something went wrong. Please try again.' }
    }
}


export const signOutAction = async () => {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    redirect('/login')
}
