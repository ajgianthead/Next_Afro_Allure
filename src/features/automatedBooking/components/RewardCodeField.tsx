'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { checkRewardCodeAction } from '@/features/loyalty/server/bookingRewards'
import { useBooking } from '../hooks/useBookingData'
import type { BookingData } from '../context/BookingDataContext'

/**
 * "Have a reward code?" on the contact step. The code is checked against the
 * person booking (email/phone) and applied to the booking on the server.
 */
export function RewardCodeField() {
    const { data, setData } = useBooking()
    const [open, setOpen] = useState(!!data.rewardCode)
    const [code, setCode] = useState(data.rewardCode)
    const [state, setState] = useState<{ ok: boolean; text: string } | null>(data.rewardCode ? { ok: true, text: 'Code applied' } : null)
    const [checking, setChecking] = useState(false)

    if (!open) {
        return (
            <button type="button" onClick={() => setOpen(true)} className="self-start text-sm font-medium underline-offset-4 hover:underline min-h-11" style={{ color: 'var(--t-primary)' }}>
                Have a reward code?
            </button>
        )
    }

    const check = async () => {
        setChecking(true)
        const { email, phoneNumber } = data.clientInfo
        const res = await checkRewardCodeAction(data.business_id, code, email, phoneNumber).catch(() => ({ ok: false as const, error: 'Could not check the code. Try again.' }))
        setChecking(false)
        if (res.ok) {
            setState({ ok: true, text: `${res.text} will come off your appointment.` })
            setData((prev: BookingData) => ({ ...prev, rewardCode: code.trim() }))
        } else {
            setState({ ok: false, text: res.error })
            setData((prev: BookingData) => ({ ...prev, rewardCode: '' }))
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor="reward-code" className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t-muted)' }}>Reward code</label>
            <div className="flex gap-2">
                <input
                    id="reward-code"
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setState(null); setData((prev: BookingData) => ({ ...prev, rewardCode: '' })) }}
                    placeholder="AA-XXXXXX"
                    autoCapitalize="characters"
                    autoComplete="off"
                    className="h-11 min-w-0 flex-1 px-3 font-mono text-base uppercase outline-none"
                    style={{ border: '1px solid var(--t-border)', borderRadius: 'var(--t-input-r)', backgroundColor: 'var(--t-card)', color: 'var(--t-text)' }}
                />
                <button
                    type="button"
                    onClick={check}
                    disabled={checking || !code.trim()}
                    className="flex h-11 shrink-0 items-center gap-1.5 px-4 text-sm font-medium disabled:opacity-50"
                    style={{ backgroundColor: 'var(--t-primary)', color: 'var(--t-primary-text)', borderRadius: 'var(--t-btn-r)' }}
                >
                    {checking ? <Loader2 size={14} className="animate-spin" /> : state?.ok ? <Check size={14} /> : null}
                    Apply
                </button>
            </div>
            {state && <p className="text-xs" style={{ color: state.ok ? '#15803D' : '#DC2626' }}>{state.text}</p>}
        </div>
    )
}
