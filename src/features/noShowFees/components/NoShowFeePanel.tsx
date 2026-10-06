'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { chargeNoShowFee, getNoShowFeeInfo, type NoShowFeeInfo } from '../server/actions'

const fmt = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

/**
 * Shown on no-show appointments: charge the fee the client agreed to, to the
 * card saved with their deposit. Asks for confirmation first.
 */
export function NoShowFeePanel({ appointmentId, onCharged }: { appointmentId: string; onCharged?: (cents: number) => void }) {
    const [info, setInfo] = useState<NoShowFeeInfo | null>(null)
    const [confirming, setConfirming] = useState(false)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        let active = true
        getNoShowFeeInfo(appointmentId).then(res => { if (active && res.ok) setInfo(res.info) }).catch(() => {})
        return () => { active = false }
    }, [appointmentId])

    // Nothing to offer when no fee was agreed at booking.
    if (!info || !info.feeCents) return null

    const charge = async () => {
        setBusy(true)
        const res = await chargeNoShowFee(appointmentId)
        setBusy(false)
        setConfirming(false)
        if (!res.ok) {
            toast.error(res.error)
            setInfo(i => (i ? { ...i, status: 'failed', error: res.error } : i))
            return
        }
        toast.success(`Charged ${fmt(res.chargedCents)} no-show fee`)
        setInfo(i => (i ? { ...i, status: 'succeeded', chargedCents: res.chargedCents, chargeable: false } : i))
        onCharged?.(res.chargedCents)
    }

    if (info.status === 'succeeded') {
        return (
            <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F0EBE3' }}>
                <span className="text-sm font-medium" style={{ color: '#15803D' }}>No-show fee charged</span>
                <span className="text-sm font-semibold" style={{ color: '#15803D' }}>{fmt(info.chargedCents ?? info.feeCents)}</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid #F0EBE3' }}>
            <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#1A1818' }}>No-show fee (agreed at booking)</span>
                <span className="text-sm font-semibold" style={{ color: '#1A1818' }}>{fmt(info.feeCents)}</span>
            </div>
            {info.status === 'failed' && info.error && (
                <p className="text-xs" style={{ color: '#DC2626' }}>Last attempt failed: {info.error}</p>
            )}
            {info.chargeable ? (
                confirming ? (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs flex-1" style={{ color: '#6F6863' }}>
                            Charge {fmt(info.feeCents)} to the card they paid their deposit with?
                        </span>
                        <button type="button" className="text-xs px-3 h-8 rounded-full" style={{ color: '#6F6863' }} disabled={busy} onClick={() => setConfirming(false)}>
                            Not now
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={charge}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-full disabled:opacity-50"
                            style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
                        >
                            {busy && <Loader2 size={12} className="animate-spin" />}
                            Charge {fmt(info.feeCents)}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="self-start text-xs font-medium px-3 h-8 rounded-full"
                        style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                    >
                        Charge no-show fee
                    </button>
                )
            ) : (
                info.reason && <p className="text-xs" style={{ color: '#6F6863' }}>{info.reason}</p>
            )}
        </div>
    )
}
