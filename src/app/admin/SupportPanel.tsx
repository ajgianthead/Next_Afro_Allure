'use client'

import { Fragment, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { replyToTicket, updateTicketPriority, updateTicketStatus } from './actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const RED = '#FC6161'
const GOLD = '#C9974A'
const CREAM = '#FAF7F2'
const MUTED = '#9A9088'

export type SupportTicket = {
    id: string
    business_id: string | null
    business_name: string | null
    email: string | null
    subject: string
    message: string
    status: string
    priority: string
    created_at: string | null
    resolved_at: string | null
    founder_reply: string | null
}

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITY_FILTERS = ['All', 'Urgent', 'High', 'Normal', 'Low']
const STATUS_KEY: Record<string, string> = { Open: 'open', 'In Progress': 'in_progress', Resolved: 'resolved', Closed: 'closed' }
const PRIORITY_KEY: Record<string, string> = { Urgent: 'urgent', High: 'high', Normal: 'normal', Low: 'low' }

const PRIORITY_COLOR: Record<string, string> = { urgent: RED, high: '#E8863C', normal: '#5B9BD5', low: MUTED }
const STATUS_COLOR: Record<string, string> = { open: '#5B9BD5', in_progress: GOLD, resolved: '#4ADE80', closed: MUTED }

export default function SupportPanel({ supportTickets }: { supportTickets: SupportTicket[] }) {
    const router = useRouter()
    const [statusFilter, setStatusFilter] = useState('All')
    const [priorityFilter, setPriorityFilter] = useState('All')
    const [expanded, setExpanded] = useState<string | null>(null)
    const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})
    const [busy, setBusy] = useState<string | null>(null)

    const filtered = useMemo(() => {
        return supportTickets.filter(t => {
            if (statusFilter !== 'All' && t.status !== STATUS_KEY[statusFilter]) return false
            if (priorityFilter !== 'All' && t.priority !== PRIORITY_KEY[priorityFilter]) return false
            return true
        })
    }, [supportTickets, statusFilter, priorityFilter])

    const handlePriorityChange = async (id: string, priority: string) => {
        setBusy(id)
        await updateTicketPriority(id, priority)
        setBusy(null)
        router.refresh()
    }

    const handleStatusChange = async (id: string, status: string) => {
        setBusy(id)
        await updateTicketStatus(id, status)
        setBusy(null)
        router.refresh()
    }

    const handleReply = async (id: string) => {
        const reply = replyDraft[id]?.trim()
        if (!reply) return
        setBusy(id)
        await replyToTicket(id, reply)
        setBusy(null)
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className="text-xs px-3 py-1.5 rounded-full"
                        style={statusFilter === s ? { backgroundColor: RED, color: '#fff' } : { backgroundColor: '#1A1714', color: MUTED, border: '1px solid #2C2822' }}
                    >
                        {s}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
                {PRIORITY_FILTERS.map(p => (
                    <button
                        key={p}
                        onClick={() => setPriorityFilter(p)}
                        className="text-xs px-3 py-1.5 rounded-full"
                        style={priorityFilter === p ? { backgroundColor: GOLD, color: '#1A1714' } : { backgroundColor: '#1A1714', color: MUTED, border: '1px solid #2C2822' }}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2C2822' }}>
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1A1714' }}>
                            {['Business', 'Subject', 'Priority', 'Date', 'Status'].map(h => (
                                <th key={h} className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => {
                            const isOpen = expanded === t.id
                            return (
                                <Fragment key={t.id}>
                                    <tr onClick={() => setExpanded(isOpen ? null : t.id)} className="cursor-pointer hover:brightness-110" style={{ borderTop: '1px solid #2C2822' }}>
                                        <td className="px-3 py-2.5" style={{ color: CREAM }}>{t.business_name ?? 'Unknown'}</td>
                                        <td className="px-3 py-2.5" style={{ color: CREAM }}>{t.subject}</td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIORITY_COLOR[t.priority]}22`, color: PRIORITY_COLOR[t.priority] }}>
                                                {t.priority.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5" style={{ color: MUTED }}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${STATUS_COLOR[t.status]}22`, color: STATUS_COLOR[t.status] }}>
                                                {t.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                    {isOpen && (
                                        <tr style={{ backgroundColor: '#15130F' }}>
                                            <td colSpan={5} className="px-4 py-4">
                                                <div className="flex flex-col gap-3 text-sm">
                                                    <p style={{ fontFamily: SERIF, color: CREAM, fontSize: 18 }}>{t.subject}</p>
                                                    <p style={{ color: MUTED }}>{t.business_name} · {t.email}</p>
                                                    <p style={{ color: CREAM, whiteSpace: 'pre-wrap' }}>{t.message}</p>

                                                    {t.founder_reply && (
                                                        <div className="rounded-lg px-3 py-2" style={{ backgroundColor: '#1A1714', border: '1px solid #2C2822' }}>
                                                            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: MUTED }}>Previous reply</p>
                                                            <p style={{ color: CREAM, whiteSpace: 'pre-wrap' }}>{t.founder_reply}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs uppercase tracking-wide" style={{ color: MUTED }}>Priority</label>
                                                        <select
                                                            defaultValue={t.priority}
                                                            onChange={e => handlePriorityChange(t.id, e.target.value)}
                                                            disabled={busy === t.id}
                                                            className="rounded-lg px-3 py-2 text-sm outline-none"
                                                            style={{ backgroundColor: '#1A1714', border: '1px solid #2C2822', color: CREAM }}
                                                        >
                                                            <option value="low">Low</option>
                                                            <option value="normal">Normal</option>
                                                            <option value="high">High</option>
                                                            <option value="urgent">Urgent</option>
                                                        </select>
                                                    </div>

                                                    <label className="text-xs uppercase tracking-wide" style={{ color: MUTED }}>Reply</label>
                                                    <textarea
                                                        value={replyDraft[t.id] ?? ''}
                                                        onChange={e => setReplyDraft(prev => ({ ...prev, [t.id]: e.target.value }))}
                                                        rows={4}
                                                        placeholder="Write a reply — this emails the business directly."
                                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                                                        style={{ backgroundColor: '#1A1714', border: '1px solid #2C2822', color: CREAM }}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleReply(t.id)}
                                                            disabled={busy === t.id || !replyDraft[t.id]?.trim()}
                                                            className="text-xs px-3 py-2 rounded-lg disabled:opacity-50"
                                                            style={{ backgroundColor: RED, color: '#fff' }}
                                                        >
                                                            {busy === t.id ? 'Sending…' : 'Send Reply'}
                                                        </button>

                                                        <select
                                                            defaultValue={t.status}
                                                            onChange={e => handleStatusChange(t.id, e.target.value)}
                                                            disabled={busy === t.id}
                                                            className="rounded-lg px-3 py-2 text-sm outline-none ml-auto"
                                                            style={{ backgroundColor: '#1A1714', border: '1px solid #2C2822', color: CREAM }}
                                                        >
                                                            <option value="open">Open</option>
                                                            <option value="in_progress">In Progress</option>
                                                            <option value="resolved">Resolved</option>
                                                            <option value="closed">Closed</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-sm" style={{ color: MUTED }}>No tickets match this filter.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
