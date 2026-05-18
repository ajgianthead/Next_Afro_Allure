'use client'

import { Star } from 'lucide-react'
import { ClientListItem } from '../actions'
import { fmt } from '../analytics-client'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function daysSince(lastVisit: string): number {
    return Math.floor((Date.now() - new Date(lastVisit).getTime()) / 86400000)
}

function SubList({
    title,
    items,
    emptyMsg,
    renderItem,
}: {
    title: string
    items: ClientListItem[]
    emptyMsg: string
    renderItem: (item: ClientListItem, i: number) => React.ReactNode
}) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>
                {title}
            </p>
            {items.length === 0 ? (
                <p className="text-sm" style={{ color: '#6F6863' }}>{emptyMsg}</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {items.map((item, i) => renderItem(item, i))}
                </div>
            )}
        </div>
    )
}

interface Props {
    clientList: ClientListItem[]
}

export function ClientInsightsSection({ clientList }: Props) {
    const loyal = clientList.filter(c => c.is_loyal).sort((a, b) => b.total_spent - a.total_spent)
    const dueSoon = clientList.filter(c => c.is_due_soon && !c.is_at_risk)
    const atRisk = clientList.filter(c => c.is_at_risk)

    const topSpenderEmail = loyal[0]?.client_email

    return (
        <div className="flex flex-col gap-6">
            {/* Loyal clients */}
            <SubList
                title="Loyal Clients"
                items={loyal.slice(0, 10)}
                emptyMsg="Keep booking — loyal clients appear once someone has visited 3+ times."
                renderItem={(item, i) => (
                    <div
                        key={item.client_email}
                        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                        style={{ border: '1px solid #E8E2D6' }}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {item.client_email === topSpenderEmail && (
                                <Star size={13} style={{ color: '#C9974A', flexShrink: 0 }} />
                            )}
                            <span className="text-sm font-medium truncate" style={{ color: '#1A1818' }}>
                                {item.client_name ?? item.client_email}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <span className="text-[11px]" style={{ color: '#6F6863' }}>
                                {item.total_visits} visits
                            </span>
                            <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                                {fmt(item.total_spent)}
                            </span>
                        </div>
                    </div>
                )}
            />

            <div className="h-px" style={{ backgroundColor: '#F0EBE3' }} />

            {/* Due Soon */}
            <SubList
                title="Due for a Visit"
                items={dueSoon.slice(0, 8)}
                emptyMsg="No clients are overdue for a visit — great retention!"
                renderItem={(item) => (
                    <div
                        key={item.client_email}
                        className="flex items-start justify-between gap-3 rounded-xl px-4 py-3"
                        style={{ border: '1px solid #E8E2D6' }}
                    >
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#1A1818' }}>
                                {item.client_name ?? item.client_email}
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: '#6F6863' }}>
                                {item.average_days_between_visits
                                    ? `Usually every ${item.average_days_between_visits} days`
                                    : 'Infrequent visitor'}
                                {item.days_since_last_visit !== null && (
                                    <span> · Last seen {item.days_since_last_visit} days ago</span>
                                )}
                            </p>
                        </div>
                        {item.most_booked_service && (
                            <span className="text-[11px] shrink-0" style={{ color: '#6F6863' }}>
                                {item.most_booked_service}
                            </span>
                        )}
                    </div>
                )}
            />

            <div className="h-px" style={{ backgroundColor: '#F0EBE3' }} />

            {/* At Risk */}
            <SubList
                title="At Risk"
                items={atRisk.slice(0, 8)}
                emptyMsg="No at-risk clients — your retention is looking strong."
                renderItem={(item) => (
                    <div
                        key={item.client_email}
                        className="flex items-start justify-between gap-3 rounded-xl px-4 py-3"
                        style={{ border: '1px solid rgba(252,97,97,0.2)', backgroundColor: 'rgba(252,97,97,0.03)' }}
                    >
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#1A1818' }}>
                                {item.client_name ?? item.client_email}
                            </p>
                            {item.days_since_last_visit !== null && (
                                <p className="text-[11px] mt-0.5" style={{ color: '#FC6161' }}>
                                    {item.days_since_last_visit} days since last visit
                                </p>
                            )}
                        </div>
                        <span className="text-sm font-semibold shrink-0" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                            {fmt(item.total_spent)}
                        </span>
                    </div>
                )}
            />
        </div>
    )
}
