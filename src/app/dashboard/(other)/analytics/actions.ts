'use server'
import { createClient } from '@/app/utils/supabase/server'
import { getActualPlatformFees } from './stripeActions'

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
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_revenue_overview', { p_business_id: businessId })
    if (error) throw new Error(`Revenue overview failed: ${error.message}`)
    return data[0] as RevenueOverview
}

export async function getRevenueByMonth(businessId: string): Promise<RevenueByMonth[]> {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_revenue_by_month', { p_business_id: businessId })
    if (error) throw new Error(`Revenue by month failed: ${error.message}`)
    return data as unknown as RevenueByMonth[]
}

export async function getBookingPerformance(businessId: string): Promise<BookingPerformance> {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_booking_performance', { p_business_id: businessId })
    if (error) throw new Error(`Booking performance failed: ${error.message}`)
    return data[0] as unknown as BookingPerformance
}

export async function getServiceAnalytics(businessId: string): Promise<ServiceAnalytics[]> {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_service_analytics', { p_business_id: businessId })
    if (error) throw new Error(`Service analytics failed: ${error.message}`)
    return data as unknown as ServiceAnalytics[]
}

export async function getClientAnalytics(businessId: string): Promise<ClientAnalytics> {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_client_analytics', { p_business_id: businessId })
    if (error) throw new Error(`Client analytics failed: ${error.message}`)
    return data[0] as unknown as ClientAnalytics
}

export async function getClientList(businessId: string): Promise<ClientListItem[]> {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_client_list', { p_business_id: businessId })
    if (error) throw new Error(`Client list failed: ${error.message}`)
    return data as unknown as ClientListItem[]
}

export async function getGrowthTrends(businessId: string): Promise<GrowthTrends> {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_growth_trends', { p_business_id: businessId })
    if (error) throw new Error(`Growth trends failed: ${error.message}`)
    return data[0] as unknown as GrowthTrends
}

export async function getFinancialSummary(businessId: string): Promise<FinancialSummary> {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_financial_summary', { p_business_id: businessId })
    if (error) throw new Error(`Financial summary failed: ${error.message}`)
    return data[0] as unknown as FinancialSummary
}

// ─── Aggregator ───────────────────────────────────────────────────────────────

export async function getAnalyticsPageData(businessId: string) {
    const [overview, byMonth, booking, service, client, clientList, growth, financial, platformFees] =
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
        ])
    return { overview, byMonth, booking, service, client, clientList, growth, financial, platformFees }
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsPageData>>
