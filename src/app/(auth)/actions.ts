'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '../utils/supabase/server'
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
