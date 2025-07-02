import { StackedCards } from '@components/dashboard/Overview';
import Orders from '@components/dashboard/OrdersTable';
import { TwoAreasChart } from '@components/dashboard/AreaCharts';
import { SimpleBarChart } from '@components/dashboard//BarChart';
import { Traffic } from '@components/dashboard/Traffic';
import { StackedAreaChart } from '@components/dashboard/StackedAreas';
import { createClient } from '@utils/supabase/server';
import { Database } from '../../../../lib/database.types';
import { fetchUser } from './actions';

export default async function Dashboard() {
    const user = await fetchUser()
    const fetchData = async () => {
        const supabase = createClient<Database>();
        const businessId = (await supabase.from('business_users').select("business_id").eq('user_id', user!.id).single()).data?.business_id
        let { data, error: supabaseError } = await supabase
            .from('appointments')
            .select(`*`)
            .eq('business', businessId!).eq('status', 'CONFIRMED').order('start', { ascending: true }).limit(5);
        if (supabaseError) {
            return supabaseError
        }
        return data
    }
    const appointments = await fetchData() as Appointment[]
    return (
        <>
            <div className="h-screen overflow-y-visible lg:flex">
                <main>
                    <div className=" p-6 lg:p-0 space-y-6">
                        <StackedCards appointments={appointments} />
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
