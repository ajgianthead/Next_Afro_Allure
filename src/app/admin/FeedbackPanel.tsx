'use client'

import { Fragment, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateFeedbackStatus } from './actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const RED = '#FC6161'
const GOLD = '#C9974A'
const CREAM = '#FAF7F2'
const MUTED = '#9A9088'

export type Feedback = {
    id: string
    business_id: string | null
    business_name: string | null
    email: string | null
    type: string
    message: string
    status: string
    created_at: string | null
    resolved_at: string | null
    founder_notes: string | null
}

const STATUS_FILTERS = ['All', 'New', 'In Review', 'Resolved', 'Dismissed']
const TYPE_FILTERS = ['All', 'Bug', 'Feature Request', 'General', 'Complaint', 'Praise']

const STATUS_KEY: Record<string, string> = { New: 'new', 'In Review': 'in_review', Resolved: 'resolved', Dismissed: 'dismissed' }
const TYPE_KEY: Record<string, string> = { Bug: 'bug', 'Feature Request': 'feature_request', General: 'general', Complaint: 'complaint', Praise: 'praise' }

const TYPE_COLOR: Record<string, string> = {
    bug: '#FC6161',
    feature_request: '#5B9BD5',
    general: '#9A9088',
    complaint: '#E8863C',
    praise: '#4ADE80',
}

const STATUS_COLOR: Record<string, string> = {
    new: '#5B9BD5',
    in_review: GOLD,
    resolved: '#4ADE80',
    dismissed: MUTED,
}

export default function FeedbackPanel({ feedback }: { feedback: Feedback[] }) {
    const router = useRouter()
    const [statusFilter, setStatusFilter] = useState('All')
    const [typeFilter, setTypeFilter] = useState('All')
    const [expanded, setExpanded] = useState<string | null>(null)
    const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
    const [statusDraft, setStatusDraft] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState<string | null>(null)

    const filtered = useMemo(() => {
        return feedback.filter(f => {
            if (statusFilter !== 'All' && f.status !== STATUS_KEY[statusFilter]) return false
            if (typeFilter !== 'All' && f.type !== TYPE_KEY[typeFilter]) return false
            return true
        })
    }, [feedback, statusFilter, typeFilter])

    const handleSave = async (id: string) => {
        setSaving(id)
        const status = statusDraft[id] ?? feedback.find(f => f.id === id)?.status ?? 'new'
        const notes = notesDraft[id] ?? feedback.find(f => f.id === id)?.founder_notes ?? ''
        await updateFeedbackStatus(id, status, notes)
        setSaving(null)
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
                {TYPE_FILTERS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className="text-xs px-3 py-1.5 rounded-full"
                        style={typeFilter === t ? { backgroundColor: GOLD, color: '#1A1714' } : { backgroundColor: '#1A1714', color: MUTED, border: '1px solid #2C2822' }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2C2822' }}>
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1A1714' }}>
                            {['Business', 'Type', 'Message', 'Date', 'Status'].map(h => (
                                <th key={h} className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(f => {
                            const isOpen = expanded === f.id
                            return (
                                <Fragment key={f.id}>
                                    <tr onClick={() => setExpanded(isOpen ? null : f.id)} className="cursor-pointer hover:brightness-110" style={{ borderTop: '1px solid #2C2822' }}>
                                        <td className="px-3 py-2.5" style={{ color: CREAM }}>{f.business_name ?? 'Unknown'}</td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${TYPE_COLOR[f.type]}22`, color: TYPE_COLOR[f.type] }}>
                                                {f.type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5" style={{ color: MUTED, maxWidth: 320 }}>{f.message.slice(0, 100)}{f.message.length > 100 ? '…' : ''}</td>
                                        <td className="px-3 py-2.5" style={{ color: MUTED }}>{f.created_at ? new Date(f.created_at).toLocaleDateString() : '—'}</td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${STATUS_COLOR[f.status]}22`, color: STATUS_COLOR[f.status] }}>
                                                {f.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                    {isOpen && (
                                        <tr style={{ backgroundColor: '#15130F' }}>
                                            <td colSpan={5} className="px-4 py-4">
                                                <div className="flex flex-col gap-3 text-sm">
                                                    <p style={{ fontFamily: SERIF, color: CREAM, fontSize: 18 }}>{f.business_name}</p>
                                                    <p style={{ color: MUTED }}>{f.email}</p>
                                                    <p style={{ color: CREAM, whiteSpace: 'pre-wrap' }}>{f.message}</p>

                                                    <label className="text-xs uppercase tracking-wide" style={{ color: MUTED }}>Founder Notes</label>
                                                    <textarea
                                                        defaultValue={f.founder_notes ?? ''}
                                                        onChange={e => setNotesDraft(prev => ({ ...prev, [f.id]: e.target.value }))}
                                                        rows={3}
                                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                                                        style={{ backgroundColor: '#1A1714', border: '1px solid #2C2822', color: CREAM }}
                                                    />

                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            defaultValue={f.status}
                                                            onChange={e => setStatusDraft(prev => ({ ...prev, [f.id]: e.target.value }))}
                                                            className="rounded-lg px-3 py-2 text-sm outline-none"
                                                            style={{ backgroundColor: '#1A1714', border: '1px solid #2C2822', color: CREAM }}
                                                        >
                                                            <option value="new">New</option>
                                                            <option value="in_review">In Review</option>
                                                            <option value="resolved">Resolved</option>
                                                            <option value="dismissed">Dismissed</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleSave(f.id)}
                                                            disabled={saving === f.id}
                                                            className="text-xs px-3 py-2 rounded-lg disabled:opacity-50"
                                                            style={{ backgroundColor: '#2C2822', color: CREAM }}
                                                        >
                                                            {saving === f.id ? 'Saving…' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                setSaving(f.id)
                                                                await updateFeedbackStatus(f.id, 'resolved', notesDraft[f.id] ?? f.founder_notes ?? '')
                                                                setSaving(null)
                                                                router.refresh()
                                                            }}
                                                            disabled={saving === f.id}
                                                            className="text-xs px-3 py-2 rounded-lg disabled:opacity-50"
                                                            style={{ backgroundColor: RED, color: '#fff' }}
                                                        >
                                                            Mark Resolved
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-sm" style={{ color: MUTED }}>No feedback matches this filter.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
