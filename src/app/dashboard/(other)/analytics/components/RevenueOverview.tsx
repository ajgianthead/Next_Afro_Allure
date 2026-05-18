'use client'

import { RevenueOverview, RevenueByMonth, FinancialSummary } from '../actions'
import { RevenueChart } from './RevenueChart'
import { fmt } from '../analytics-client'
import { InfoTooltip } from './InfoTooltip'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function GrowthBadge({ pct }: { pct: number | null }) {
    if (pct === null) return null
    const positive = pct >= 0
    return (
        <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
                backgroundColor: positive ? 'rgba(34,197,94,0.12)' : 'rgba(252,97,97,0.12)',
                color: positive ? '#16a34a' : '#FC6161',
            }}
        >
            {positive ? '+' : ''}{pct}%
        </span>
    )
}

interface Props {
    overview: RevenueOverview
    byMonth: RevenueByMonth[]
    financial: FinancialSummary
}

export function RevenueOverviewSection({ overview, byMonth, financial }: Props) {
    const stats = [
        {
            label: 'This Month',
            value: fmt(overview.total_this_month),
            hero: true,
            badge: <GrowthBadge pct={overview.revenue_growth_percent} />,
            tip: 'Total revenue collected from completed appointments this calendar month.',
        },
        {
            label: 'Last Month',
            value: fmt(overview.total_last_month),
            tip: 'Total revenue collected from completed appointments last calendar month.',
        },
        {
            label: 'This Year',
            value: fmt(overview.total_this_year),
            tip: 'Total revenue collected from completed appointments since January 1st.',
        },
        {
            label: 'All Time',
            value: fmt(financial.total_earned_all_time),
            tip: 'Total revenue collected across all completed appointments ever.',
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s, i) => (
                    <div
                        key={i}
                        className={`rounded-xl p-4 flex flex-col gap-2 ${s.hero ? 'col-span-2 lg:col-span-1' : ''}`}
                        style={{
                            backgroundColor: s.hero ? '#0F0E0E' : '#FFFFFF',
                            border: s.hero ? 'none' : '1px solid #E8E2D6',
                        }}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                                <p className="text-[11px] font-medium" style={{ color: s.hero ? 'rgba(255,255,255,0.6)' : '#6F6863' }}>
                                    {s.label}
                                </p>
                                <InfoTooltip text={s.tip} />
                            </div>
                            {s.badge}
                        </div>
                        <p
                            className="text-xl font-semibold leading-none"
                            style={{ fontFamily: SERIF, color: s.hero ? '#FFFFFF' : '#1A1818' }}
                        >
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Line chart */}
            <div className="rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>
                    Revenue — Last 12 Months
                </p>
                <RevenueChart data={byMonth} />
            </div>

            {/* Insight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                    <div className="flex items-center gap-1 mb-1">
                        <p className="text-[11px] font-medium" style={{ color: '#6F6863' }}>Avg per Appointment</p>
                        <InfoTooltip text="Average revenue earned per completed appointment, across all time." />
                    </div>
                    <p className="text-lg font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                        {fmt(overview.average_per_appointment)}
                    </p>
                </div>
                <div className="rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                    <div className="flex items-center gap-1 mb-1">
                        <p className="text-[11px] font-medium" style={{ color: '#6F6863' }}>Deposits Collected</p>
                        <InfoTooltip text="Sum of all deposit amounts collected from clients at the time of booking." />
                    </div>
                    <p className="text-lg font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                        {fmt(overview.total_deposits_collected)}
                    </p>
                </div>
                <div
                    className="rounded-xl p-4"
                    style={{
                        border: `1px solid ${overview.total_outstanding > 0 ? '#F59E0B' : '#E8E2D6'}`,
                        backgroundColor: overview.total_outstanding > 0 ? 'rgba(245,158,11,0.06)' : '#FFFFFF',
                    }}
                >
                    <div className="flex items-center gap-1 mb-1">
                        <p className="text-[11px] font-medium" style={{ color: '#6F6863' }}>Outstanding Balances</p>
                        <InfoTooltip text="Money owed by clients for confirmed or completed appointments that haven't been fully paid yet." />
                    </div>
                    <p
                        className="text-lg font-semibold"
                        style={{ fontFamily: SERIF, color: overview.total_outstanding > 0 ? '#B45309' : '#1A1818' }}
                    >
                        {fmt(overview.total_outstanding)}
                    </p>
                </div>
            </div>
        </div>
    )
}
