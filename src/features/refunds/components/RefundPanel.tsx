'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowLeft, Info, Loader2 } from 'lucide-react'
import { getRefundSummaryAction, issueRefundAction } from '../server'
import {
    IssueRefundResult,
    REFUND_NOTE_MAX_LENGTH,
    REFUND_REASONS,
    RefundReason,
    RefundScope,
    RefundSummary,
} from '../types'
import { RefundHistory } from './RefundHistory'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

const newRequestId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

/** "12.50" / "$12.5" → 1250 cents; anything unparseable → 0. */
const parseDollars = (value: string) => {
    const n = Number(value.replace(/[$,\s]/g, ''))
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0
}

type SuccessResult = Extract<IssueRefundResult, { ok: true }>

interface Props {
    appointmentId: string
    onBack: () => void
    onRefunded: (result: SuccessResult) => void
}

export function RefundPanel({ appointmentId, onBack, onRefunded }: Props) {
    const [summary, setSummary] = useState<RefundSummary | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [scope, setScope] = useState<RefundScope>('FULL')
    const [customAmount, setCustomAmount] = useState('')
    const [reason, setReason] = useState<RefundReason>('requested_by_customer')
    const [note, setNote] = useState('')
    const [alsoCancel, setAlsoCancel] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // One id per refund attempt → Stripe idempotency key. Kept across a
    // network failure (so a retry can't double-refund), replaced after a
    // handled error (so the next attempt isn't rejected as a replay).
    const [requestId, setRequestId] = useState(newRequestId)

    useEffect(() => {
        let active = true
        getRefundSummaryAction(appointmentId)
            .then(s => {
                if (!active) return
                setSummary(s)
                const initialScope: RefundScope = s.depositRefundable > 0 && s.serviceRefundable === 0 ? 'DEPOSIT' : 'FULL'
                setScope(initialScope)
                setAlsoCancel(s.canCancel && initialScope === 'FULL')
            })
            .catch(err => active && setLoadError(err?.message ?? 'Could not load payment details.'))
        return () => { active = false }
    }, [appointmentId])

    const amount = useMemo(() => {
        if (!summary) return 0
        if (scope === 'DEPOSIT') return summary.depositRefundable
        if (scope === 'FULL') return summary.totalRefundable
        return parseDollars(customAmount)
    }, [summary, scope, customAmount])

    const amountError = summary && scope === 'CUSTOM' && customAmount && (amount <= 0 || amount > summary.totalRefundable)
        ? `Enter an amount between $0.01 and ${fmt(summary.totalRefundable)}.`
        : null
    const canSubmit = !!summary && amount > 0 && amount <= summary.totalRefundable && !amountError

    const selectScope = (next: RefundScope) => {
        if (next !== scope && summary?.canCancel) setAlsoCancel(next === 'FULL')
        setScope(next)
        setConfirming(false)
        setError(null)
    }

    const handleSubmit = async () => {
        if (!summary || !canSubmit) return
        setSubmitting(true)
        setError(null)
        try {
            const result = await issueRefundAction({
                appointmentId,
                scope,
                amount: scope === 'CUSTOM' ? amount : undefined,
                reason,
                note: note.trim() || undefined,
                cancelAppointment: summary.canCancel && alsoCancel,
                requestId,
            })
            if (result.ok) {
                onRefunded(result)
                return
            }
            setError(result.error)
            setRequestId(newRequestId())
            setConfirming(false)
        } catch (err: any) {
            setError(err?.message ?? 'Something went wrong. Check your connection and try again.')
            setConfirming(false)
        } finally {
            setSubmitting(false)
        }
    }

    const optionClass = 'flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
    const optionStyle = (selected: boolean) => ({
        border: `1px solid ${selected ? '#1A1818' : '#E8E2D6'}`,
        backgroundColor: selected ? 'rgba(15,14,14,0.03)' : 'transparent',
    })

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-2 p-5 pb-4" style={{ borderBottom: '1px solid #F0EBE3' }}>
                <button
                    onClick={onBack}
                    disabled={submitting}
                    className="rounded-full p-1.5 -ml-1.5 transition-colors hover:bg-[#F0EBE3] disabled:opacity-50"
                    aria-label="Back to appointment"
                >
                    <ArrowLeft size={16} style={{ color: '#1A1818' }} />
                </button>
                <p style={{ fontFamily: SERIF, fontSize: 18, color: '#1A1818', lineHeight: 1.3 }}>
                    Refund {summary?.clientName || 'client'}
                </p>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-5 p-5 overflow-y-auto" style={{ maxHeight: 420 }}>
                {!summary && !loadError && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="size-6 animate-spin" style={{ color: '#6F6863' }} />
                    </div>
                )}

                {loadError && (
                    <div className="flex items-center gap-2 text-sm rounded-xl px-3 py-2.5" style={{ backgroundColor: 'rgba(252,97,97,0.08)', color: '#DC2626' }}>
                        <AlertCircle size={14} /> {loadError}
                    </div>
                )}

                {summary && summary.totalRefundable === 0 && (
                    <p className="text-sm" style={{ color: '#6F6863' }}>
                        {summary.disputed
                            ? 'This payment is under dispute, so it can\'t be refunded. You can respond to the dispute from your Monetization page.'
                            : 'Everything paid online for this appointment has already been refunded.'}
                    </p>
                )}

                {summary && summary.totalRefundable > 0 && (
                    <>
                        {/* What to refund */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>
                                What to refund
                            </p>
                            <button
                                type="button"
                                disabled={summary.depositRefundable === 0 || submitting}
                                onClick={() => selectScope('DEPOSIT')}
                                className={optionClass}
                                style={optionStyle(scope === 'DEPOSIT')}
                            >
                                <span className="text-sm" style={{ color: '#1A1818' }}>Deposit only</span>
                                <span style={{ fontFamily: SERIF, fontSize: 14, color: '#1A1818' }}>{fmt(summary.depositRefundable)}</span>
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => selectScope('FULL')}
                                className={optionClass}
                                style={optionStyle(scope === 'FULL')}
                            >
                                <span className="text-sm" style={{ color: '#1A1818' }}>Full appointment</span>
                                <span style={{ fontFamily: SERIF, fontSize: 14, color: '#1A1818' }}>{fmt(summary.totalRefundable)}</span>
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => selectScope('CUSTOM')}
                                className={optionClass}
                                style={optionStyle(scope === 'CUSTOM')}
                            >
                                <span className="text-sm" style={{ color: '#1A1818' }}>Custom amount</span>
                                <span className="text-xs" style={{ color: '#6F6863' }}>up to {fmt(summary.totalRefundable)}</span>
                            </button>
                            {scope === 'CUSTOM' && (
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center rounded-xl px-3 h-10" style={{ border: '1px solid #E8E2D6' }}>
                                        <span className="text-sm mr-1" style={{ color: '#6F6863' }}>$</span>
                                        <input
                                            inputMode="decimal"
                                            autoFocus
                                            value={customAmount}
                                            disabled={submitting}
                                            onChange={(e) => { setCustomAmount(e.target.value); setConfirming(false) }}
                                            placeholder="0.00"
                                            className="flex-1 text-sm outline-none bg-transparent"
                                            style={{ color: '#1A1818' }}
                                        />
                                    </div>
                                    {amountError && <p className="text-xs" style={{ color: '#DC2626' }}>{amountError}</p>}
                                </div>
                            )}
                        </div>

                        {/* Reason + note */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="refund-reason" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>
                                Reason
                            </label>
                            <select
                                id="refund-reason"
                                value={reason}
                                disabled={submitting}
                                onChange={(e) => setReason(e.target.value as RefundReason)}
                                className="rounded-xl px-3 h-10 text-sm bg-transparent outline-none"
                                style={{ border: '1px solid #E8E2D6', color: '#1A1818' }}
                            >
                                {REFUND_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                            <textarea
                                value={note}
                                disabled={submitting}
                                maxLength={REFUND_NOTE_MAX_LENGTH}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                                placeholder="Internal note (optional)"
                                className="rounded-xl px-3 py-2 text-sm outline-none resize-none bg-transparent"
                                style={{ border: '1px solid #E8E2D6', color: '#1A1818' }}
                            />
                        </div>

                        {summary.canCancel && (
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={alsoCancel}
                                    disabled={submitting}
                                    onChange={(e) => { setAlsoCancel(e.target.checked); setConfirming(false) }}
                                    className="mt-0.5 accent-[#1A1818]"
                                />
                                <span className="text-sm" style={{ color: '#1A1818' }}>
                                    Also cancel this appointment
                                    <span className="block text-xs" style={{ color: '#6F6863' }}>
                                        Frees up the time slot and sends the client a cancellation email.
                                    </span>
                                </span>
                            </label>
                        )}

                        {/* Summary */}
                        <div className="flex flex-col gap-2 rounded-xl px-3.5 py-3" style={{ backgroundColor: '#FAF7F2' }}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#6F6863' }}>Client receives</span>
                                <span style={{ fontFamily: SERIF, fontSize: 15, color: '#1A1818', fontWeight: 600 }}>{fmt(amount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#6F6863' }}>Deducted from your Stripe balance</span>
                                <span style={{ fontFamily: SERIF, fontSize: 14, color: '#1A1818' }}>{fmt(amount)}</span>
                            </div>
                            <p className="text-xs" style={{ color: '#6F6863' }}>
                                Refunds usually reach the client in 5–10 business days. Refunds can&apos;t be undone.
                            </p>
                        </div>

                        {summary.cashPaid > 0 && (
                            <div className="flex items-start gap-2 text-xs" style={{ color: '#6F6863' }}>
                                <Info size={13} className="flex-shrink-0 mt-0.5" />
                                The {fmt(summary.cashPaid)} paid in cash can&apos;t be refunded here — return it to the client directly.
                            </div>
                        )}
                        {summary.disputed && (
                            <div className="flex items-start gap-2 text-xs" style={{ color: '#C9974A' }}>
                                <Info size={13} className="flex-shrink-0 mt-0.5" />
                                One payment on this appointment is under dispute and can&apos;t be refunded.
                            </div>
                        )}
                    </>
                )}

                {summary && summary.refunds.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>
                            Previous refunds
                        </p>
                        <RefundHistory refunds={summary.refunds} />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 p-5 pt-4" style={{ borderTop: '1px solid #F0EBE3' }}>
                {error && (
                    <div className="flex items-center gap-2 text-sm rounded-xl px-3 py-2.5" style={{ backgroundColor: 'rgba(252,97,97,0.08)', color: '#DC2626' }}>
                        <AlertCircle size={14} className="flex-shrink-0" /> {error}
                    </div>
                )}

                {!confirming ? (
                    <div className="flex gap-2">
                        <button
                            disabled={submitting}
                            onClick={onBack}
                            className="flex-1 rounded-full text-sm font-medium h-9 transition-colors hover:bg-[#F0EBE3] disabled:opacity-50"
                            style={{ border: '1px solid #E8E2D6', color: '#1A1818' }}
                        >
                            Back
                        </button>
                        <button
                            disabled={!canSubmit || submitting}
                            onClick={() => { setError(null); setConfirming(true) }}
                            className="flex-1 rounded-full text-sm font-medium h-9 transition-opacity hover:opacity-80 disabled:opacity-50"
                            style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                        >
                            Review Refund
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm" style={{ color: '#1A1818' }}>
                            Refund {fmt(amount)} to {summary?.clientName || 'this client'}
                            {summary?.canCancel && alsoCancel ? ' and cancel the appointment' : ''}? The client will be notified by email.
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={submitting}
                                onClick={() => setConfirming(false)}
                                className="flex-1 rounded-full text-sm font-medium h-9 transition-colors hover:bg-[#F0EBE3] disabled:opacity-50"
                                style={{ border: '1px solid #E8E2D6', color: '#1A1818' }}
                            >
                                Go Back
                            </button>
                            <button
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-full text-sm font-medium h-9 transition-opacity hover:opacity-80 disabled:opacity-50"
                                style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                            >
                                {submitting && <Loader2 size={13} className="animate-spin" />}
                                Yes, Refund {fmt(amount)}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
