'use client'
import { useState } from 'react';
import { StackedCards } from '@components/dashboard/Overview';
import Orders from '@components/dashboard/OrdersTable';
import { TwoAreasChart } from '@components/dashboard/AreaCharts';
import { SimpleBarChart } from '@components/dashboard//BarChart';
import { Traffic } from '@components/dashboard/Traffic';
import { StackedAreaChart } from '@components/dashboard/StackedAreas';


export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <>
            <div className="h-screen overflow-visible lg:flex">
                <main>
                    <div className="p-6 space-y-6">
                        <StackedCards />
                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
