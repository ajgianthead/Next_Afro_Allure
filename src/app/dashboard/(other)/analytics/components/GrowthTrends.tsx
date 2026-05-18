'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { GrowthTrends } from '../actions'
import { fmt, fmtNum } from '../analytics-client'
import { InfoTooltip } from './InfoTooltip'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function MomRow({
    label,
    thisMonth,
    lastMonth,
    growth,
    isMoney,
    tip,
}: {
    label: string
    thisMonth: number
    lastMonth: number
    growth: number | null
    isMoney: boolean
    tip: string
}) {
    const display = (v: number) => (isMoney ? fmt(v) : fmtNum(v))
    const positive = growth !== null && growth > 0
    const negative = growth !== null && growth < 0

    return (
        <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: '1px solid #F0EBE3' }}>
            <div className="flex items-center gap-1">
                <p className="text-sm font-medium" style={{ color: '#1A1818' }}>{label}</p>
                <InfoTooltip text={tip} />
            </div>
            <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                    <p className="text-[11px]" style={{ color: '#6F6863' }}>vs last month</p>
                    <p className="text-xs" style={{ color: '#6F6863' }}>
                        {display(lastMonth)} → {display(thisMonth)}
                    </p>
                </div>
                {growth !== null ? (
                    <div className="flex items-center gap-1">
                        {positive ? (
                            <TrendingUp size={14} style={{ color: '#16a34a' }} />
                        ) : negative ? (
                            <TrendingDown size={14} style={{ color: '#FC6161' }} />
                        ) : (
                            <Minus size={14} style={{ color: '#6F6863' }} />
                        )}
                        <span
                            className="text-sm font-semibold"
                            style={{ color: positive ? '#16a34a' : negative ? '#FC6161' : '#6F6863' }}
                        >
                            {positive ? '+' : ''}{growth}%
                        </span>
                    </div>
                ) : (
                    <span className="text-sm" style={{ color: '#6F6863' }}>—</span>
                )}
            </div>
        </div>
    )
}

interface Props {
    growth: GrowthTrends
}

export function GrowthTrendsSection({ growth }: Props) {
    const paceBg =
        growth.on_pace_vs_last_month === 'ahead'
            ? 'rgba(34,197,94,0.08)'
            : growth.on_pace_vs_last_month === 'behind'
            ? 'rgba(252,97,97,0.08)'
            : 'rgba(201,151,74,0.08)'

    const paceBorder =
        growth.on_pace_vs_last_month === 'ahead'
            ? '#16a34a'
            : growth.on_pace_vs_last_month === 'behind'
            ? '#FC6161'
            : '#C9974A'

    const paceColor = paceBorder

    return (
        <div className="flex flex-col gap-4">
            {/* Projected revenue hero */}
            <div
                className="rounded-xl p-5"
                style={{ backgroundColor: '#0F0E0E' }}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                Projected This Month
                            </p>
                            <InfoTooltip text="Estimated total revenue for this month based on your daily earnings rate so far." />
                        </div>
                        <p className="text-2xl font-semibold" style={{ fontFamily: SERIF, color: '#FFFFFF' }}>
                            {fmt(growth.projected_month_revenue)}
                        </p>
                        {growth.revenue_3month_avg !== null && (
                            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                3-month avg: {fmt(growth.revenue_3month_avg)}
                            </p>
                        )}
                    </div>
                    <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize"
                        style={{ backgroundColor: paceBg, color: paceColor, border: `1px solid ${paceBorder}` }}
                    >
                        {growth.on_pace_vs_last_month}
                    </span>
                </div>
                {growth.best_growth_month && (
                    <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Best growth month: {growth.best_growth_month}
                    </p>
                )}
            </div>

            {/* MoM rows */}
            <div className="rounded-xl px-4" style={{ border: '1px solid #E8E2D6' }}>
                <MomRow
                    label="Revenue"
                    thisMonth={growth.revenue_this_month}
                    lastMonth={growth.revenue_last_month}
                    growth={growth.revenue_mom_growth}
                    isMoney
                    tip="Month-over-month change in completed appointment revenue compared to last month."
                />
                <MomRow
                    label="New Clients"
                    thisMonth={growth.clients_this_month}
                    lastMonth={growth.clients_last_month}
                    growth={growth.clients_mom_growth}
                    isMoney={false}
                    tip="Month-over-month change in unique active clients compared to last month."
                />
                <MomRow
                    label="Bookings"
                    thisMonth={growth.bookings_this_month}
                    lastMonth={growth.bookings_last_month}
                    growth={growth.bookings_mom_growth}
                    isMoney={false}
                    tip="Month-over-month change in total active bookings compared to last month."
                />
            </div>
        </div>
    )
}
