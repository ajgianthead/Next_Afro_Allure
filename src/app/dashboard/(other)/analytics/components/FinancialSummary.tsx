'use client'

import { FinancialSummary } from '../actions'
import { ActualPlatformFees } from '../stripeActions'
import { fmt } from '../analytics-client'
import { InfoTooltip } from './InfoTooltip'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function StatRow({
    label,
    value,
    highlight,
    tip,
    hero,
}: {
    label: string
    value: string
    highlight?: 'amber' | 'muted'
    tip?: string
    hero?: boolean
}) {
    const valueColor =
        highlight === 'amber' ? '#B45309' : highlight === 'muted' ? '#6F6863' : '#1A1818'
    return (
        <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #F0EBE3' }}>
            <div className="flex items-center gap-1">
                <p className="text-sm" style={{ color: '#6F6863' }}>{label}</p>
                {tip && <InfoTooltip text={tip} />}
            </div>
            <p
                style={{
                    fontFamily: hero ? SERIF : undefined,
                    fontSize: hero ? '1.125rem' : undefined,
                    fontWeight: hero ? 700 : 600,
                    color: valueColor,
                }}
                className={hero ? '' : 'text-sm font-semibold'}
            >
                {value}
            </p>
        </div>
    )
}

interface Props {
    financial: FinancialSummary
    platformFees: ActualPlatformFees
}

// Everything taken from a business's payouts — the 1% platform fee and card
// processing passed through at cost — is a Stripe application fee, so the
// real total comes straight from Stripe (platformFees). Businesses aren't
// billed by Stripe separately, so nothing else is subtracted. Cash payments
// have no fees.
const FEES_TIP = "1% AfroAllure fee + card processing (Stripe's 2.9% + $0.30, at cost) on payments clients made online. Actual amounts from Stripe. Cash payments have no fees."

export function FinancialSummarySection({ financial, platformFees }: Props) {
    const netThisYear = Math.max(0, financial.total_earned_this_year - platformFees.thisYear)
    const netAllTime = Math.max(0, financial.total_earned_all_time - platformFees.allTime)

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
                    label="Fees (platform + card processing)"
                    value={fmt(platformFees.thisYear)}
                    highlight="muted"
                    tip={FEES_TIP}
                />
                <StatRow
                    label="Net Earnings"
                    value={fmt(netThisYear)}
                    hero
                    tip="Gross earned minus the fees taken from your payouts."
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
                    label="Fees (platform + card processing)"
                    value={fmt(platformFees.allTime)}
                    highlight="muted"
                    tip={FEES_TIP}
                />
                <StatRow
                    label="Net Earnings"
                    value={fmt(netAllTime)}
                    hero
                    tip="Gross earned minus the fees taken from your payouts."
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
