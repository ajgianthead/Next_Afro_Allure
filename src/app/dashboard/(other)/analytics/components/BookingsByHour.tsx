'use client'

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div
            className="rounded-xl px-3 py-2 shadow-sm"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}
        >
            <p className="text-xs" style={{ color: '#6F6863' }}>{label}</p>
            <p className="text-base font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                {payload[0].value} bookings
            </p>
        </div>
    )
}

interface BookingsByHourProps {
    data: { hour: number; label: string; count: number }[]
}

export function BookingsByHour({ data }: BookingsByHourProps) {
    if (!data.length) return <p className="text-sm" style={{ color: '#6F6863' }}>No data yet.</p>
    const maxCount = Math.max(...data.map(d => d.count))

    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>
                Bookings by Hour
            </p>
            <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: '#6F6863' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#6F6863' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={entry.count === maxCount ? '#FC6161' : '#E8E2D6'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
