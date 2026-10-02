'use client'

import { DateTime } from 'luxon'
import { REFUND_REASONS, RefundRecord, RefundRowStatus } from '../types'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const MONO = 'ui-monospace, monospace'

const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

const STATUS_CONFIG: Record<RefundRowStatus, { bg: string; text: string; label: string }> = {
    succeeded:       { bg: 'rgba(34,197,94,0.1)',   text: '#15803D', label: 'Refunded' },
    pending:         { bg: 'rgba(201,151,74,0.1)',  text: '#C9974A', label: 'Processing' },
    requires_action: { bg: 'rgba(201,151,74,0.1)',  text: '#C9974A', label: 'Processing' },
    failed:          { bg: 'rgba(252,97,97,0.08)',  text: '#DC2626', label: 'Failed' },
    canceled:        { bg: 'rgba(217,201,176,0.3)', text: '#6F6863', label: 'Canceled' },
}

const reasonLabel = (reason: string | null) =>
    REFUND_REASONS.find(r => r.value === reason)?.label ?? null

export function RefundHistory({ refunds }: { refunds: RefundRecord[] }) {
    if (refunds.length === 0) return null

    return (
        <div className="flex flex-col gap-2">
            {refunds.map(refund => {
                const config = STATUS_CONFIG[refund.status] ?? STATUS_CONFIG.pending
                const reason = reasonLabel(refund.reason)
                return (
                    <div
                        key={refund.id}
                        className="flex flex-col gap-1 rounded-xl px-3 py-2.5"
                        style={{ border: '1px solid #F0EBE3' }}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm" style={{ color: '#1A1818' }}>
                                {refund.chargeType === 'DEPOSIT' ? 'Deposit' : 'Balance payment'}
                            </span>
                            <div className="flex items-center gap-2">
                                <span
                                    className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                                    style={{ backgroundColor: config.bg, color: config.text }}
                                >
                                    {config.label}
                                </span>
                                <span style={{
                                    fontFamily: SERIF, fontSize: 14,
                                    color: refund.status === 'failed' || refund.status === 'canceled' ? '#9A9088' : '#1A1818',
                                    textDecoration: refund.status === 'failed' || refund.status === 'canceled' ? 'line-through' : 'none',
                                }}>
                                    −{fmt(refund.amount)}
                                </span>
                            </div>
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 11, color: '#6F6863' }}>
                            {DateTime.fromISO(refund.createdAt).toFormat('LLL d, yyyy · h:mm a')}
                            {reason ? ` · ${reason}` : ''}
                        </span>
                        {refund.note && (
                            <p className="text-xs" style={{ color: '#6F6863' }}>{refund.note}</p>
                        )}
                        {refund.status === 'failed' && refund.failureReason && (
                            <p className="text-xs" style={{ color: '#DC2626' }}>
                                {refund.failureReason.replace(/_/g, ' ')}
                            </p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
