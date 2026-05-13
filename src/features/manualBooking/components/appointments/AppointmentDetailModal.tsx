'use client'

import { useState } from 'react'
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
type LoadingState = 'idle' | 'confirming' | 'cancelling' | 'markingPaid' | 'sendingLink' | 'sendingPaymentLink'

const STATUS_CONFIG: Record<Status, { badgeBg: string; badgeText: string; label: string }> = {
    CONFIRMED:  { badgeBg: 'rgba(34,197,94,0.1)',    badgeText: '#15803D', label: 'Confirmed' },
    PENDING:    { badgeBg: 'rgba(201,151,74,0.1)',   badgeText: '#C9974A', label: 'Pending' },
    COMPLETED:  { badgeBg: 'rgba(15,14,14,0.08)',    badgeText: '#0F0E0E', label: 'Completed' },
    CANCELLED:  { badgeBg: 'rgba(217,201,176,0.3)',  badgeText: '#6F6863', label: 'Cancelled' },
    NO_SHOW:    { badgeBg: 'rgba(232,226,214,0.5)',  badgeText: '#6F6863', label: 'No Show' },
    DENIED:     { badgeBg: 'rgba(217,201,176,0.3)',  badgeText: '#6F6863', label: 'Denied' },
    PROCESSING: { badgeBg: 'rgba(201,151,74,0.1)',   badgeText: '#C9974A', label: 'Processing' },
    INCOMPLETE: { badgeBg: 'rgba(201,151,74,0.1)',   badgeText: '#C9974A', label: 'Incomplete' },
}

interface Props {
    event: AppointmentEvent | null
    onClose: () => void
}

export function AppointmentDetailModal({ event, onClose }: Props) {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    const [loading, setLoading] = useState<LoadingState>('idle')
    const [cancelStep, setCancelStep] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const status = (event?.status ?? 'PENDING') as Status
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING

    const start = event ? DateTime.fromJSDate(event.start) : null
    const end = event ? DateTime.fromJSDate(event.end) : null
    const mins = start && end ? end.diff(start, 'minutes').minutes : 0
    const durationLabel = mins >= 60
        ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`
        : `${mins}m`

    const busy = loading !== 'idle'

    const updateEventInContext = (patch: Partial<AppointmentEvent>) => {
        if (!event || !manualBookingData || !setManualBookingData) return
        setManualBookingData({
            ...manualBookingData,
            appointmentEvents: manualBookingData.appointmentEvents.map(e =>
                e.id === event.id ? { ...e, ...patch } : e
            ),
        })
    }

    const handleConfirm = async () => {
        if (!event) return
        setLoading('confirming')
        setFeedback(null)
        try {
            await confirmAppointmentAction(event.id, '')
            updateEventInContext({ status: 'CONFIRMED' })
            handleClose()
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
            await sendConfirmationLinkAction(event.id)
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
            await sendPaymentLinkAction(event.id)
            setFeedback({ type: 'success', message: 'Payment link sent to client.' })
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.message ?? 'Failed to send payment link.' })
        } finally {
            setLoading('idle')
        }
    }

    const handleMarkPaid = async () => {
        if (!event) return
        setLoading('markingPaid')
        setFeedback(null)
        try {
            await markAppointmentAs('COMPLETED', event.amountDue, event.id)
            updateEventInContext({
                status: 'COMPLETED',
                servicePaid: true,
                servicePaidType: 'CASH',
                paidAmount: event.paidAmount + event.amountDue,
                amountDue: 0,
            })
            handleClose()
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
            await cancelAppointmentAction(event.id)
            updateEventInContext({ status: 'CANCELLED' })
            handleClose()
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.message ?? 'Failed to cancel appointment.' })
            setCancelStep(false)
            setLoading('idle')
        }
    }

    const handleReschedule = () => {
        if (!event || !manualBookingData || !setManualBookingData) return
        setManualBookingData({
            ...manualBookingData,
            currSelectedEvent: event,
            openRescheduleConfirmation: true,
        })
        handleClose()
    }

    const handleClose = () => {
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
                {event && (
                    <>
                        {/* Header */}
                        <div className="flex flex-col gap-2 p-5 pb-4" style={{ borderBottom: '1px solid #F0EBE3' }}>
                            <div className="flex items-start justify-between gap-3">
                                <p style={{ fontFamily: SERIF, fontSize: 18, color: '#1A1818', lineHeight: 1.3 }}>
                                    {event.serviceData.name}
                                </p>
                                <span
                                    className="px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: config.badgeBg, color: config.badgeText }}
                                >
                                    {config.label}
                                </span>
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
                                            {fmt(event.serviceData.price)}
                                        </span>
                                    </div>

                                    {event.selectedAddons.map(addon => (
                                        <div key={addon.id} className="flex items-center justify-between">
                                            <span className="text-sm" style={{ color: '#6F6863' }}>+ {addon.name}</span>
                                            <span style={{ fontFamily: SERIF, fontSize: 14, color: '#6F6863' }}>
                                                {fmt(addon.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

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
                                </div>
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
                                                    <button
                                                        disabled={busy}
                                                        onClick={handleSendPaymentLink}
                                                        className="flex items-center gap-1.5 rounded-full text-sm font-medium px-4 h-9 transition-opacity hover:opacity-80 disabled:opacity-50"
                                                        style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                                                    >
                                                        {loading === 'sendingPaymentLink' && <Loader2 size={13} className="animate-spin" />}
                                                        Send Payment Link
                                                    </button>
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
