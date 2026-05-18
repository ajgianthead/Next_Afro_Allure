'use server'

import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/stripeClient'
import { createClient } from '@/app/utils/supabase/server'

export interface ActualPlatformFees {
    thisMonth: number
    thisYear: number
    allTime: number
}

async function paginateFees(
    params: Stripe.ApplicationFeeListParams
): Promise<Stripe.ApplicationFee[]> {
    const results: Stripe.ApplicationFee[] = []
    let startingAfter: string | undefined = undefined

    while (true) {
        const listParams: Stripe.ApplicationFeeListParams = { ...params, limit: 100 }
        if (startingAfter) listParams.starting_after = startingAfter

        const page = await stripe.applicationFees.list(listParams)
        results.push(...page.data)

        if (!page.has_more) break
        startingAfter = page.data[page.data.length - 1].id
    }

    return results
}

export async function getActualPlatformFees(businessId: string): Promise<ActualPlatformFees> {
    try {
        const supabase = await createClient()
        const { data } = await supabase
            .from('business_users')
            .select('stripe_acc_id')
            .eq('business_id', businessId)
            .single()

        const stripeAccId = data?.stripe_acc_id
        if (!stripeAccId) return { thisMonth: 0, thisYear: 0, allTime: 0 }

        const startOfYear = new Date(new Date().getFullYear(), 0, 1)
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

        const [yearFees, allTimeFees] = await Promise.all([
            paginateFees({ created: { gte: Math.floor(startOfYear.getTime() / 1000) } }),
            paginateFees({}),
        ])

        const yearFiltered = yearFees.filter(fee => fee.account === stripeAccId)
        const thisYear = yearFiltered.reduce((sum, fee) => sum + fee.amount, 0)
        const thisMonth = yearFiltered
            .filter(fee => fee.created * 1000 >= startOfMonth.getTime())
            .reduce((sum, fee) => sum + fee.amount, 0)

        const allTime = allTimeFees
            .filter(fee => fee.account === stripeAccId)
            .reduce((sum, fee) => sum + fee.amount, 0)

        return { thisMonth, thisYear, allTime }
    } catch (err) {
        console.error('[getActualPlatformFees]', err)
        return { thisMonth: 0, thisYear: 0, allTime: 0 }
    }
}
