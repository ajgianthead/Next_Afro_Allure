import { StackedCards } from '@components/dashboard/Overview'
import { createClient } from '@/app/utils/supabase/server'
import { fetchDashboardAnalytics, fetchUser, getDashboardGrowth } from './actions'
import { DateTime } from 'luxon'

export default async function Dashboard() {
    const user = await fetchUser()
    const supabase = await createClient()

    const { data: businessData } = await supabase
        .from('business_users')
        .select('*')
        .eq('user_id', user!.id)
        .single()

    if (!businessData) return null

    const businessId = businessData.business_id
    const weekStart = DateTime.now().startOf('week')
    const weekEnd = DateTime.now().endOf('week')

    const monthStart = DateTime.now().startOf('month')

    const [weekRes, upcomingRes, dashboardAnalytics, growth, monthlyCountRes] = await Promise.all([
        // All appointments this week (all statuses) — powers week strip, today's schedule, pending alert
        supabase
            .from('appointments')
            .select('*')
            .eq('business', businessId)
            .gte('start', weekStart.toISO())
            .lte('start', weekEnd.toISO())
            .order('start', { ascending: true }),
        // Next confirmed appointments after this week — powers upcoming list
        supabase
            .from('appointments')
            .select('*')
            .eq('business', businessId)
            .eq('status', 'CONFIRMED')
            .gt('start', weekEnd.toISO())
            .order('start', { ascending: true })
            .limit(5),
        fetchDashboardAnalytics(businessId),
        getDashboardGrowth(businessId),
        // Monthly booking count — powers booking limit banner + upgrade card
        supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('business', businessId)
            .neq('status', 'CANCELLED')
            .gte('created_at', monthStart.toISO()),
    ])

    return (
        <div>
            <main>
                <div className="p-6">
                    <StackedCards
                        weekAppointments={weekRes.data ?? []}
                        upcomingAppointments={upcomingRes.data ?? []}
                        businessData={businessData}
                        dashboardAnalytics={dashboardAnalytics}
                        growth={growth.data?.[0] ?? null}
                        monthlyBookingCount={monthlyCountRes.count ?? 0}
                        planType={businessData.plan_type ?? 'STARTER'}
                    />
                </div>
            </main>
        </div>
    )
}
