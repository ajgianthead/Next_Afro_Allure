import { createAdminClient } from '@/app/utils/supabase/admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// All admin reads/writes use the service-role client (bypasses RLS) —
// access is already gated server-side to the founder's email alone in
// src/app/admin/layout.tsx, so this doesn't depend on per-row RLS policies
// existing for every table the dashboard touches.

export async function getBusinessCounts() {
    const supabase = createAdminClient()
    const { data } = await supabase.from('business_users').select('subscription_status, subscription_plan')
    const beta = data?.filter(b => !b.subscription_status || b.subscription_status === 'beta').length ?? 0
    const trial = data?.filter(b => b.subscription_status === 'trialing').length ?? 0
    const paying = data?.filter(b => b.subscription_status === 'active').length ?? 0
    const churned = data?.filter(b => b.subscription_status === 'canceled').length ?? 0
    return { beta, trial, paying, churned, total: data?.length ?? 0 }
}

export async function getActivityFeed() {
    const supabase = createAdminClient()
    const { data } = await supabase
        .from('business_users')
        .select('business_id, business_name, email, created_at, subscription_plan, subscription_status')
        .order('created_at', { ascending: false })
        .limit(50)
    return data ?? []
}

export async function getAllBusinesses() {
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
}

export async function getCurrentMRR() {
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
}

export async function getPlatformFeeIncome() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const fees = await stripe.applicationFees.list({ limit: 100, created: { gte: Math.floor(startOfMonth.getTime() / 1000) } })
    const thisMonth = fees.data.reduce((sum, f) => sum + f.amount / 100, 0)
    const allFees = await stripe.applicationFees.list({ limit: 100 })
    const allTime = allFees.data.reduce((sum, f) => sum + f.amount / 100, 0)
    return { thisMonth, allTime }
}

export async function getRecentStripeEvents() {
    const events = await stripe.events.list({
        limit: 20,
        types: ['customer.subscription.created', 'customer.subscription.deleted', 'customer.subscription.updated', 'invoice.payment_failed'],
    })
    return events.data
}

export async function getFailedPayments() {
    const invoices = await stripe.invoices.list({ status: 'open', limit: 10 })
    return invoices.data.filter(inv => inv.attempt_count > 0)
}

export async function getMRRHistory() {
    const months = []
    for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const start = new Date(date.getFullYear(), date.getMonth(), 1)
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        const charges = await stripe.charges.list({
            limit: 100,
            created: { gte: Math.floor(start.getTime() / 1000), lte: Math.floor(end.getTime() / 1000) },
        })
        const total = charges.data
            .filter(c => c.status === 'succeeded' && !c.refunded)
            .reduce((sum, c) => sum + c.amount / 100, 0)
        months.push({ month: start.toLocaleString('default', { month: 'short', year: 'numeric' }), mrr: total })
    }
    return months
}

export async function getAllFeedback() {
    const supabase = createAdminClient()
    const { data } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
    return data ?? []
}

export async function getAllSupportTickets() {
    const supabase = createAdminClient()
    const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })
    return data ?? []
}
