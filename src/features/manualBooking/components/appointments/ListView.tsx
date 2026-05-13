'use client'

import { useMemo } from 'react'
import { DateTime } from 'luxon'
import { CalendarX } from 'lucide-react'
import { useManualBooking } from '../../hooks/useManualBooking'
import { AppointmentEvent } from '../../types'
import { AppointmentCard } from './AppointmentCard'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

interface Props {
    onSelectEvent: (event: AppointmentEvent) => void
}

function dateLabel(iso: string): string {
    const today = DateTime.now().startOf('day')
    const d = DateTime.fromISO(iso).startOf('day')
    const diff = d.diff(today, 'days').days
    if (diff === 0) return `Today · ${d.toFormat('LLLL d')}`
    if (diff === 1) return `Tomorrow · ${d.toFormat('LLLL d')}`
    if (diff === -1) return `Yesterday · ${d.toFormat('LLLL d')}`
    return d.toFormat('cccc, LLLL d, yyyy')
}

export function ListView({ onSelectEvent }: Props) {
    const { manualBookingData } = useManualBooking()

    const groups = useMemo(() => {
        const events = manualBookingData?.appointmentEvents ?? []
        const sorted = [...events].sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        )
        const map = new Map<string, AppointmentEvent[]>()
        for (const event of sorted) {
            const key = DateTime.fromJSDate(new Date(event.start)).toISODate()!
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(event)
        }
        return Array.from(map.entries())
    }, [manualBookingData?.appointmentEvents])

    if (groups.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20"
                style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
            >
                <CalendarX size={32} style={{ color: '#D9C9B0' }} strokeWidth={1.5} />
                <p style={{ fontFamily: SERIF, fontSize: 16, color: '#1A1818' }}>No appointments yet</p>
                <p className="text-sm text-center max-w-xs" style={{ color: '#6F6863' }}>
                    Use the + button to create your first manual appointment.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {groups.map(([dateKey, events]) => (
                <div key={dateKey} className="flex flex-col gap-2">
                    {/* Date header */}
                    <div className="flex items-center gap-3 px-1">
                        <p
                            className="text-xs font-semibold uppercase tracking-widest flex-shrink-0"
                            style={{ color: '#6F6863' }}
                        >
                            {dateLabel(dateKey)}
                        </p>
                        <div className="flex-1 h-px" style={{ backgroundColor: '#F0EBE3' }} />
                        <span
                            className="text-xs flex-shrink-0 rounded-full px-2 py-0.5"
                            style={{ backgroundColor: '#F0EBE3', color: '#6F6863' }}
                        >
                            {events.length}
                        </span>
                    </div>

                    {/* Cards */}
                    <div className="flex flex-col gap-2">
                        {events.map(event => (
                            <AppointmentCard
                                key={event.id}
                                event={event}
                                onSelect={onSelectEvent}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
