import { StackedCards } from '@components/dashboard/Overview';
import Orders from '@components/dashboard/OrdersTable';
import { TwoAreasChart } from '@components/dashboard/AreaCharts';
import { SimpleBarChart } from '@components/dashboard//BarChart';
import { Traffic } from '@components/dashboard/Traffic';
import { StackedAreaChart } from '@components/dashboard/StackedAreas';
import { createClient } from '@utils/supabase/server';
import { Database } from '../../../../lib/database.types';
import { fetchUser } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import { DateTime } from 'luxon';

export default async function Dashboard() {
    const user = await fetchUser()
    const fetchData = async () => {
        const supabase = createClient<Database>();
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
        return (
            <>
                <div className="h-screen overflow-y-visible lg:flex">
                    <main>
                        <div className=" p-6 lg:p-0 space-y-6">
                            <StackedCards businessData={res.businessData!} appointments={res.appointments!} />
                            {/* <div className="mt-6 lg:w-[calc(100vw-20rem)] grid gap-6 lg:grid-cols-2">
                            <TwoAreasChart />
                            <SimpleBarChart />
                            <Traffic />
                            <StackedAreaChart />
                        </div>
                        <Orders /> */}
                        </div>
                    </main>
                </div>
            </>
        );
    }

}
