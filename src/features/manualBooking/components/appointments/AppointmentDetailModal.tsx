'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { DateTime } from 'luxon'
import { AppointmentEvent } from '../../types'
import { useManualBooking } from '../../hooks/useManualBooking'
import {
    confirmAppointmentAction,
    cancelAppointmentAction,
    sendConfirmationLinkAction,
    sendPaymentLinkAction,
} from '../../server'
import { markAppointmentAs } from '@/app/dashboard/(other)/appointments/actions'
import { RefundPanel, RefundHistory, RefundRecord, IssueRefundResult } from '@/features/refunds'
import { listRefundsAction } from '@/features/refunds/server'
import { describeSelectedOptions, type SelectedOptions } from '@/features/services/pricing'
import { AppointmentRewards } from '@/features/loyalty/components/AppointmentRewards'
import { NoShowFeePanel } from '@/features/noShowFees/components/NoShowFeePanel'
import { LateFeePanel } from '@/features/lateFees/components/LateFeePanel'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const MONO = 'ui-monospace, monospace'

const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    if (digits.length === 11 && digits[0] === '1') return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    return raw
}

type Status = NonNullable<AppointmentEvent['status']>
type LoadingState = 'idle' | 'confirming' | 'cancelling' | 'markingPaid' | 'markingNoShow' | 'sendingLink' | 'sendingPaymentLink'

const STATUS_CONFIG: Record<Status, { badgeBg: string; badgeText: string; label: string }> = {
    CONFIRMED:  { badgeBg: 'rgba(34,197,94,0.1)',    badgeText: '#15803D', label: 'Confirmed' },
    PENDING:    { badgeBg: 'rgba(201,151,74,0.1)',   badgeText: '#C9974A', label: 'Pending' },
    COMPLETED:  { badgeBg: 'rgba(15,14,14,0.08)',    badgeText: '#0F0E0E', label: 'Completed' },
    CANCELLED:  { badgeBg: 'rgba(217,201,176,0.3)',  badgeText: '#6F6863', label: 'Cancelled' },
    NO_SHOW:    { badgeBg: 'rgba(232,226,214,0.5)',  badgeText: '#6F6863', label: 'No Show' },
    DENIED:     { badgeBg: 'rgba(217,201,176,0.3)',  badgeText: '#6F6863', label: 'Denied' },
    PROCESSING: { badgeBg: 'rgba(201,151,74,0.1)',   badgeText: '#C9974A', label: 'Processing' },
    INCOMPLETE: { badgeBg: 'rgba(201,151,74,0.1)',   badgeText: '#C9974A', label: 'Incomplete' },
    REFUNDED:   { badgeBg: 'rgba(154,144,136,0.12)', badgeText: '#6F6863', label: 'Refunded' },
}

interface Props {
    event: AppointmentEvent | null
    onClose: () => void
    /** Stripe onboarding finished — online payment links only work after this. */
    canTakeOnlinePayments: boolean
}

export function AppointmentDetailModal({ event, onClose, canTakeOnlinePayments }: Props) {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    const [loading, setLoading] = useState<LoadingState>('idle')
    const [cancelStep, setCancelStep] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [view, setView] = useState<'details' | 'refund'>('details')
    const [refunds, setRefunds] = useState<RefundRecord[]>([])

    const hasRefunds = !!event && event.refundStatus !== 'NONE'
    const canRefund = !!event && event.hasOnlinePayment && event.refundStatus !== 'FULL'

    const eventId = event?.id
    useEffect(() => {
        setRefunds([])
        if (!eventId || !hasRefunds) return
        let active = true
        listRefundsAction(eventId)
            .then(r => { if (active) setRefunds(r) })
            .catch(err => console.error('Failed to load refunds:', err))
        return () => { active = false }
    }, [eventId, hasRefunds])

    const status = (event?.status ?? 'PENDING') as Status
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING

    const start = event ? DateTime.fromJSDate(event.start) : null
    const end = event ? DateTime.fromJSDate(event.end) : null
    const mins = start && end ? end.diff(start, 'minutes').minutes : 0
    const durationLabel = mins >= 60
        ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`
        : `${mins}m`

    const busy = loading !== 'idle'

    // Size / length / hair chosen when booking (services with style options).
    const options = (event?.selectedOptions ?? null) as SelectedOptions | null
    const optionsText = describeSelectedOptions(options)
    const stylePrice = options?.priceCents ?? event?.serviceData.price ?? 0
    const hairAdded = options?.hair?.added ? options.hair.price : 0

    // Functional update: a stale snapshot here would overwrite other changes
    // made in the same tick and leave the views showing old data.
    const updateEventInContext = (patch: Partial<AppointmentEvent>) => {
        if (!event || !setManualBookingData) return
        setManualBookingData(prev => ({
            ...prev,
            appointmentEvents: prev.appointmentEvents.map(e =>
                e.id === event.id ? { ...e, ...patch } : e
            ),
        }))
    }

    const handleConfirm = async () => {
        if (!event) return
        setLoading('confirming')
        setFeedback(null)
        try {
            const res = await confirmAppointmentAction(event.id, '')
            if (!res.ok) throw new Error(res.error)
            updateEventInContext({ status: 'CONFIRMED' })
            handleClose()
            toast.success('Appointment confirmed')
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.message ?? 'Failed to confirm appointment.' })
            setLoading('idle')
        }
    }

    const handleSendConfirmationLink = async () => {
        if (!event) return
        setLoading('sendingLink')
        setFeedback(null)
        try {
            const res = await sendConfirmationLinkAction(event.id)
            if (!res.ok) throw new Error(res.error)
            setFeedback({ type: 'success', message: 'Confirmation link sent to client.' })
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.message ?? 'Failed to send link.' })
        } finally {
            setLoading('idle')
        }
    }

    const handleSendPaymentLink = async () => {
        if (!event) return
        setLoading('sendingPaymentLink')
        setFeedback(null)
        try {
            const res = await sendPaymentLinkAction(event.id)
            if (!res.ok) throw new Error(res.error)
            setFeedback({ type: 'success', message: 'Payment link sent to client.' })
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.message ?? 'Failed to send payment link.' })
        } finally {
            setLoading('idle')
        }
    }

    // Stays open: a no-show with a paid deposit shows the no-show fee panel next.
    const handleMarkNoShow = async () => {
        if (!event) return
        setLoading('markingNoShow')
        setFeedback(null)
        try {
            await markAppointmentAs(event.serviceData.business, 'NO_SHOW', event.amountDue, event.id)
            updateEventInContext({ status: 'NO_SHOW' })
            toast.success('Marked as no-show')
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.message ?? 'Failed to mark as no-show.' })
        } finally {
            setLoading('idle')
        }
    }

    const handleMarkPaid = async () => {
        if (!event) return
        setLoading('markingPaid')
        setFeedback(null)
        try {
            const result = await markAppointmentAs(event.serviceData.business, 'COMPLETED', event.amountDue, event.id)
            updateEventInContext({
                status: 'COMPLETED',
                servicePaid: true,
                servicePaidType: event.servicePaidType ?? 'CASH',
                paidAmount: result?.paid_amount ?? event.paidAmount + event.amountDue,
                amountDue: 0,
            })
            handleClose()
            toast.success('Marked as paid')
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.message ?? 'Failed to mark as paid.' })
            setLoading('idle')
        }
    }

    const handleCancel = async () => {
        if (!event) return
        setLoading('cancelling')
        setFeedback(null)
        try {
            const res = await cancelAppointmentAction(event.id)
            if (!res.ok) throw new Error(res.error)
            updateEventInContext({ status: 'CANCELLED' })
            handleClose()
            toast.success('Appointment cancelled')
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.message ?? 'Failed to cancel appointment.' })
            setCancelStep(false)
            setLoading('idle')
        }
    }

    const handleReschedule = () => {
        if (!event || !setManualBookingData) return
        setManualBookingData(prev => ({
            ...prev,
            currSelectedEvent: event,
            newAppointmentEvent: null,
            openRescheduleConfirmation: true,
        }))
        handleClose()
    }

    const handleRefunded = (result: Extract<IssueRefundResult, { ok: true }>) => {
        updateEventInContext({
            refundStatus: result.refundStatus,
            refundedAmount: result.refundedAmount,
            status: result.status,
            amountDue: result.amountDue,
        })
        handleClose()
        toast.success(
            `Refunded ${fmt(result.refundedNow)}${result.cancelled ? ' and cancelled the appointment' : ''}`,
            { description: result.pending ? "The refund is still processing with the client's bank." : undefined }
        )
        if (result.warning) toast.warning(result.warning)
    }

    const handleClose = () => {
        setView('details')
        setCancelStep(false)
        setFeedback(null)
        setLoading('idle')
        onClose()
    }

    return (
        <Dialog open={!!event} onOpenChange={(open) => { if (!open) handleClose() }}>
            <DialogContent
                className="flex flex-col gap-0 p-0 overflow-hidden"
                style={{ maxWidth: 480, border: '1px solid #E8E2D6', borderRadius: 20, backgroundColor: '#FFFFFF' }}
            >
                {event && view === 'refund' && (
                    <RefundPanel
                        appointmentId={event.id}
                        onBack={() => setView('details')}
                        onRefunded={handleRefunded}
                    />
                )}

                {event && view === 'details' && (
                    <>
                        {/* Header */}
                        <div className="flex flex-col gap-2 p-5 pb-4" style={{ borderBottom: '1px solid #F0EBE3' }}>
                            <div className="flex items-start justify-between gap-3">
                                <p style={{ fontFamily: SERIF, fontSize: 18, color: '#1A1818', lineHeight: 1.3 }}>
                                    {event.serviceData.name}
                                    {optionsText && (
                                        <span className="block text-sm" style={{ fontFamily: 'inherit', color: '#6F6863' }}>{optionsText}</span>
                                    )}
                                </p>
                                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                                    {hasRefunds && (
                                        <span
                                            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: 'rgba(154,144,136,0.12)', color: '#6F6863' }}
                                        >
                                            {event.refundStatus === 'FULL' ? 'Refunded' : 'Partially refunded'}
                                        </span>
                                    )}
                                    <span
                                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{ backgroundColor: config.badgeBg, color: config.badgeText }}
                                    >
                                        {config.label}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span style={{ fontFamily: MONO, fontSize: 12, color: '#6F6863' }}>
                                    {start!.toFormat('cccc, LLLL d, yyyy')}
                                </span>
                                <span style={{ color: '#D9C9B0' }}>·</span>
                                <span style={{ fontFamily: MONO, fontSize: 12, color: '#6F6863' }}>
                                    {start!.toFormat('h:mm a')} – {end!.toFormat('h:mm a')}
                                </span>
                                <span style={{ color: '#D9C9B0' }}>·</span>
                                <span style={{ fontFamily: MONO, fontSize: 12, color: '#6F6863' }}>{durationLabel}</span>
                            </div>
                        </div>

                        {/* Scrollable body */}
                        <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 380 }}>
                            {/* Client */}
                            <div className="flex flex-col gap-2 p-5" style={{ borderBottom: '1px solid #F0EBE3' }}>
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>
                                    Client
                                </p>
                                <p style={{ fontFamily: SERIF, fontSize: 16, color: '#1A1818' }}>
                                    {event.clientData.firstName} {event.clientData.lastName}
                                </p>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm" style={{ color: '#6F6863' }}>{event.clientData.email}</p>
                                    {event.clientData.phoneNumber && (
                                        <p className="text-sm" style={{ color: '#6F6863' }}>
                                            {formatPhone(event.clientData.phoneNumber)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="flex flex-col gap-3 p-5">
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>
                                    Payment
                                </p>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm" style={{ color: '#1A1818' }}>
                                            {event.serviceData.name}
                                        </span>
                                        <span style={{ fontFamily: SERIF, fontSize: 14, color: '#1A1818' }}>
                                            {fmt(stylePrice)}
                                        </span>
                                    </div>

                                    {hairAdded && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm" style={{ color: '#6F6863' }}>+ Braiding hair</span>
                                            <span style={{ fontFamily: SERIF, fontSize: 14, color: '#6F6863' }}>{fmt(hairAdded)}</span>
                                        </div>
                                    )}

                                    {event.selectedAddons.map(addon => (
                                        <div key={addon.id} className="flex items-center justify-between">
                                            <span className="text-sm" style={{ color: '#6F6863' }}>+ {addon.name}</span>
                                            <span style={{ fontFamily: SERIF, fontSize: 14, color: '#6F6863' }}>
                                                {fmt(addon.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <AppointmentRewards
                                    key={event.id}
                                    appointmentId={event.id}
                                    onBalanceChange={delta => updateEventInContext({ amountDue: Math.max(0, event.amountDue + delta) })}
                                />

                                <div
                                    className="flex flex-col gap-2 pt-3"
                                    style={{ borderTop: '1px solid #F0EBE3' }}
                                >
                                    {event.requiresDeposit && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm" style={{ color: '#6F6863' }}>
                                                Deposit {event.paidDeposit ? '(paid)' : '(pending)'}
                                            </span>
                                            <span style={{
                                                fontFamily: SERIF, fontSize: 13,
                                                color: event.paidDeposit ? '#15803D' : '#C9974A',
                                            }}>
                                                {fmt(event.depositPrice)}
                                            </span>
                                        </div>
                                    )}

                                    {event.amountDue > 0 && !event.servicePaid && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium" style={{ color: '#1A1818' }}>Due</span>
                                            <span style={{ fontFamily: SERIF, fontSize: 15, color: '#C9974A', fontWeight: 600 }}>
                                                {fmt(event.amountDue)}
                                            </span>
                                        </div>
                                    )}

                                    {event.servicePaid && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium" style={{ color: '#15803D' }}>
                                                Paid {event.servicePaidType === 'CASH' ? '(cash)' : '(online)'}
                                            </span>
                                            <span style={{ fontFamily: SERIF, fontSize: 15, color: '#15803D', fontWeight: 600 }}>
                                                {fmt(event.paidAmount)}
                                            </span>
                                        </div>
                                    )}

                                    {event.refundedAmount > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium" style={{ color: '#6F6863' }}>Refunded</span>
                                            <span style={{ fontFamily: SERIF, fontSize: 15, color: '#6F6863', fontWeight: 600 }}>
                                                −{fmt(event.refundedAmount)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {['CONFIRMED', 'NO_SHOW', 'INCOMPLETE'].includes(status) && !event.servicePaid && (
                                    <LateFeePanel
                                        key={`late-${event.id}`}
                                        appointmentId={event.id}
                                        onChange={({ amountDue, confirmed }) => updateEventInContext({
                                            amountDue,
                                            ...(confirmed && status === 'NO_SHOW' ? { status: 'CONFIRMED' as const } : {}),
                                        })}
                                    />
                                )}

                                {status === 'NO_SHOW' && event.paidDeposit && (
                                    <NoShowFeePanel
                                        key={event.id}
                                        appointmentId={event.id}
                                        onCharged={cents => updateEventInContext({ paidAmount: event.paidAmount + cents })}
                                    />
                                )}

                                {refunds.length > 0 && (
                                    <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid #F0EBE3' }}>
                                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>
                                            Refunds
                                        </p>
                                        <RefundHistory refunds={refunds} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            className="flex flex-col gap-3 p-5 pt-4"
                            style={{ borderTop: '1px solid #F0EBE3' }}
                        >
                            {feedback && (
                                <div
                                    className="flex items-center gap-2 text-sm rounded-xl px-3 py-2.5"
                                    style={{
                                        backgroundColor: feedback.type === 'success'
                                            ? 'rgba(34,197,94,0.08)'
                                            : 'rgba(252,97,97,0.08)',
                                        color: feedback.type === 'success' ? '#15803D' : '#DC2626',
                                    }}
                                >
                                    {feedback.type === 'success'
                                        ? <CheckCircle2 size={14} />
                                        : <AlertCircle size={14} />}
                                    {feedback.message}
                                </div>
                            )}

                            {!cancelStep ? (
                                <div className="flex flex-wrap gap-2">
                                    {status === 'PENDING' && !event.requiresDeposit && (
                                        <button
                                            disabled={busy}
                                            onClick={handleConfirm}
                                            className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-opacity hover:opacity-80 disabled:opacity-50"
                                            style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                                        >
                                            {loading === 'confirming' && <Loader2 size={13} className="animate-spin" />}
                                            Confirm Appointment
                                        </button>
                                    )}

                                    {status === 'PENDING' && event.requiresDeposit && (
                                        <button
                                            disabled={busy}
                                            onClick={handleSendConfirmationLink}
                                            className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-opacity hover:opacity-80 disabled:opacity-50"
                                            style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                                        >
                                            {loading === 'sendingLink' && <Loader2 size={13} className="animate-spin" />}
                                            Send Confirmation Link
                                        </button>
                                    )}

                                    {status === 'CONFIRMED' && (
                                        <>
                                            {event.amountDue > 0 && (
                                                <>
                                                    {canTakeOnlinePayments && (
                                                    <button
                                                        disabled={busy}
                                                        onClick={handleSendPaymentLink}
                                                        className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-opacity hover:opacity-80 disabled:opacity-50"
                                                        style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                                                    >
                                                        {loading === 'sendingPaymentLink' && <Loader2 size={13} className="animate-spin" />}
                                                        Send Payment Link
                                                    </button>
                                                    )}
                                                    <button
                                                        disabled={busy}
                                                        onClick={handleMarkPaid}
                                                        className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-colors hover:bg-[#F0EBE3] disabled:opacity-50"
                                                        style={{ border: '1px solid #E8E2D6', color: '#1A1818', backgroundColor: 'transparent' }}
                                                    >
                                                        {loading === 'markingPaid' && <Loader2 size={13} className="animate-spin" />}
                                                        Mark Paid (Cash)
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                disabled={busy}
                                                onClick={handleReschedule}
                                                className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-colors hover:bg-[#F0EBE3] disabled:opacity-50"
                                                style={{ border: '1px solid #E8E2D6', color: '#1A1818', backgroundColor: 'transparent' }}
                                            >
                                                Reschedule
                                            </button>
                                            <button
                                                disabled={busy}
                                                onClick={() => { setFeedback(null); setCancelStep(true) }}
                                                className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-opacity hover:opacity-70 disabled:opacity-50"
                                                style={{ color: '#DC2626', backgroundColor: 'transparent' }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}

                                    {/* Flagged INCOMPLETE automatically after the end time, or marked a no-show — the client may still pay. */}
                                    {(status === 'NO_SHOW' || status === 'INCOMPLETE') && !event.servicePaid && event.amountDue > 0 && (
                                        <>
                                            {canTakeOnlinePayments && (
                                                <button
                                                    disabled={busy}
                                                    onClick={handleSendPaymentLink}
                                                    className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-opacity hover:opacity-80 disabled:opacity-50"
                                                    style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                                                >
                                                    {loading === 'sendingPaymentLink' && <Loader2 size={13} className="animate-spin" />}
                                                    Send Payment Link
                                                </button>
                                            )}
                                            <button
                                                disabled={busy}
                                                onClick={handleMarkPaid}
                                                className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-colors hover:bg-[#F0EBE3] disabled:opacity-50"
                                                style={{ border: '1px solid #E8E2D6', color: '#1A1818', backgroundColor: 'transparent' }}
                                            >
                                                {loading === 'markingPaid' && <Loader2 size={13} className="animate-spin" />}
                                                They came — Mark Paid (Cash)
                                            </button>
                                            {status === 'INCOMPLETE' && (
                                                <button
                                                    disabled={busy}
                                                    onClick={handleMarkNoShow}
                                                    className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-colors hover:bg-[#F0EBE3] disabled:opacity-50"
                                                    style={{ border: '1px solid #E8E2D6', color: '#1A1818', backgroundColor: 'transparent' }}
                                                >
                                                    {loading === 'markingNoShow' && <Loader2 size={13} className="animate-spin" />}
                                                    They didn't come — Mark No-show
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {canRefund && (
                                        <button
                                            disabled={busy}
                                            onClick={() => { setFeedback(null); setView('refund') }}
                                            className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-colors hover:bg-[#F0EBE3] disabled:opacity-50"
                                            style={{ border: '1px solid #E8E2D6', color: '#1A1818', backgroundColor: 'transparent' }}
                                        >
                                            Refund
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm" style={{ color: '#1A1818' }}>
                                        Cancel this appointment? The client will be notified by email.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={busy}
                                            onClick={() => setCancelStep(false)}
                                            className="flex-1 rounded-full text-sm font-medium h-9 transition-colors hover:bg-[#F0EBE3] disabled:opacity-50"
                                            style={{ border: '1px solid #E8E2D6', color: '#1A1818' }}
                                        >
                                            Go Back
                                        </button>
                                        <button
                                            disabled={busy}
                                            onClick={handleCancel}
                                            className="flex-1 flex items-center justify-center gap-1.5 rounded-full text-sm font-medium h-9 transition-opacity hover:opacity-80 disabled:opacity-50"
                                            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                                        >
                                            {loading === 'cancelling' && <Loader2 size={13} className="animate-spin" />}
                                            Yes, Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
