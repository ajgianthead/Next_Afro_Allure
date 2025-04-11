'use client'
import { StackedCards } from '@components/dashboard/Overview';
import Orders from '@components/dashboard/OrdersTable';
import { TwoAreasChart } from '@components/dashboard/AreaCharts';
import { SimpleBarChart } from '@components/dashboard//BarChart';
import { Traffic } from '@components/dashboard/Traffic';
import { StackedAreaChart } from '@components/dashboard/StackedAreas';


export default function App() {
    return (
        <>
            <div className="h-screen overflow-y-visible lg:flex">
                <main>
                    <div className=" p-6 lg:p-0 space-y-6">
                        <StackedCards />
                        <div className="mt-6 lg:w-[calc(100vw-20rem)] grid gap-6 lg:grid-cols-2">
                            <TwoAreasChart />
                            <SimpleBarChart />
                            <Traffic />
                            <StackedAreaChart />
                        </div>
                        <Orders />
                    </div>
                </main>
            </div>
        </>
    );
}
