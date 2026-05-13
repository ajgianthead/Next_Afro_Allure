'use client'

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts'
import { RevenueByMonth } from '../actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    const revenue = payload[0]?.value as number
    const fmt = (cents: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
    return (
        <div
            className="rounded-xl px-3 py-2 shadow-sm"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}
        >
            <p className="text-xs" style={{ color: '#6F6863' }}>{label}</p>
            <p className="text-base font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                {fmt(revenue)}
            </p>
        </div>
    )
}

interface RevenueChartProps {
    data: RevenueByMonth[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false} />
                    <XAxis
                        dataKey="month_label"
                        tick={{ fontSize: 11, fill: '#6F6863' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#6F6863' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `$${(v / 100).toFixed(0)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#FC6161"
                        strokeWidth={2}
                        dot={{ fill: '#FC6161', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#FC6161', strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
