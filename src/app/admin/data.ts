import { createAdminClient } from '@/app/utils/supabase/admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// All admin reads/writes use the service-role client (bypasses RLS) —
// access is already gated server-side to the founder's email alone in
// src/app/admin/layout.tsx, so this doesn't depend on per-row RLS policies
// existing for every table the dashboard touches.
//
// Every exported function here is wrapped in its own try/catch with a safe
// fallback. page.tsx fetches all of these via a single Promise.all — without
// a per-function catch, any one of them throwing (a transient Stripe API
// hiccup, a rate limit, a schema mismatch) rejects the whole Promise.all and
// takes down the entire dashboard with a generic error screen instead of
// just that one section showing empty/zeroed data.
function safeLog(label: string, error: unknown) {
    console.error(`[admin/data] ${label} failed:`, error)
}

export async function getBusinessCounts() {
    try {
        const supabase = createAdminClient()
        const { data } = await supabase.from('business_users').select('subscription_status, subscription_plan')
        const beta = data?.filter(b => !b.subscription_status || b.subscription_status === 'beta').length ?? 0
        const trial = data?.filter(b => b.subscription_status === 'trialing').length ?? 0
        const paying = data?.filter(b => b.subscription_status === 'active').length ?? 0
        const churned = data?.filter(b => b.subscription_status === 'canceled').length ?? 0
        return { beta, trial, paying, churned, total: data?.length ?? 0 }
    } catch (error) {
        safeLog('getBusinessCounts', error)
        return { beta: 0, trial: 0, paying: 0, churned: 0, total: 0 }
    }
}

export async function getActivityFeed() {
    try {
        const supabase = createAdminClient()
        const { data } = await supabase
            .from('business_users')
            .select('business_id, business_name, email, created_at, subscription_plan, subscription_status')
            .order('created_at', { ascending: false })
            .limit(50)
        return data ?? []
    } catch (error) {
        safeLog('getActivityFeed', error)
        return []
    }
}

export async function getAllBusinesses() {
    try {
        const supabase = createAdminClient()
        const { data } = await supabase
            .from('business_users')
            .select('business_id, business_name, email, created_at, subscription_plan, subscription_status, marketing_opt_in, last_checkin_sent_at, total_booking_volume, is_onboarded')
            .order('created_at', { ascending: false })
        return (data ?? []).map(b => ({
            ...b,
            at_risk: b.subscription_status === 'active' && b.last_checkin_sent_at
                ? new Date(b.last_checkin_sent_at) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
                : false,
        }))
    } catch (error) {
        safeLog('getAllBusinesses', error)
        return []
    }
}

export async function getCurrentMRR() {
    try {
        const subscriptions = await stripe.subscriptions.list({ status: 'active', limit: 100, expand: ['data.items.data.price'] })
        let mrr = 0
        // Only one paid tier (Growth) exists today, so this buckets by whatever
        // the Stripe Price's nickname actually is rather than assuming fixed
        // Starter/Pro/Elite tiers that don't exist in this product.
        const byPlan: Record<string, number> = {}
        for (const sub of subscriptions.data) {
            for (const item of sub.items.data) {
                const price = item.price as Stripe.Price
                const amount = (price.unit_amount ?? 0) / 100
                mrr += amount
                const planName = price.nickname || 'Growth'
                byPlan[planName] = (byPlan[planName] ?? 0) + amount
            }
        }
        return { mrr, arr: mrr * 12, byPlan }
    } catch (error) {
        safeLog('getCurrentMRR', error)
        return { mrr: 0, arr: 0, byPlan: {} as Record<string, number> }
    }
}

export async function getPlatformFeeIncome() {
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const [fees, allFees] = await Promise.all([
            stripe.applicationFees.list({ limit: 100, created: { gte: Math.floor(startOfMonth.getTime() / 1000) } }),
            stripe.applicationFees.list({ limit: 100 }),
        ])
        const thisMonth = fees.data.reduce((sum, f) => sum + f.amount / 100, 0)
        const allTime = allFees.data.reduce((sum, f) => sum + f.amount / 100, 0)
        return { thisMonth, allTime }
    } catch (error) {
        safeLog('getPlatformFeeIncome', error)
        return { thisMonth: 0, allTime: 0 }
    }
}

export async function getRecentStripeEvents() {
    try {
        const events = await stripe.events.list({
            limit: 20,
            types: ['customer.subscription.created', 'customer.subscription.deleted', 'customer.subscription.updated', 'invoice.payment_failed'],
        })
        return events.data
    } catch (error) {
        safeLog('getRecentStripeEvents', error)
        return []
    }
}

export async function getFailedPayments() {
    try {
        const invoices = await stripe.invoices.list({ status: 'open', limit: 10 })
        return invoices.data.filter(inv => inv.attempt_count > 0)
    } catch (error) {
        safeLog('getFailedPayments', error)
        return []
    }
}

export async function getMRRHistory() {
    try {
        const now = new Date()
        // Was 6 sequential Stripe calls (one per month, awaited in a loop) —
        // harmless against an empty test account, but a real, slower
        // production round-trip per call. Parallelized.
        const months = await Promise.all(
            Array.from({ length: 6 }, (_, idx) => 5 - idx).map(async (i) => {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const start = new Date(date.getFullYear(), date.getMonth(), 1)
                const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
                const charges = await stripe.charges.list({
                    limit: 100,
                    created: { gte: Math.floor(start.getTime() / 1000), lte: Math.floor(end.getTime() / 1000) },
                })
                const total = charges.data
                    .filter(c => c.status === 'succeeded' && !c.refunded)
                    .reduce((sum, c) => sum + c.amount / 100, 0)
                return { month: start.toLocaleString('default', { month: 'short', year: 'numeric' }), mrr: total }
            })
        )
        return months
    } catch (error) {
        safeLog('getMRRHistory', error)
        return []
    }
}

export async function getAllFeedback() {
    try {
        const supabase = createAdminClient()
        const { data } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false })
        return data ?? []
    } catch (error) {
        safeLog('getAllFeedback', error)
        return []
    }
}

export async function getAllSupportTickets() {
    try {
        const supabase = createAdminClient()
        const { data } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })
        return data ?? []
    } catch (error) {
        safeLog('getAllSupportTickets', error)
        return []
    }
}
