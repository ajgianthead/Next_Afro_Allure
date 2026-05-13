'use client'

import { useMemo, useRef, useEffect } from 'react'
import { DateTime } from 'luxon'
import { useManualBooking } from '../../hooks/useManualBooking'
import { AppointmentEvent } from '../../types'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const START_HOUR = 6
const END_HOUR = 22
const HOUR_HEIGHT = 80

type Status = NonNullable<AppointmentEvent['status']>

const STATUS_COLORS: Record<Status, { bg: string; border: string; text: string }> = {
    CONFIRMED:  { bg: 'rgba(252,97,97,0.12)',    border: '#FC6161', text: '#B91C1C' },
    PENDING:    { bg: 'rgba(201,151,74,0.12)',   border: '#C9974A', text: '#92400E' },
    COMPLETED:  { bg: 'rgba(15,14,14,0.06)',     border: '#0F0E0E', text: '#1A1818' },
    CANCELLED:  { bg: 'rgba(217,201,176,0.25)',  border: '#D9C9B0', text: '#6F6863' },
    NO_SHOW:    { bg: 'rgba(232,226,214,0.4)',   border: '#C9C0B3', text: '#6F6863' },
    DENIED:     { bg: 'rgba(217,201,176,0.25)',  border: '#D9C9B0', text: '#6F6863' },
    PROCESSING: { bg: 'rgba(201,151,74,0.12)',   border: '#C9974A', text: '#92400E' },
    INCOMPLETE: { bg: 'rgba(201,151,74,0.12)',   border: '#C9974A', text: '#92400E' },
}

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

function hourLabel(h: number) {
    if (h === 0) return '12 AM'
    if (h < 12) return `${h} AM`
    if (h === 12) return '12 PM'
    return `${h - 12} PM`
}

function timeToOffset(date: Date): number {
    const dt = DateTime.fromJSDate(date)
    return (dt.hour + dt.minute / 60 - START_HOUR) * HOUR_HEIGHT
}

function durationToHeight(event: AppointmentEvent): number {
    const mins = DateTime.fromJSDate(new Date(event.end))
        .diff(DateTime.fromJSDate(new Date(event.start)), 'minutes').minutes
    return Math.max(28, (mins / 60) * HOUR_HEIGHT)
}

function layoutEvents(events: AppointmentEvent[]) {
    if (!events.length) return []
    const sorted = [...events].sort((a, b) => +new Date(a.start) - +new Date(b.start))
    const laneEnds: Date[] = []
    const cols: number[] = []

    for (const event of sorted) {
        const s = new Date(event.start)
        const e = new Date(event.end)
        let col = -1
        for (let i = 0; i < laneEnds.length; i++) {
            if (laneEnds[i] <= s) { col = i; laneEnds[i] = e; break }
        }
        if (col === -1) { col = laneEnds.length; laneEnds.push(e) }
        cols.push(col)
    }

    return sorted.map((event, i) => {
        const s = new Date(event.start), e = new Date(event.end)
        const usedCols = new Set<number>()
        sorted.forEach((other, j) => {
            if (new Date(other.start) < e && new Date(other.end) > s) usedCols.add(cols[j])
        })
        return { event, col: cols[i], totalCols: usedCols.size }
    })
}

interface Props {
    currentDate: Date
    onSelectEvent: (event: AppointmentEvent) => void
}

export function DayView({ currentDate, onSelectEvent }: Props) {
    const { manualBookingData } = useManualBooking()
    const scrollRef = useRef<HTMLDivElement>(null)
    const isToday = DateTime.fromJSDate(currentDate).hasSame(DateTime.now(), 'day')

    const dayEvents = useMemo(() =>
        (manualBookingData?.appointmentEvents ?? []).filter(e =>
            DateTime.fromJSDate(new Date(e.start)).hasSame(DateTime.fromJSDate(currentDate), 'day')
        ),
        [manualBookingData?.appointmentEvents, currentDate]
    )

    const laid = useMemo(() => layoutEvents(dayEvents), [dayEvents])

    useEffect(() => {
        if (!scrollRef.current) return
        const target = laid.length > 0
            ? Math.max(0, timeToOffset(new Date(laid[0].event.start)) - 80)
            : Math.max(0, (DateTime.now().hour - START_HOUR - 1) * HOUR_HEIGHT)
        scrollRef.current.scrollTop = target
    }, [currentDate])

    const nowOffset = useMemo(() => {
        const dt = DateTime.now()
        return (dt.hour + dt.minute / 60 - START_HOUR) * HOUR_HEIGHT
    }, [])

    const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT

    return (
        <div
            ref={scrollRef}
            className="overflow-y-auto rounded-2xl"
            style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF', maxHeight: 640 }}
        >
            <div className="flex relative" style={{ height: totalHeight }}>
                {/* Time gutter */}
                <div className="flex-shrink-0 relative select-none" style={{ width: 56 }}>
                    {HOURS.map(h => (
                        <div
                            key={h}
                            className="absolute flex items-start justify-end pr-2.5"
                            style={{ top: (h - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT, width: 56 }}
                        >
                            <span style={{ fontSize: 10, color: '#6F6863', letterSpacing: '0.02em', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                                {hourLabel(h)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Event area */}
                <div className="flex-1 relative" style={{ borderLeft: '1px solid #F0EBE3' }}>
                    {/* Hour lines */}
                    {HOURS.map(h => (
                        <div
                            key={h}
                            className="absolute left-0 right-0"
                            style={{ top: (h - START_HOUR) * HOUR_HEIGHT, borderTop: '1px solid #F0EBE3' }}
                        />
                    ))}

                    {/* Half-hour lines (subtler) */}
                    {HOURS.map(h => (
                        <div
                            key={`half-${h}`}
                            className="absolute left-0 right-0"
                            style={{ top: (h - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2, borderTop: '1px dashed #F8F4EE' }}
                        />
                    ))}

                    {/* Now indicator */}
                    {isToday && nowOffset > 0 && nowOffset < totalHeight && (
                        <div
                            className="absolute left-0 right-0 flex items-center z-20 pointer-events-none"
                            style={{ top: nowOffset }}
                        >
                            <div className="w-2 h-2 rounded-full flex-shrink-0 -ml-1" style={{ backgroundColor: '#FC6161' }} />
                            <div className="flex-1 h-px" style={{ backgroundColor: '#FC6161' }} />
                        </div>
                    )}

                    {/* Appointment blocks */}
                    {laid.map(({ event, col, totalCols }) => {
                        const top = timeToOffset(new Date(event.start))
                        const height = durationToHeight(event)
                        const status = (event.status ?? 'PENDING') as Status
                        const c = STATUS_COLORS[status] ?? STATUS_COLORS.PENDING
                        const wPct = 100 / totalCols
                        const lPct = col * wPct
                        const start = DateTime.fromJSDate(new Date(event.start))
                        const end = DateTime.fromJSDate(new Date(event.end))

                        return (
                            <div
                                key={event.id}
                                className="absolute cursor-pointer rounded-lg overflow-hidden transition-shadow duration-150 hover:shadow-md"
                                style={{
                                    top: top + 1,
                                    height: height - 2,
                                    left: `calc(${lPct}% + 4px)`,
                                    width: `calc(${wPct}% - 8px)`,
                                    backgroundColor: c.bg,
                                    borderLeft: `3px solid ${c.border}`,
                                    padding: '3px 6px',
                                }}
                                onClick={() => onSelectEvent(event)}
                            >
                                <p
                                    className="truncate font-semibold leading-tight"
                                    style={{ fontSize: 11, color: c.text }}
                                >
                                    {event.clientData.firstName} {event.clientData.lastName}
                                </p>
                                {height >= 44 && (
                                    <p className="truncate" style={{ fontSize: 10, color: c.text, opacity: 0.75 }}>
                                        {event.serviceData.name}
                                    </p>
                                )}
                                {height >= 60 && (
                                    <p style={{ fontSize: 10, color: c.text, opacity: 0.6 }}>
                                        {start.toFormat('h:mm')}–{end.toFormat('h:mm a')}
                                    </p>
                                )}
                            </div>
                        )
                    })}

                    {/* Empty state */}
                    {laid.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                            <p style={{ fontFamily: SERIF, fontSize: 15, color: '#1A1818' }}>No appointments</p>
                            <p className="text-sm" style={{ color: '#6F6863' }}>
                                {isToday ? 'Nothing scheduled today' : DateTime.fromJSDate(currentDate).toFormat('cccc, LLLL d')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
