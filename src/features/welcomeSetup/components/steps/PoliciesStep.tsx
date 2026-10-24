'use client'

import { Lock } from 'lucide-react'
import { IconShieldCheck } from '@tabler/icons-react'
import type { WelcomePolicy } from '../../server/actions'
import { BOOK_AHEAD_OPTIONS } from '../../progress'
import { BRAND, StepHeader, inputStyle } from '../shared'

export function PoliciesStep({ policy, onChange }: { policy: WelcomePolicy; onChange: (policy: WelcomePolicy) => void }) {
    const set = (patch: Partial<WelcomePolicy>) => onChange({ ...policy, ...patch })
    // Keep a value set elsewhere (e.g. "6 week") selectable.
    const bookAheadOptions = BOOK_AHEAD_OPTIONS.some(o => o.value === policy.bookAheadValue)
        ? BOOK_AHEAD_OPTIONS
        : [{ value: policy.bookAheadValue, label: policy.bookAheadValue.replace(/^(\d+) (\w+)$/, (_, n, u) => `${n} ${u}${n === '1' ? '' : 's'}`) }, ...BOOK_AHEAD_OPTIONS]

    return (
        <div className="flex flex-col gap-4">
            <StepHeader icon={IconShieldCheck} eyebrow="Your policies" title="Set your booking rules">
                Clients see these before they book. The defaults work for most people, so change only what you need.
            </StepHeader>

            <div className="flex flex-col gap-3 rounded-xl p-4" style={{ border: `1px solid ${BRAND.border}` }}>
                <NumberRule
                    prefix="Clients can't cancel within"
                    suffix="days of their appointment"
                    value={policy.cancelDayLimit}
                    max={60}
                    onChange={cancelDayLimit => set({ cancelDayLimit })}
                />
                <NumberRule
                    prefix="Clients can't reschedule within"
                    suffix="days of their appointment"
                    value={policy.rescheduleDayLimit}
                    max={60}
                    onChange={rescheduleDayLimit => set({ rescheduleDayLimit })}
                />
                <NumberRule
                    prefix="Clients can reschedule"
                    suffix="times per appointment"
                    value={policy.rescheduleLimit}
                    max={20}
                    onChange={rescheduleLimit => set({ rescheduleLimit })}
                />
                <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: BRAND.ink }}>
                    <span>Clients can book up to</span>
                    <select
                        aria-label="How far ahead clients can book"
                        value={policy.bookAheadValue}
                        onChange={e => set({ bookAheadValue: e.target.value })}
                        className="h-9 rounded-lg px-2 text-base sm:text-sm outline-none"
                        style={inputStyle()}
                    >
                        {bookAheadOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <span>ahead</span>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="welcome-read-before" className="text-xs font-medium" style={{ color: BRAND.warm }}>
                    Read before booking (optional)
                </label>
                <textarea
                    id="welcome-read-before"
                    value={policy.readBeforeBooking}
                    maxLength={5000}
                    rows={3}
                    placeholder="e.g. A $20 late fee applies after 15 minutes. No extra guests, please."
                    onChange={e => set({ readBeforeBooking: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-base sm:text-sm outline-none resize-y"
                    style={inputStyle()}
                />
                <p className="text-[11px]" style={{ color: BRAND.warm }}>Shown to clients before they start booking.</p>
            </div>

            <div
                className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{ backgroundColor: BRAND.cream, border: `1px solid ${BRAND.border}` }}
            >
                <Lock size={15} className="mt-0.5 shrink-0" color={BRAND.gold} />
                <p className="text-xs leading-relaxed" style={{ color: BRAND.warm }}>
                    <span className="font-medium" style={{ color: BRAND.ink }}>Deposits, late fees and no-show fees</span>
                    <br />
                    Connect payments in Monetization to take deposits and charge fees. You can turn them on in Booking
                    Settings after that.
                </p>
            </div>
        </div>
    )
}

function NumberRule({ prefix, suffix, value, max, onChange }: {
    prefix: string
    suffix: string
    value: number
    max: number
    onChange: (value: number) => void
}) {
    return (
        <label className="flex flex-wrap items-center gap-2 text-sm" style={{ color: BRAND.ink }}>
            <span>{prefix}</span>
            <input
                type="number"
                min={0}
                max={max}
                inputMode="numeric"
                value={value}
                onChange={e => {
                    const n = parseInt(e.target.value)
                    onChange(Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0)
                }}
                className="h-9 w-16 rounded-lg px-2 text-center text-base sm:text-sm outline-none"
                style={inputStyle()}
            />
            <span>{suffix}</span>
        </label>
    )
}
