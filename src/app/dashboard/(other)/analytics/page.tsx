import { DateTime } from "luxon";
import { GA4ReportRow, runPageViewReport, runTotalReport, runTrafficSourceReport } from "../../../../../lib/analytics";
import { fetchBusinessUser, fetchUser } from "../actions";
import AnalyticsClient from "./analyticsClient";
import { createClient } from "@utils/supabase/server";
import { Database } from "../../../../../lib/database.types";
import { formatAppointmentAnalyticalData } from "./actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function Page() {

    const user = await fetchUser()
    if (user) {
        const business_user = await fetchBusinessUser(user?.id!)

        const endOfTheDayToday = DateTime.now().endOf('day').toISO()
        const pastNinetyDays = DateTime.now().minus({ month: 3 }).toISO()

        const pageViewData = await runPageViewReport({ dateRanges: [{ startDate: DateTime.now().startOf('month').toFormat('yyyy-LL-dd'), endDate: 'today' }], businessName: business_user.business_name })

        const supabase = createClient<Database>()
        const { data, error } = await supabase.from('appointments').select("*").eq('business', business_user.business_id).neq('status', 'PENDING')
            .neq('status', 'DENIED')
            .neq('status', 'PROCESSING').gt('created_at', pastNinetyDays).lt('created_at', endOfTheDayToday)

        const { data: completedAppointments, error: completedAppointmentsError }: any = await supabase.from('appointments').select().eq('business', business_user.business_id).eq('status', 'COMPLETED').gte('created_at', DateTime.now().startOf('month').toISO()).lte('created_at', endOfTheDayToday)
        if (data?.length) {
            const countMap = new Map<string, any[]>()
            for (let i = 0; i < completedAppointments.length; i++) {
                let totalCharged = completedAppointments[i].service_data!.price / 100
                const addons = completedAppointments[i].selected_addons
                if (addons.length) {
                    let totalAddonPrice = 0
                    addons.forEach((addon: any) => {
                        totalAddonPrice += addon.price / 100
                    })
                    totalCharged += totalAddonPrice

                }
                if (!countMap.has(completedAppointments[i].id)) {
                    countMap.set(completedAppointments[i].id, [1, totalCharged, completedAppointments[i].service_data.name])
                }
                else {
                    let val = countMap.get(completedAppointments[i].id)
                    countMap.set(completedAppointments[i].id, [(val![0] + 1), totalCharged, completedAppointments[i].service_data.name])
                }
            }
            const result = await formatAppointmentAnalyticalData(data!)
            const thisMonthsBookings = result.filter((booking) => booking.name === DateTime.now().toFormat("LLLL"))[0].Bookings
            const completedRate = (completedAppointments?.length! / thisMonthsBookings) * 100
            const res = await runTrafficSourceReport({
                businessId: business_user.business_id, businessName: business_user.business_name, dateRanges: [{
                    startDate: DateTime.now().minus({ month: 3 }).toFormat('yyyy-LL-dd'),
                    endDate: DateTime.now().endOf('day').toFormat('yyyy-LL-dd')
                }]
            })
            let webTrafficSourceData: {
                name: string;
                value: number | string;
                color?: string;
            }[] = []
            res.forEach((obj: GA4ReportRow) => {
                webTrafficSourceData.push({
                    name: obj.sessionSource === '(direct)' ? 'Organic' : 'Other',
                    value: obj.activeUsers,
                    color: '#FC6161'
                })
            })
            return <AnalyticsClient webTrafficData={webTrafficSourceData} serviceCountMap={countMap} appointmentCompletionRate={completedRate} appointments={data!} business_user={business_user} pageViews={pageViewData} monthlyBookings={thisMonthsBookings} defaultMonthlyAppointmentsData={result} />;
        }

        return <AnalyticsClient appointmentCompletionRate={0} appointments={[]} business_user={business_user} pageViews={pageViewData} monthlyBookings={0} defaultMonthlyAppointmentsData={[]} />;
    } else {
        redirect('/login')
    }


}
