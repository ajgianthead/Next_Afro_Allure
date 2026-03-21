'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../../utils/supabase/server'
import { Database } from '../../../lib/database.types'
import { Time } from '@internationalized/date'
import { stripe } from '../../lib/utils'
import { createSubscriptionCheckout } from 'app/for-businesses/actions'
import Stripe from 'stripe'
import { BusinessUser } from '@lib/businessUser/BusinessUser'


export const createBusinessUser = async (email: string, name: string, password: string) => {
    try {
        const supabase = createClient<Database>()
        const businessUser = await BusinessUser.create(supabase, email, password, name)
        return businessUser
    } catch (error: any) {
        return Error(error.message)
    }

}


