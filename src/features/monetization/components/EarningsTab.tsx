'use client'

import {
    ConnectBalances,
    ConnectPayments,
    ConnectPayoutsList,
    ConnectReportingChart,
} from '@stripe/react-connect-js'

export function EarningsTab() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    return (
        <div className="flex gap-2 flex-col pb-5 mt-2">
            <div className="w-full border border-border rounded p-5">
                <ConnectBalances />
            </div>
            <div className="w-full flex md:flex-row flex-col gap-2">
                <div className="md:w-1/2 w-full p-5 border border-border rounded">
                    <ConnectReportingChart
                        reportName="net_volume"
                        intervalStart={ninetyDaysAgo}
                        intervalEnd={new Date()}
                        intervalType="day"
                    />
                </div>
                <div className="md:w-1/2 flex flex-col gap-5 w-full p-5 border border-border rounded">
                    <p className="text-sm font-medium">Payments</p>
                    <ConnectPayments />
                </div>
            </div>
            <div className="w-full flex flex-col gap-5 p-5 border border-border rounded">
                <p className="text-sm font-medium">Payouts</p>
                <ConnectPayoutsList />
            </div>
        </div>
    )
}
