import { StackedCards } from '@components/dashboard/Overview';
import Orders from '@components/dashboard/OrdersTable';
import { TwoAreasChart } from '@components/dashboard/AreaCharts';
import { SimpleBarChart } from '@components/dashboard//BarChart';
import { Traffic } from '@components/dashboard/Traffic';
import { StackedAreaChart } from '@components/dashboard/StackedAreas';
import { createClient } from '@/app/utils/supabase/server';
import { Database } from '../../../../lib/database.types';
import { fetchDashboardAnalytics, fetchUser, getDashboardGrowth } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import { DateTime } from 'luxon';

export default async function Dashboard() {
    const user = await fetchUser()
    const fetchData = async () => {
        const supabase = await createClient<Database>();
        const { data: businessData } = await supabase.from('business_users').select("*").eq('user_id', user!.id).single()
        let { data, error: supabaseError } = await supabase
            .from('appointments')
            .select(`*`)
            .eq('business', businessData?.business_id!).eq('status', 'CONFIRMED').gte('end', DateTime.now().toISO()).order('start', { ascending: true }).limit(5);
        if (supabaseError) {
            return supabaseError
        }
        return { appointments: data, businessData: businessData }
    }
    const res = await fetchData()

    if (!(res instanceof PostgrestError)) {
        const dashboardAnalytics = await fetchDashboardAnalytics(res.businessData?.business_id!)
        const growth = await getDashboardGrowth(res.businessData?.business_id!)
        return (

            <div>
                <main>
                    <div className="p-6">
                        <StackedCards growth={growth.data![0]} dashboardAnalytics={dashboardAnalytics} businessData={res.businessData!} appointments={res.appointments!} />
                    </div>
                </main>
            </div>

        );
    }

}
