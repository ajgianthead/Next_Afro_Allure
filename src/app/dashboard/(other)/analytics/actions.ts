'use server'
import { requireBusinessOwner } from "@/lib/auth/requireBusinessOwner"
import { createClient } from '@/app/utils/supabase/server'
import { getActualPlatformFees } from './stripeActions'
import { DateTime } from 'luxon'
import { resolveTimezone } from '@/lib/timezone'

// ─── Return interfaces ────────────────────────────────────────────────────────

export interface RevenueOverview {
    total_this_month: number
    total_last_month: number
    total_last_3_months: number
    total_last_12_months: number
    total_this_year: number
    average_per_appointment: number
    best_month_amount: number
    best_month_date: string | null
    total_deposits_collected: number
    total_outstanding: number
    revenue_growth_percent: number | null
}

export interface RevenueByMonth {
    month: string
    month_label: string
    revenue: number
    booking_count: number
    average_ticket: number
}

export interface BookingPerformance {
    total_bookings_this_month: number
    total_bookings_last_month: number
    completion_rate: number | null
    cancellation_rate: number | null
    no_show_rate: number | null
    average_bookings_per_week: number | null
    busiest_day_of_week: string | null
    bookings_by_day: { day: string; count: number }[] | null
    bookings_by_hour: { hour: number; label: string; count: number }[] | null
}

export interface ServiceAnalytics {
    service_id: string | null
    service_name: string | null
    total_bookings: number
    total_revenue: number
    revenue_percent: number | null
    average_price: number
    cancellation_count: number
    repeat_client_count: number
    addon_revenue: number
}

export interface ClientAnalytics {
    total_unique_clients: number
    returning_clients: number
    one_time_clients: number
    retention_rate: number | null
    average_lifetime_value: number
    average_visits_per_client: number
    average_days_between_visits: number | null
    new_clients_this_month: number
    new_clients_last_month: number
    client_growth_percent: number | null
}

export interface ClientListItem {
    client_email: string
    client_name: string | null
    first_visit: string
    last_visit: string
    total_visits: number
    total_spent: number
    average_spend_per_visit: number | null
    days_since_last_visit: number | null
    average_days_between_visits: number | null
    is_loyal: boolean
    is_at_risk: boolean
    is_due_soon: boolean
    most_booked_service: string | null
    preferred_day: string | null
}

export interface GrowthTrends {
    revenue_this_month: number
    revenue_last_month: number
    revenue_mom_growth: number | null
    revenue_3month_avg: number | null
    projected_month_revenue: number
    best_growth_month: string | null
    clients_this_month: number
    clients_last_month: number
    clients_mom_growth: number | null
    bookings_this_month: number
    bookings_last_month: number
    bookings_mom_growth: number | null
    on_pace_vs_last_month: string
}

export interface FinancialSummary {
    total_earned_this_year: number
    total_earned_all_time: number
    total_deposits_this_year: number
    total_deposits_all_time: number
    total_outstanding_balances: number
    average_monthly_revenue: number
    months_active: number
    booking_count_this_year: number
    booking_count_all_time: number
}

// ─── Individual actions ───────────────────────────────────────────────────────

export async function getRevenueOverview(businessId: string): Promise<RevenueOverview> {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_revenue_overview', { p_business_id: businessId })
    if (error) throw new Error(`Revenue overview failed: ${error.message}`)
    return data[0] as RevenueOverview
}

export async function getRevenueByMonth(businessId: string): Promise<RevenueByMonth[]> {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_revenue_by_month', { p_business_id: businessId })
    if (error) throw new Error(`Revenue by month failed: ${error.message}`)
    return data as unknown as RevenueByMonth[]
}

export async function getBookingPerformance(businessId: string): Promise<BookingPerformance> {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_booking_performance', { p_business_id: businessId })
    if (error) throw new Error(`Booking performance failed: ${error.message}`)
    return data[0] as unknown as BookingPerformance
}

export async function getServiceAnalytics(businessId: string): Promise<ServiceAnalytics[]> {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_service_analytics', { p_business_id: businessId })
    if (error) throw new Error(`Service analytics failed: ${error.message}`)
    return data as unknown as ServiceAnalytics[]
}

export async function getClientAnalytics(businessId: string): Promise<ClientAnalytics> {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_client_analytics', { p_business_id: businessId })
    if (error) throw new Error(`Client analytics failed: ${error.message}`)
    return data[0] as unknown as ClientAnalytics
}

export async function getClientList(businessId: string): Promise<ClientListItem[]> {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_client_list', { p_business_id: businessId })
    if (error) throw new Error(`Client list failed: ${error.message}`)
    return data as unknown as ClientListItem[]
}

export async function getGrowthTrends(businessId: string): Promise<GrowthTrends> {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_growth_trends', { p_business_id: businessId })
    if (error) throw new Error(`Growth trends failed: ${error.message}`)
    return data[0] as unknown as GrowthTrends
}

export async function getFinancialSummary(businessId: string): Promise<FinancialSummary> {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_financial_summary', { p_business_id: businessId })
    if (error) throw new Error(`Financial summary failed: ${error.message}`)
    return data[0] as unknown as FinancialSummary
}

export interface OnlinePaymentTotals {
    thisYear: { amount: number; charges: number }
    allTime: { amount: number; charges: number }
}

/**
 * Money that actually went through Stripe (deposits and online balance
 * payments). Cash payments never touch Stripe, so they must not be included
 * when estimating Stripe processing fees — previously the estimate used all
 * revenue and every booking, so cash-only businesses were shown Stripe fees.
 */
export async function getOnlinePaymentTotals(businessId: string): Promise<OnlinePaymentTotals> {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('appointments')
        .select('start, paid_amount, paid_deposit, deposit_price, deposit_charge_id, service_paid, service_paid_type, service_charge_id')
        .eq('business', businessId)
        .or('paid_deposit.eq.true,service_paid_type.eq.PLATFORM')
    if (error) throw new Error(`Online payments failed: ${error.message}`)

    const startOfYear = DateTime.now().startOf('year')
    const totals: OnlinePaymentTotals = { thisYear: { amount: 0, charges: 0 }, allTime: { amount: 0, charges: 0 } }
    for (const a of data ?? []) {
        const depositOnline = !!a.paid_deposit && !!a.deposit_charge_id
        let amount = 0
        let charges = 0
        if (a.service_paid_type === 'PLATFORM') {
            amount = a.paid_amount ?? 0
            charges = (depositOnline ? 1 : 0) + (a.service_charge_id ? 1 : 0)
        } else if (depositOnline) {
            amount = Math.min(a.deposit_price ?? 0, a.paid_amount ?? 0) || (a.deposit_price ?? 0)
            charges = 1
        }
        if (amount <= 0) continue
        totals.allTime.amount += amount
        totals.allTime.charges += charges
        if (DateTime.fromISO(a.start) >= startOfYear) {
            totals.thisYear.amount += amount
            totals.thisYear.charges += charges
        }
    }
    return totals
}

/**
 * Projected revenue for the current month = what's been earned so far plus
 * what's still due on confirmed appointments booked for the rest of the
 * month. The old projection extrapolated the daily rate across the whole
 * month (e.g. $160 earned by the 3rd → ~$1,650 projected), which wildly
 * overstates early-month numbers.
 */
async function withBookedProjection(businessId: string, growth: GrowthTrends): Promise<GrowthTrends> {
    try {
        const supabase = await createClient()
        const { data: business } = await supabase
            .from('business_users')
            .select('account_settings')
            .eq('business_id', businessId)
            .single()
        const zone = resolveTimezone((business?.account_settings as any)?.timezone)
        const now = DateTime.now().setZone(zone)

        const { data: upcoming } = await supabase
            .from('appointments')
            .select('amount_due, service_paid')
            .eq('business', businessId)
            .eq('status', 'CONFIRMED')
            .gte('start', now.toUTC().toISO()!)
            .lte('start', now.endOf('month').toUTC().toISO()!)

        const scheduled = (upcoming ?? [])
            .filter(a => !a.service_paid)
            .reduce((sum, a) => sum + Math.max(0, a.amount_due ?? 0), 0)
        const projected = (growth.revenue_this_month ?? 0) + scheduled

        const last = growth.revenue_last_month ?? 0
        const pace = last === 0
            ? (projected > 0 ? 'ahead' : 'on track')
            : projected >= last * 1.05 ? 'ahead' : projected <= last * 0.95 ? 'behind' : 'on track'

        return { ...growth, projected_month_revenue: projected, on_pace_vs_last_month: pace }
    } catch (err) {
        console.error('[withBookedProjection]', err)
        return growth
    }
}

// ─── Aggregator ───────────────────────────────────────────────────────────────

export async function getAnalyticsPageData(businessId: string) {
    await requireBusinessOwner(businessId)
    const [overview, byMonth, booking, service, client, clientList, rawGrowth, financial, platformFees, onlinePayments] =
        await Promise.all([
            getRevenueOverview(businessId),
            getRevenueByMonth(businessId),
            getBookingPerformance(businessId),
            getServiceAnalytics(businessId),
            getClientAnalytics(businessId),
            getClientList(businessId),
            getGrowthTrends(businessId),
            getFinancialSummary(businessId),
            getActualPlatformFees(businessId),
            getOnlinePaymentTotals(businessId),
        ])
    const growth = await withBookedProjection(businessId, rawGrowth)
    return { overview, byMonth, booking, service, client, clientList, growth, financial, platformFees, onlinePayments }
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsPageData>>
