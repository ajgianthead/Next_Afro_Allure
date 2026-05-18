'use client'

import { useMemo } from 'react'
import { DateTime } from 'luxon'
import { useManualBooking } from '../../hooks/useManualBooking'
import { AppointmentEvent } from '../../types'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const MONO = 'ui-monospace, monospace'

type Status = NonNullable<AppointmentEvent['status']>

const STRIP: Record<Status, string> = {
    CONFIRMED:  '#FC6161',
    PENDING:    '#C9974A',
    COMPLETED:  '#0F0E0E',
    CANCELLED:  '#D9C9B0',
    NO_SHOW:    '#C9C0B3',
    DENIED:     '#D9C9B0',
    PROCESSING: '#C9974A',
    INCOMPLETE: '#C9974A',
}

interface Props {
    currentDate: Date
    onSelectEvent: (event: AppointmentEvent) => void
}

export function WeekView({ currentDate, onSelectEvent }: Props) {
    const { manualBookingData } = useManualBooking()

    const { weekDays, eventsByDay } = useMemo(() => {
        const weekStart = DateTime.fromJSDate(currentDate).startOf('week') // Monday
        const days = Array.from({ length: 7 }, (_, i) => weekStart.plus({ days: i }))

        const byDay = new Map<string, AppointmentEvent[]>()
        days.forEach(d => byDay.set(d.toISODate()!, []))

        for (const ev of manualBookingData?.appointmentEvents ?? []) {
            const key = DateTime.fromJSDate(new Date(ev.start)).toISODate()!
            if (byDay.has(key)) byDay.get(key)!.push(ev)
        }
        byDay.forEach(evs => evs.sort((a, b) => +new Date(a.start) - +new Date(b.start)))

        return { weekDays: days, eventsByDay: byDay }
    }, [manualBookingData?.appointmentEvents, currentDate])

    const today = DateTime.now().startOf('day')

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
        >
            <div className="overflow-x-auto">
                <div className="flex" style={{ minWidth: 560 }}>
                    {weekDays.map((day, idx) => {
                        const isToday = day.hasSame(today, 'day')
                        const isWeekend = day.weekday >= 6
                        const dayKey = day.toISODate()!
                        const events = eventsByDay.get(dayKey) ?? []
                        const isLast = idx === 6

                        return (
                            <div
                                key={dayKey}
                                className="flex-1 flex flex-col min-w-0"
                                style={{
                                    borderRight: isLast ? 'none' : '1px solid #F0EBE3',
                                    backgroundColor: isToday ? 'rgba(252,97,97,0.02)' : 'transparent',
                                }}
                            >
                                {/* Column header */}
                                <div
                                    className="flex flex-col items-center py-3 gap-1"
                                    style={{
                                        borderBottom: '1px solid #F0EBE3',
                                        backgroundColor: isToday
                                            ? 'rgba(252,97,97,0.04)'
                                            : isWeekend ? '#FDFBF8' : '#FFFFFF',
                                    }}
                                >
                                    <span
                                        className="text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: isToday ? '#FC6161' : '#6F6863' }}
                                    >
                                        {day.toFormat('EEE')}
                                    </span>
                                    <div
                                        className="flex items-center justify-center rounded-full"
                                        style={{
                                            width: 28,
                                            height: 28,
                                            backgroundColor: isToday ? '#FC6161' : 'transparent',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily: SERIF,
                                                fontSize: 14,
                                                lineHeight: 1,
                                                color: isToday ? '#FFFFFF' : isWeekend ? '#6F6863' : '#1A1818',
                                            }}
                                        >
                                            {day.day}
                                        </span>
                                    </div>
                                    {/* Dot indicator when there are events */}
                                    <div style={{ height: 5 }}>
                                        {events.length > 0 && (
                                            <div
                                                className="w-1 h-1 rounded-full mx-auto"
                                                style={{ backgroundColor: isToday ? '#FC6161' : '#D9C9B0' }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Event chips */}
                                <div className="flex flex-col gap-1 p-1.5 min-h-[120px]">
                                    {events.length === 0 ? (
                                        <div className="flex justify-center pt-5">
                                            <span style={{ fontSize: 11, color: '#E8E2D6' }}>—</span>
                                        </div>
                                    ) : (
                                        events.map(ev => {
                                            const status = (ev.status ?? 'PENDING') as Status
                                            const color = STRIP[status] ?? '#C9974A'
                                            const start = DateTime.fromJSDate(new Date(ev.start))

                                            return (
                                                <button
                                                    key={ev.id}
                                                    onClick={() => onSelectEvent(ev)}
                                                    className="w-full text-left rounded-lg transition-shadow duration-150 hover:shadow-sm active:opacity-80"
                                                    style={{
                                                        borderLeft: `3px solid ${color}`,
                                                        backgroundColor: '#FAF7F2',
                                                        padding: '4px 5px',
                                                    }}
                                                >
                                                    <p
                                                        style={{
                                                            fontFamily: MONO,
                                                            fontSize: 9,
                                                            color: '#6F6863',
                                                            letterSpacing: '0.01em',
                                                        }}
                                                    >
                                                        {start.toFormat('h:mm a')}
                                                    </p>
                                                    <p
                                                        className="truncate"
                                                        style={{ fontFamily: SERIF, fontSize: 11, color: '#1A1818', lineHeight: 1.3 }}
                                                    >
                                                        {ev.clientData.firstName} {ev.clientData.lastName.charAt(0)}.
                                                    </p>
                                                </button>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
