'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Gift, Loader2 } from 'lucide-react'
import { describeRemaining, describeReward } from '../loyalty'
import {
    applyRewardToAppointment, getAppointmentLoyalty, removeRewardFromAppointment, type AppointmentLoyalty,
} from '../server/actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const fmt = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

/**
 * Loyalty block in the appointment details: the client's progress, rewards
 * they can use, and applying one to this appointment's balance.
 * `onBalanceChange` gets the change in amount due (negative when a reward is applied).
 */
export function AppointmentRewards({ appointmentId, onBalanceChange }: {
    appointmentId: string
    onBalanceChange: (deltaCents: number) => void
}) {
    const [data, setData] = useState<AppointmentLoyalty | null>(null)
    const [busy, setBusy] = useState<string | null>(null)
    const [code, setCode] = useState('')
    const [showCode, setShowCode] = useState(false)

    const load = async () => {
        const res = await getAppointmentLoyalty(appointmentId)
        if (res.ok) setData(res.loyalty)
    }
    useEffect(() => {
        setData(null)
        let active = true
        getAppointmentLoyalty(appointmentId).then(res => { if (active && res.ok) setData(res.loyalty) }).catch(() => {})
        return () => { active = false }
    }, [appointmentId])

    if (!data) return null
    // Nothing to show when the program is off and no reward was ever applied here.
    if (!data.enabled && !data.applied) return null

    const apply = async (reward: { id?: string; code?: string }, key: string) => {
        setBusy(key)
        const res = await applyRewardToAppointment(appointmentId, reward)
        setBusy(null)
        if (!res.ok) { toast.error(res.error); return }
        onBalanceChange(-res.discountCents)
        toast.success(`${fmt(res.discountCents)} taken off`)
        setCode('')
        setShowCode(false)
        load()
    }

    const remove = async () => {
        if (!data.applied) return
        setBusy('remove')
        const discount = data.applied.discountCents
        const res = await removeRewardFromAppointment(appointmentId)
        setBusy(null)
        if (!res.ok) { toast.error(res.error); return }
        onBalanceChange(discount)
        toast.success('Reward removed — the client can use it again')
        load()
    }

    return (
        <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid #F0EBE3' }}>
            {data.applied ? (
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm flex items-center gap-1.5" style={{ color: '#15803D' }}>
                        <Gift size={13} /> Reward {data.applied.reward.code}
                        {data.canApply && (
                            <button type="button" className="text-xs underline ml-1" style={{ color: '#6F6863' }} disabled={!!busy} onClick={remove}>
                                {busy === 'remove' ? '…' : 'Remove'}
                            </button>
                        )}
                    </span>
                    <span style={{ fontFamily: SERIF, fontSize: 14, color: '#15803D' }}>−{fmt(data.applied.discountCents)}</span>
                </div>
            ) : (
                <>
                    {data.progress && (
                        <p className="text-xs" style={{ color: '#6F6863' }}>
                            <Gift size={12} className="inline -mt-0.5 mr-1" />
                            Rewards: {data.program.earnType === 'visits'
                                ? `${data.progress.banked} of ${data.progress.target} visits`
                                : `${fmt(data.progress.banked)} of ${fmt(data.progress.target)}`}
                            {' · '}{describeRemaining(data.program, data.progress)} to {describeReward(data.program)}
                        </p>
                    )}
                    {data.canApply && data.available.map(r => (
                        <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(34,197,94,0.06)' }}>
                            <span className="text-sm" style={{ color: '#15803D' }}>
                                {describeReward(r)} reward <span className="font-mono text-xs">{r.code}</span>
                            </span>
                            <button
                                type="button"
                                disabled={!!busy}
                                onClick={() => apply({ id: r.id }, r.id)}
                                className="flex items-center gap-1 rounded-full text-xs font-medium px-3 h-7 disabled:opacity-50"
                                style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
                            >
                                {busy === r.id && <Loader2 size={12} className="animate-spin" />}
                                Apply
                            </button>
                        </div>
                    ))}
                    {data.canApply && (
                        showCode ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    placeholder="AA-XXXXXX"
                                    className="flex-1 h-8 rounded-lg px-2 text-sm font-mono uppercase"
                                    style={{ border: '1px solid #E8E2D6' }}
                                />
                                <button
                                    type="button"
                                    disabled={!!busy || !code.trim()}
                                    onClick={() => apply({ code }, 'code')}
                                    className="flex items-center gap-1 rounded-full text-xs font-medium px-3 h-8 disabled:opacity-50"
                                    style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
                                >
                                    {busy === 'code' && <Loader2 size={12} className="animate-spin" />}
                                    Apply
                                </button>
                            </div>
                        ) : (
                            <button type="button" className="text-xs underline self-start" style={{ color: '#6F6863' }} onClick={() => setShowCode(true)}>
                                Have a reward code?
                            </button>
                        )
                    )}
                </>
            )}
        </div>
    )
}
