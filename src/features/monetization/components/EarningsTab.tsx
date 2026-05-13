'use client'

import {
    ConnectBalances,
    ConnectPayments,
    ConnectPayoutsList,
    ConnectReportingChart,
} from '@stripe/react-connect-js'

function SectionCard({ label, children, className }: { label?: string; children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`w-full rounded-2xl overflow-hidden ${className ?? ''}`}
            style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
        >
            {label && (
                <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid #F0EBE3' }}>
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>
                        {label}
                    </p>
                </div>
            )}
            <div className="p-4 sm:p-5">{children}</div>
        </div>
    )
}

export function EarningsTab() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    return (
        <div className="flex gap-3 flex-col pb-6 mt-3">
            <SectionCard>
                <ConnectBalances />
            </SectionCard>

            <div className="flex flex-col sm:flex-row gap-3">
                <SectionCard label="Net Volume (90 days)" className="sm:flex-1">
                    <ConnectReportingChart
                        reportName="net_volume"
                        intervalStart={ninetyDaysAgo}
                        intervalEnd={new Date()}
                        intervalType="day"
                    />
                </SectionCard>
                <SectionCard label="Recent Payments" className="sm:flex-1">
                    <ConnectPayments />
                </SectionCard>
            </div>

            <SectionCard label="Payout History">
                <ConnectPayoutsList />
            </SectionCard>
        </div>
    )
}
