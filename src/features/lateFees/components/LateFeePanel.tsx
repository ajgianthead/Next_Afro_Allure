'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Clock, Loader2 } from 'lucide-react'
import { addLateFee, getLateFeeInfo, removeLateFee, type LateFeeInfo } from '../server/actions'

const fmt = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

/**
 * Appointment details: add the business's late fee to the balance (the
 * business decides whether the client was late), or take it off again
 * before the client pays.
 */
export function LateFeePanel({ appointmentId, onChange }: {
    appointmentId: string
    /** New amount due after adding/removing; `confirmed` when a no-show flag was cleared. */
    onChange: (patch: { amountDue: number; confirmed?: boolean }) => void
}) {
    const [info, setInfo] = useState<LateFeeInfo | null>(null)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        let active = true
        getLateFeeInfo(appointmentId).then(res => { if (active && res.ok) setInfo(res.info) }).catch(() => {})
        return () => { active = false }
    }, [appointmentId])

    if (!info || (!info.addedCents && (!info.enabled || !info.editable || !info.feeCents))) return null

    const add = async () => {
        setBusy(true)
        const res = await addLateFee(appointmentId)
        setBusy(false)
        if (!res.ok) { toast.error(res.error); return }
        setInfo(i => (i ? { ...i, addedCents: res.feeCents } : i))
        onChange({ amountDue: res.amountDue, confirmed: true })
        toast.success(`Added ${fmt(res.feeCents)} late fee to the balance`)
    }

    const remove = async () => {
        setBusy(true)
        const res = await removeLateFee(appointmentId)
        setBusy(false)
        if (!res.ok) { toast.error(res.error); return }
        setInfo(i => (i ? { ...i, addedCents: 0 } : i))
        onChange({ amountDue: res.amountDue })
        toast.success('Late fee removed')
    }

    if (info.addedCents) {
        return (
            <div className="flex items-center justify-between gap-2 pt-3" style={{ borderTop: '1px solid #F0EBE3' }}>
                <span className="text-sm flex items-center gap-1.5" style={{ color: '#1A1818' }}>
                    <Clock size={13} /> Late fee
                    {info.editable && (
                        <button type="button" className="text-xs underline ml-1" style={{ color: '#6F6863' }} disabled={busy} onClick={remove}>
                            {busy ? '…' : 'Remove'}
                        </button>
                    )}
                </span>
                <span className="text-sm font-semibold" style={{ color: '#1A1818' }}>+{fmt(info.addedCents)}</span>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between gap-2 pt-3" style={{ borderTop: '1px solid #F0EBE3' }}>
            <span className="text-xs" style={{ color: '#6F6863' }}>Client arrived late?</span>
            <button
                type="button"
                disabled={busy}
                onClick={add}
                className="flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-full disabled:opacity-50"
                style={{ border: '1px solid #E8E2D6', color: '#1A1818' }}
            >
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                Add {fmt(info.feeCents)} late fee
            </button>
        </div>
    )
}
