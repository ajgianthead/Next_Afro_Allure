'use client'

import { BookingPerformance } from '../actions'
import { BookingsByDay } from './BookingsByDay'
import { BookingsByHour } from './BookingsByHour'
import { InfoTooltip } from './InfoTooltip'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function rateColor(rate: number | null, good: 'high' | 'low'): string {
    if (rate === null) return '#1A1818'
    if (good === 'high') return rate >= 70 ? '#16a34a' : rate >= 40 ? '#B45309' : '#FC6161'
    return rate <= 10 ? '#16a34a' : rate <= 25 ? '#B45309' : '#FC6161'
}

interface Props {
    booking: BookingPerformance
}

export function BookingPerformanceSection({ booking }: Props) {
    const stats = [
        {
            label: 'This Month',
            value: String(booking.total_bookings_this_month),
            color: '#1A1818',
            tip: 'Total number of bookings (excluding cancelled and denied) in the current calendar month.',
        },
        {
            label: 'Completion Rate',
            value: booking.completion_rate !== null ? `${booking.completion_rate}%` : '—',
            color: rateColor(booking.completion_rate, 'high'),
            tip: 'Percentage of non-cancelled appointments that were completed successfully.',
        },
        {
            label: 'Cancellation Rate',
            value: booking.cancellation_rate !== null ? `${booking.cancellation_rate}%` : '—',
            color: rateColor(booking.cancellation_rate, 'low'),
            tip: 'Percentage of all bookings that were cancelled by the client or stylist.',
        },
        {
            label: 'Avg / Week',
            value: booking.average_bookings_per_week !== null ? String(booking.average_bookings_per_week) : '—',
            color: '#1A1818',
            tip: 'Average number of bookings per week over the last 12 weeks.',
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                        <div className="flex items-center gap-1 mb-1">
                            <p className="text-[11px] font-medium" style={{ color: '#6F6863' }}>{s.label}</p>
                            <InfoTooltip text={s.tip} />
                        </div>
                        <p className="text-xl font-semibold" style={{ fontFamily: SERIF, color: s.color }}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                    <BookingsByDay
                        data={booking.bookings_by_day ?? []}
                        busiest={booking.busiest_day_of_week}
                    />
                </div>
                <div className="flex-1 rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                    <BookingsByHour data={booking.bookings_by_hour ?? []} />
                </div>
            </div>
        </div>
    )
}
