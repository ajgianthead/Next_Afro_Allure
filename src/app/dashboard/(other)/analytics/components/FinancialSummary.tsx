'use client'

import { FinancialSummary } from '../actions'
import { fmt } from '../analytics-client'
import { InfoTooltip } from './InfoTooltip'
import { PLATFORM_FEE_PERCENT } from '@/lib/fees'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function StatRow({
    label,
    value,
    highlight,
    tip,
}: {
    label: string
    value: string
    highlight?: 'amber' | 'muted'
    tip?: string
}) {
    const valueColor =
        highlight === 'amber' ? '#B45309' : highlight === 'muted' ? '#6F6863' : '#1A1818'
    return (
        <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #F0EBE3' }}>
            <div className="flex items-center gap-1">
                <p className="text-sm" style={{ color: '#6F6863' }}>{label}</p>
                {tip && <InfoTooltip text={tip} />}
            </div>
            <p className="text-sm font-semibold" style={{ fontFamily: SERIF, color: valueColor }}>{value}</p>
        </div>
    )
}

interface Props {
    financial: FinancialSummary
}

export function FinancialSummarySection({ financial }: Props) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* This Year */}
            <div className="flex-1 rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>
                    This Year
                </p>
                <StatRow
                    label="Gross Earned"
                    value={fmt(financial.total_earned_this_year)}
                    tip="Total paid_amount collected from all completed appointments this year."
                />
                <StatRow
                    label="Deposits"
                    value={fmt(financial.total_deposits_this_year)}
                    tip="Sum of all deposit amounts collected at booking this year."
                />
                <StatRow
                    label={`Platform Fees (${PLATFORM_FEE_PERCENT * 100}%)`}
                    value={fmt(financial.total_platform_fees_this_year)}
                    highlight="muted"
                    tip="Estimated AfroAllure platform fee of 3% on gross earnings this year."
                />
                <StatRow
                    label="Net Earnings"
                    value={fmt(financial.net_earnings_this_year)}
                    tip="Gross earned minus the 3% platform fee. Your estimated take-home this year."
                />
                {financial.total_outstanding_balances > 0 && (
                    <StatRow
                        label="Outstanding"
                        value={fmt(financial.total_outstanding_balances)}
                        highlight="amber"
                        tip="Money still owed by clients for confirmed or completed appointments not yet fully paid."
                    />
                )}
            </div>

            {/* All Time */}
            <div className="flex-1 rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>
                    All Time
                </p>
                <StatRow
                    label="Gross Earned"
                    value={fmt(financial.total_earned_all_time)}
                    tip="Total paid_amount collected from all completed appointments ever."
                />
                <StatRow
                    label="Deposits"
                    value={fmt(financial.total_deposits_all_time)}
                    tip="Sum of all deposit amounts collected at booking across all time."
                />
                <StatRow
                    label={`Platform Fees (${PLATFORM_FEE_PERCENT * 100}%)`}
                    value={fmt(financial.total_platform_fees_all_time)}
                    highlight="muted"
                    tip="Estimated AfroAllure platform fee of 3% on all-time gross earnings."
                />
                <StatRow
                    label="Net Earnings"
                    value={fmt(financial.net_earnings_all_time)}
                    tip="All-time gross earned minus the 3% platform fee."
                />
                <StatRow
                    label="Avg Monthly Revenue"
                    value={fmt(financial.average_monthly_revenue)}
                    tip="Average revenue per active month, based on all-time completed appointments."
                />
                <div className="pt-2.5">
                    <p className="text-[11px]" style={{ color: '#6F6863' }}>
                        Active for {financial.months_active} month{financial.months_active !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </div>
    )
}
