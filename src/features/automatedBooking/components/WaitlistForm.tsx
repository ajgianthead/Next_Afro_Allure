'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { joinWaitlist } from '@/features/waitlist/server/actions'
import { MAX_WAIT_DAYS, TIME_OF_DAY_LABELS, type TimeOfDay } from '@/features/waitlist/waitlist'

const inputStyle: React.CSSProperties = {
    border: '1px solid var(--t-border)',
    borderRadius: 'var(--t-input-r)',
    backgroundColor: 'var(--t-card)',
    color: 'var(--t-text)',
}

/**
 * "Can't find a time?" — lets a client ask to be emailed when a time opens
 * up (someone cancels). Themed with the booking site's CSS variables.
 */
export function WaitlistForm({ businessId, serviceId, initialDate, defaults }: {
    businessId: string
    serviceId?: string | null
    /** yyyy-mm-dd — the day the client was looking at. */
    initialDate?: string | null
    defaults?: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string }
}) {
    const today = DateTime.now().toISODate()!
    const start = initialDate && initialDate >= today ? initialDate : today
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({
        firstName: defaults?.firstName ?? '',
        lastName: defaults?.lastName ?? '',
        email: defaults?.email ?? '',
        phone: defaults?.phoneNumber ?? '',
        fromDate: start,
        toDate: DateTime.fromISO(start).plus({ days: 7 }).toISODate()!,
        timeOfDay: 'any' as TimeOfDay,
    })
    const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle')
    const [error, setError] = useState('')
    const set = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }))
    const maxDate = DateTime.now().plus({ days: MAX_WAIT_DAYS }).toISODate()!

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setStatus('saving')
        const res = await joinWaitlist({ businessId, serviceId: serviceId ?? null, ...form }).catch(() => ({ ok: false as const, error: 'Something went wrong. Please try again.' }))
        if (res.ok) setStatus('done')
        else { setStatus('idle'); setError(res.error) }
    }

    if (status === 'done') {
        return (
            <div className="flex items-start gap-2 text-sm p-3" style={{ ...inputStyle, color: 'var(--t-text)' }}>
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--t-primary)' }} />
                <span>You&apos;re on the waitlist. We&apos;ll email {form.email} if a time opens up — book it quickly, it goes to whoever books first.</span>
            </div>
        )
    }

    if (!open) {
        return (
            <button type="button" onClick={() => setOpen(true)} className="text-sm underline text-left" style={{ color: 'var(--t-muted)' }}>
                Can&apos;t find a time that works? Join the waitlist
            </button>
        )
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-3 p-4" style={{ ...inputStyle }}>
            <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--t-text)', fontFamily: 'var(--t-font)' }}>Join the waitlist</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--t-muted)' }}>We&apos;ll email you if someone cancels during the days you choose.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <input required placeholder="First name" className="h-9 px-3 text-sm" style={inputStyle} value={form.firstName} onChange={e => set({ firstName: e.target.value })} />
                <input placeholder="Last name" className="h-9 px-3 text-sm" style={inputStyle} value={form.lastName} onChange={e => set({ lastName: e.target.value })} />
                <input required type="email" placeholder="Email" className="h-9 px-3 text-sm col-span-2" style={inputStyle} value={form.email} onChange={e => set({ email: e.target.value })} />
                <input type="tel" placeholder="Phone (optional)" className="h-9 px-3 text-sm col-span-2" style={inputStyle} value={form.phone} onChange={e => set({ phone: e.target.value })} />
                <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--t-muted)' }}>
                    From
                    <input required type="date" min={today} max={maxDate} className="h-9 px-2 text-sm" style={inputStyle} value={form.fromDate}
                        onChange={e => set({ fromDate: e.target.value, toDate: form.toDate < e.target.value ? e.target.value : form.toDate })} />
                </label>
                <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--t-muted)' }}>
                    To
                    <input required type="date" min={form.fromDate || today} max={maxDate} className="h-9 px-2 text-sm" style={inputStyle} value={form.toDate} onChange={e => set({ toDate: e.target.value })} />
                </label>
                <select className="h-9 px-2 text-sm col-span-2" style={inputStyle} value={form.timeOfDay} onChange={e => set({ timeOfDay: e.target.value as TimeOfDay })}>
                    {(Object.keys(TIME_OF_DAY_LABELS) as TimeOfDay[]).map(t => <option key={t} value={t}>{TIME_OF_DAY_LABELS[t]}</option>)}
                </select>
            </div>
            {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
            <div className="flex items-center justify-end gap-2">
                <button type="button" className="text-sm px-3 h-9" style={{ color: 'var(--t-muted)' }} onClick={() => setOpen(false)}>Cancel</button>
                <button
                    type="submit"
                    disabled={status === 'saving'}
                    className="text-sm font-medium px-4 h-9 flex items-center gap-1.5 disabled:opacity-60"
                    style={{ backgroundColor: 'var(--t-primary)', color: 'var(--t-primary-text)', borderRadius: 'var(--t-input-r)' }}
                >
                    {status === 'saving' && <Loader2 size={14} className="animate-spin" />}
                    Join waitlist
                </button>
            </div>
        </form>
    )
}
