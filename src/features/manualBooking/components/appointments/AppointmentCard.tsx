'use client'

import { DateTime } from 'luxon'
import { AppointmentEvent } from '../../types'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const MONO = 'ui-monospace, monospace'

const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

type Status = NonNullable<AppointmentEvent['status']>

const STATUS_CONFIG: Record<Status, { strip: string; badgeBg: string; badgeText: string; label: string }> = {
    CONFIRMED:  { strip: '#FC6161', badgeBg: 'rgba(34,197,94,0.1)',     badgeText: '#15803D', label: 'Confirmed' },
    PENDING:    { strip: '#C9974A', badgeBg: 'rgba(201,151,74,0.1)',    badgeText: '#C9974A', label: 'Pending' },
    COMPLETED:  { strip: '#0F0E0E', badgeBg: 'rgba(15,14,14,0.08)',     badgeText: '#0F0E0E', label: 'Completed' },
    CANCELLED:  { strip: '#D9C9B0', badgeBg: 'rgba(217,201,176,0.3)',   badgeText: '#6F6863', label: 'Cancelled' },
    NO_SHOW:    { strip: '#E8E2D6', badgeBg: 'rgba(232,226,214,0.5)',   badgeText: '#6F6863', label: 'No Show' },
    DENIED:     { strip: '#D9C9B0', badgeBg: 'rgba(217,201,176,0.3)',   badgeText: '#6F6863', label: 'Denied' },
    PROCESSING: { strip: '#C9974A', badgeBg: 'rgba(201,151,74,0.1)',    badgeText: '#C9974A', label: 'Processing' },
    INCOMPLETE: { strip: '#C9974A', badgeBg: 'rgba(201,151,74,0.1)',    badgeText: '#C9974A', label: 'Incomplete' },
}

interface Props {
    event: AppointmentEvent
    onSelect: (event: AppointmentEvent) => void
}

export function AppointmentCard({ event, onSelect }: Props) {
    const status = (event.status ?? 'PENDING') as Status
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING

    const start = DateTime.fromJSDate(event.start)
    const end = DateTime.fromJSDate(event.end)
    const mins = end.diff(start, 'minutes').minutes
    const durationLabel = mins >= 60
        ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`
        : `${mins}m`

    const depositLabel = !event.requiresDeposit
        ? { text: 'No deposit', color: '#6F6863' }
        : event.paidDeposit
            ? { text: 'Deposit paid ✓', color: '#15803D' }
            : { text: 'Deposit pending', color: '#C9974A' }

    const amountLabel = event.servicePaid
        ? { text: fmt(event.paidAmount), suffix: 'paid', color: '#1A1818' }
        : event.amountDue > 0
            ? { text: fmt(event.amountDue), suffix: 'due', color: '#C9974A' }
            : { text: '$0.00', suffix: '', color: '#6F6863' }

    return (
        <div
            className="flex overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-150 rounded-2xl"
            style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
            onClick={() => onSelect(event)}
        >
            {/* Status strip */}
            <div className="w-1 flex-shrink-0" style={{ backgroundColor: config.strip }} />

            <div className="flex flex-col gap-3 p-4 flex-1 min-w-0">
                {/* Time + status badge */}
                <div className="flex items-center justify-between gap-2">
                    <span style={{ fontFamily: MONO, fontSize: 12, color: '#6F6863' }}>
                        {start.toFormat('h:mm a')} – {end.toFormat('h:mm a')}
                    </span>
                    <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                        style={{ backgroundColor: config.badgeBg, color: config.badgeText }}
                    >
                        {config.label}
                    </span>
                </div>

                {/* Client + service */}
                <div className="flex flex-col gap-0.5 min-w-0">
                    <p
                        className="truncate leading-snug"
                        style={{ fontFamily: SERIF, fontSize: 17, color: '#1A1818' }}
                    >
                        {event.clientData.firstName} {event.clientData.lastName}
                    </p>
                    <p className="text-sm truncate" style={{ color: '#6F6863' }}>
                        {event.serviceData.name}
                        <span className="mx-1.5" style={{ color: '#D9C9B0' }}>·</span>
                        <span style={{ fontSize: 12 }}>{durationLabel}</span>
                    </p>
                </div>

                {/* Deposit + amount */}
                <div
                    className="flex items-center justify-between pt-2"
                    style={{ borderTop: '1px solid #F0EBE3' }}
                >
                    <span style={{ fontSize: 12, color: depositLabel.color }}>
                        {depositLabel.text}
                    </span>
                    <span style={{ fontFamily: SERIF, fontSize: 13, color: amountLabel.color }}>
                        {amountLabel.text}
                        {amountLabel.suffix && (
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#6F6863', marginLeft: 3 }}>
                                {amountLabel.suffix}
                            </span>
                        )}
                    </span>
                </div>

                {/* Quick actions */}
                <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    {status === 'PENDING' && (
                        <button
                            className="rounded-full text-xs font-medium px-3 h-7 flex items-center transition-opacity hover:opacity-80"
                            style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                            onClick={() => onSelect(event)}
                        >
                            Confirm
                        </button>
                    )}
                    <button
                        className="rounded-full text-xs font-medium px-3 h-7 flex items-center transition-colors hover:bg-[#F0EBE3]"
                        style={{ border: '1px solid #E8E2D6', color: '#1A1818', backgroundColor: 'transparent' }}
                        onClick={() => onSelect(event)}
                    >
                        Details
                    </button>
                </div>
            </div>
        </div>
    )
}
