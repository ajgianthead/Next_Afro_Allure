'use client'

import { useMemo } from 'react'
import { DateTime } from 'luxon'
import { Users } from 'lucide-react'
import { useManualBooking } from '../../hooks/useManualBooking'
import { AppointmentEvent } from '../../types'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const MONO = 'ui-monospace, monospace'

const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

type Status = NonNullable<AppointmentEvent['status']>

const STATUS_CONFIG: Record<Status, { strip: string; badgeBg: string; badgeText: string; label: string }> = {
    CONFIRMED:  { strip: '#FC6161', badgeBg: 'rgba(34,197,94,0.1)',    badgeText: '#15803D', label: 'Confirmed' },
    PENDING:    { strip: '#C9974A', badgeBg: 'rgba(201,151,74,0.1)',   badgeText: '#C9974A', label: 'Pending' },
    COMPLETED:  { strip: '#0F0E0E', badgeBg: 'rgba(15,14,14,0.08)',    badgeText: '#0F0E0E', label: 'Completed' },
    CANCELLED:  { strip: '#D9C9B0', badgeBg: 'rgba(217,201,176,0.3)',  badgeText: '#6F6863', label: 'Cancelled' },
    NO_SHOW:    { strip: '#E8E2D6', badgeBg: 'rgba(232,226,214,0.5)',  badgeText: '#6F6863', label: 'No Show' },
    DENIED:     { strip: '#D9C9B0', badgeBg: 'rgba(217,201,176,0.3)',  badgeText: '#6F6863', label: 'Denied' },
    PROCESSING: { strip: '#C9974A', badgeBg: 'rgba(201,151,74,0.1)',   badgeText: '#C9974A', label: 'Processing' },
    INCOMPLETE: { strip: '#C9974A', badgeBg: 'rgba(201,151,74,0.1)',   badgeText: '#C9974A', label: 'Incomplete' },
}

interface ClientGroup {
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    appointments: AppointmentEvent[]
    totalSpent: number
    lastVisit: Date
}

interface Props {
    onSelectEvent: (event: AppointmentEvent) => void
}

export function ClientView({ onSelectEvent }: Props) {
    const { manualBookingData } = useManualBooking()

    const clients = useMemo<ClientGroup[]>(() => {
        const map = new Map<string, ClientGroup>()

        for (const ev of manualBookingData?.appointmentEvents ?? []) {
            const key = ev.clientData.email
            if (!map.has(key)) {
                map.set(key, {
                    email: key,
                    firstName: ev.clientData.firstName,
                    lastName: ev.clientData.lastName,
                    phoneNumber: ev.clientData.phoneNumber,
                    appointments: [],
                    totalSpent: 0,
                    lastVisit: new Date(ev.start),
                })
            }
            const g = map.get(key)!
            g.appointments.push(ev)
            g.totalSpent += ev.paidAmount ?? 0
            if (new Date(ev.start) > g.lastVisit) g.lastVisit = new Date(ev.start)
        }

        return Array.from(map.values())
            .map(g => ({
                ...g,
                appointments: [...g.appointments].sort(
                    (a, b) => +new Date(b.start) - +new Date(a.start)
                ),
            }))
            .sort((a, b) => +b.lastVisit - +a.lastVisit)
    }, [manualBookingData?.appointmentEvents])

    if (clients.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20"
                style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
            >
                <Users size={32} style={{ color: '#D9C9B0' }} strokeWidth={1.5} />
                <p style={{ fontFamily: SERIF, fontSize: 16, color: '#1A1818' }}>No clients yet</p>
                <p className="text-sm text-center max-w-xs" style={{ color: '#6F6863' }}>
                    Client history will appear here once appointments are created.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {clients.map(client => (
                <div
                    key={client.email}
                    className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
                >
                    {/* Client header */}
                    <div
                        className="flex items-start justify-between gap-3 px-4 py-4"
                        style={{ borderBottom: '1px solid #F0EBE3' }}
                    >
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <p style={{ fontFamily: SERIF, fontSize: 16, color: '#1A1818', lineHeight: 1.3 }}>
                                {client.firstName} {client.lastName}
                            </p>
                            <p className="text-xs truncate" style={{ color: '#6F6863' }}>
                                {client.email}
                            </p>
                            {client.phoneNumber && (
                                <p className="text-xs" style={{ color: '#6F6863' }}>
                                    {client.phoneNumber}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span
                                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                                style={{ backgroundColor: '#F0EBE3', color: '#6F6863' }}
                            >
                                {client.appointments.length} appt{client.appointments.length !== 1 ? 's' : ''}
                            </span>
                            {client.totalSpent > 0 && (
                                <span style={{ fontFamily: SERIF, fontSize: 12, color: '#1A1818' }}>
                                    {fmt(client.totalSpent)} total
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Appointment rows */}
                    <div className="flex flex-col">
                        {client.appointments.map((ev, i) => {
                            const status = (ev.status ?? 'PENDING') as Status
                            const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
                            const start = DateTime.fromJSDate(new Date(ev.start))
                            const isLast = i === client.appointments.length - 1

                            return (
                                <button
                                    key={ev.id}
                                    onClick={() => onSelectEvent(ev)}
                                    className="flex items-center gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-[#FAF7F2]"
                                    style={{ borderBottom: isLast ? 'none' : '1px solid #F0EBE3' }}
                                >
                                    <div
                                        className="w-0.5 self-stretch flex-shrink-0 rounded-full"
                                        style={{ backgroundColor: sc.strip, minHeight: 32 }}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate" style={{ color: '#1A1818' }}>
                                            {ev.serviceData.name}
                                        </p>
                                        <p style={{ fontFamily: MONO, fontSize: 11, color: '#6F6863', marginTop: 1 }}>
                                            {start.toFormat('LLL d, yyyy')}
                                            <span style={{ color: '#D9C9B0', margin: '0 4px' }}>·</span>
                                            {start.toFormat('h:mm a')}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <span
                                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: sc.badgeBg, color: sc.badgeText }}
                                        >
                                            {sc.label}
                                        </span>
                                        {ev.servicePaid ? (
                                            <span style={{ fontFamily: SERIF, fontSize: 11, color: '#15803D' }}>
                                                {fmt(ev.paidAmount)}
                                            </span>
                                        ) : ev.amountDue > 0 ? (
                                            <span style={{ fontFamily: SERIF, fontSize: 11, color: '#C9974A' }}>
                                                {fmt(ev.amountDue)} due
                                            </span>
                                        ) : null}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
