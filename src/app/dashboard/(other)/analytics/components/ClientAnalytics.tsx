'use client'

import { ClientAnalytics } from '../actions'
import { fmt } from '../analytics-client'
import { InfoTooltip } from './InfoTooltip'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function retentionColor(rate: number | null): string {
    if (rate === null) return '#1A1818'
    if (rate >= 50) return '#16a34a'
    if (rate >= 25) return '#B45309'
    return '#FC6161'
}

interface Props {
    client: ClientAnalytics
}

export function ClientAnalyticsSection({ client }: Props) {
    const stats = [
        {
            label: 'Total Clients',
            value: String(client.total_unique_clients),
            tip: 'Number of unique clients who have had at least one active appointment.',
        },
        {
            label: 'Returning',
            value: String(client.returning_clients),
            tip: 'Clients who have booked more than once.',
        },
        {
            label: 'Retention Rate',
            value: client.retention_rate !== null ? `${client.retention_rate}%` : '—',
            color: retentionColor(client.retention_rate),
            tip: 'Percentage of clients who have returned for a second or more appointment.',
        },
        {
            label: 'Avg Lifetime Value',
            value: fmt(client.average_lifetime_value),
            tip: 'Average total amount spent per client across all their completed appointments.',
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                        <div className="flex items-center gap-1 mb-1">
                            <p className="text-[11px] font-medium" style={{ color: '#6F6863' }}>{s.label}</p>
                            <InfoTooltip text={s.tip} />
                        </div>
                        <p
                            className="text-xl font-semibold"
                            style={{ fontFamily: SERIF, color: s.color ?? '#1A1818' }}
                        >
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {client.average_days_between_visits !== null && (
                <div className="rounded-xl p-5" style={{ border: '1px solid #E8E2D6' }}>
                    <div className="flex items-center gap-1 mb-1">
                        <p className="text-[11px] font-medium" style={{ color: '#6F6863' }}>
                            Average Days Between Visits
                        </p>
                        <InfoTooltip text="Average number of days between a client's appointments. Helps you gauge how often clients typically return." />
                    </div>
                    <p className="text-3xl font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                        {client.average_days_between_visits}
                        <span className="text-base font-normal ml-1" style={{ color: '#6F6863' }}>days</span>
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#6F6863' }}>
                        Clients return on average every {client.average_days_between_visits} days.
                        {client.average_visits_per_client > 1 && (
                            <span> Each client books an average of {client.average_visits_per_client} times.</span>
                        )}
                    </p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                    <div className="flex items-center gap-1 mb-1">
                        <p className="text-[11px] font-medium" style={{ color: '#6F6863' }}>New Clients This Month</p>
                        <InfoTooltip text="Clients whose very first appointment with you was this calendar month." />
                    </div>
                    <p className="text-xl font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                        {client.new_clients_this_month}
                    </p>
                </div>
                <div className="flex-1 rounded-xl p-4" style={{ border: '1px solid #E8E2D6' }}>
                    <div className="flex items-center gap-1 mb-1">
                        <p className="text-[11px] font-medium" style={{ color: '#6F6863' }}>New Clients Last Month</p>
                        <InfoTooltip text="Clients whose very first appointment with you was last calendar month." />
                    </div>
                    <p className="text-xl font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                        {client.new_clients_last_month}
                    </p>
                    {client.client_growth_percent !== null && (
                        <p
                            className="text-[11px] font-medium mt-0.5"
                            style={{ color: client.client_growth_percent >= 0 ? '#16a34a' : '#FC6161' }}
                        >
                            {client.client_growth_percent >= 0 ? '+' : ''}{client.client_growth_percent}% MoM
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
