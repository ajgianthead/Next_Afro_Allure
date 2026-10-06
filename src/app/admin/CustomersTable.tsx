'use client'

import { Fragment, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendAtRiskEmail } from './actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const GOLD = '#C9974A'
const RED = '#FC6161'
const CREAM = '#FAF7F2'
const MUTED = '#9A9088'

export type Business = {
    business_id: string
    business_name: string | null
    email: string | null
    created_at: string | null
    subscription_plan: string | null
    subscription_status: string | null
    marketing_opt_in: boolean | null
    last_checkin_sent_at: string | null
    total_booking_volume: number | null
    at_risk: boolean
}

type SortKey = 'newest' | 'oldest' | 'last_active'
type FilterKey = 'all' | 'active' | 'trial' | 'beta' | 'at_risk' | 'churned'

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'trial', label: 'Trial' },
    { key: 'beta', label: 'Free / early access' },
    { key: 'at_risk', label: 'At Risk' },
    { key: 'churned', label: 'Churned' },
]

function planBadge(status: string | null) {
    if (status === 'active') return { label: 'GROWTH', color: GOLD }
    if (status === 'trialing') return { label: 'TRIAL', color: '#5B9BD5' }
    if (status === 'canceled') return { label: 'CHURNED', color: RED }
    if (status === 'complimentary') return { label: 'EARLY ACCESS', color: MUTED }
    return { label: 'STARTER', color: MUTED }
}

function statusBadge(status: string | null) {
    const map: Record<string, { label: string; color: string }> = {
        active: { label: 'Active', color: '#4ADE80' },
        trialing: { label: 'Trialing', color: GOLD },
        canceled: { label: 'Canceled', color: RED },
        complimentary: { label: 'Early access', color: MUTED },
        paused: { label: 'Trial ended', color: MUTED },
    }
    return map[status ?? ''] ?? { label: 'Starter', color: MUTED }
}

function timeAgo(dateStr: string | null) {
    if (!dateStr) return '—'
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diffMs / 3_600_000)
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

export default function CustomersTable({ businesses }: { businesses: Business[] }) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<SortKey>('newest')
    const [filter, setFilter] = useState<FilterKey>('all')
    const [expanded, setExpanded] = useState<string | null>(null)
    const [sending, setSending] = useState<string | null>(null)

    const filtered = useMemo(() => {
        let rows = businesses.filter(b => {
            const q = search.trim().toLowerCase()
            if (q && !(b.business_name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q))) return false
            if (filter === 'active') return b.subscription_status === 'active'
            if (filter === 'trial') return b.subscription_status === 'trialing'
            if (filter === 'beta') return !['active', 'trialing', 'canceled', 'past_due'].includes(b.subscription_status ?? '')
            if (filter === 'churned') return b.subscription_status === 'canceled'
            if (filter === 'at_risk') return b.at_risk
            return true
        })
        rows = [...rows].sort((a, b) => {
            if (sort === 'oldest') return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
            if (sort === 'last_active') return new Date(b.last_checkin_sent_at ?? 0).getTime() - new Date(a.last_checkin_sent_at ?? 0).getTime()
            return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        })
        return rows
    }, [businesses, search, sort, filter])

    const handleSendCheckin = async (businessId: string) => {
        setSending(businessId)
        await sendAtRiskEmail(businessId)
        setSending(null)
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: '#1A1714', border: '1px solid #2C2822', color: CREAM }}
                />
                <select
                    value={sort}
                    onChange={e => setSort(e.target.value as SortKey)}
                    className="rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: '#1A1714', border: '1px solid #2C2822', color: CREAM }}
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="last_active">Last Active</option>
                </select>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className="text-xs px-3 py-1.5 rounded-full transition-colors"
                        style={filter === f.key
                            ? { backgroundColor: RED, color: '#fff' }
                            : { backgroundColor: '#1A1714', color: MUTED, border: '1px solid #2C2822' }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2C2822' }}>
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1A1714' }}>
                            {['Business', 'Email', 'Plan', 'Signed Up', 'Last Active', 'Status', 'MRR'].map(h => (
                                <th key={h} className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(b => {
                            const plan = planBadge(b.subscription_status)
                            const status = statusBadge(b.subscription_status)
                            const isOpen = expanded === b.business_id
                            return (
                                <Fragment key={b.business_id}>
                                    <tr
                                        onClick={() => setExpanded(isOpen ? null : b.business_id)}
                                        className="cursor-pointer transition-colors hover:brightness-110"
                                        style={{ borderTop: '1px solid #2C2822' }}
                                    >
                                        <td className="px-3 py-2.5" style={{ color: CREAM }}>{b.business_name ?? 'Unknown'}</td>
                                        <td className="px-3 py-2.5" style={{ color: MUTED }}>{b.email ?? '—'}</td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${plan.color}22`, color: plan.color }}>
                                                {plan.label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5" style={{ color: MUTED }}>
                                            {b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-3 py-2.5" style={{ color: b.at_risk ? RED : MUTED }}>
                                            {timeAgo(b.last_checkin_sent_at)}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${status.color}22`, color: status.color }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5" style={{ color: CREAM }}>
                                            {b.subscription_status === 'active' ? '$25' : '$0'}
                                        </td>
                                    </tr>
                                    {isOpen && (
                                        <tr style={{ backgroundColor: '#15130F' }}>
                                            <td colSpan={7} className="px-4 py-4">
                                                <div className="flex flex-col gap-2 text-sm">
                                                    <p style={{ fontFamily: SERIF, color: CREAM, fontSize: 18 }}>{b.business_name}</p>
                                                    <p style={{ color: MUTED }}>Email: <span style={{ color: CREAM }}>{b.email}</span></p>
                                                    <p style={{ color: MUTED }}>Plan: <span style={{ color: CREAM }}>{plan.label}</span></p>
                                                    <p style={{ color: MUTED }}>Signed up: <span style={{ color: CREAM }}>{b.created_at ? new Date(b.created_at).toLocaleString() : '—'}</span></p>
                                                    <p style={{ color: MUTED }}>Booking volume: <span style={{ color: CREAM }}>${(b.total_booking_volume ?? 0).toLocaleString()}</span></p>
                                                    <p style={{ color: MUTED }}>Marketing opt-in: <span style={{ color: CREAM }}>{b.marketing_opt_in ? 'Yes' : 'No'}</span></p>
                                                    <div className="flex gap-2 mt-2">
                                                        {b.email && (
                                                            <a
                                                                href={`mailto:${b.email}`}
                                                                className="text-xs px-3 py-1.5 rounded-lg"
                                                                style={{ backgroundColor: '#2C2822', color: CREAM }}
                                                            >
                                                                Send Email
                                                            </a>
                                                        )}
                                                        {b.at_risk && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleSendCheckin(b.business_id) }}
                                                                disabled={sending === b.business_id}
                                                                className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                                                                style={{ backgroundColor: RED, color: '#fff' }}
                                                            >
                                                                {sending === b.business_id ? 'Sending…' : 'Send Check-in Email'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-3 py-6 text-center text-sm" style={{ color: MUTED }}>
                                    No businesses match this filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
