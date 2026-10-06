'use client'

import { Check, Loader2 } from 'lucide-react'
import { createContext, useCallback, useContext, useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { startGrowthCheckout } from 'app/for-businesses/actions'
import {
    dollars, GROWTH_MONTHLY_CENTS, GROWTH_YEARLY_CENTS, TRIAL_DAYS, YEARLY_FREE_MONTHS,
    YEARLY_SAVINGS_CENTS, YEARLY_SAVINGS_PERCENT, yearlyPerMonth, type BillingInterval,
} from '../plans'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const RED = '#FC6161'
const INK = '#1A1818'
const MUTED = '#6F6863'
const LINE = '#E8E2D6'

const GROWTH_INCLUDES = [
    'No AfroAllure fee on payments (Starter pays 1%)',
    'Unlimited bookings and availability schedules',
    'Automatic client reminders',
    'Loyalty rewards, rebook reminders and waitlist',
    'No-show and late fees',
    'Full booking-site editor',
]

const UpgradeContext = createContext<{ openUpgrade: () => void }>({ openUpgrade: () => {} })

/** Opens the Growth plan picker from anywhere in the dashboard. */
export const useUpgrade = () => useContext(UpgradeContext)

export function UpgradeProvider({ children, hadTrial }: { children: React.ReactNode; hadTrial: boolean }) {
    const [open, setOpen] = useState(false)
    const openUpgrade = useCallback(() => setOpen(true), [])
    return (
        <UpgradeContext.Provider value={{ openUpgrade }}>
            {children}
            <UpgradeDialog open={open} onOpenChange={setOpen} hadTrial={hadTrial} />
        </UpgradeContext.Provider>
    )
}

export function UpgradeDialog({ open, onOpenChange, hadTrial }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    hadTrial: boolean
}) {
    const [interval, setBillingInterval] = useState<BillingInterval>('year')
    const [loading, setLoading] = useState(false)

    const go = async () => {
        setLoading(true)
        try {
            window.location.href = await startGrowthCheckout(interval)
        } catch {
            toast.error('Failed to start checkout. Please try again.')
            setLoading(false)
        }
    }

    const Option = ({ value, title, price, sub, badge }: {
        value: BillingInterval; title: string; price: string; sub: string; badge?: string
    }) => {
        const active = interval === value
        return (
            <button
                type="button"
                onClick={() => setBillingInterval(value)}
                className="relative flex-1 rounded-xl p-4 text-left transition-shadow"
                style={{
                    border: `${active ? 2 : 1}px solid ${active ? RED : LINE}`,
                    backgroundColor: active ? 'rgba(252,97,97,0.04)' : '#FFFFFF',
                }}
                aria-pressed={active}
            >
                {badge && (
                    <span className="absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: RED, color: '#FFFFFF' }}>
                        {badge}
                    </span>
                )}
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: active ? RED : MUTED }}>{title}</div>
                <div className="mt-1" style={{ fontFamily: SERIF, fontSize: 26, color: INK }}>{price}</div>
                <div className="text-xs" style={{ color: MUTED }}>{sub}</div>
            </button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={v => !loading && onOpenChange(v)}>
            <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] sm:max-w-md" style={{ borderColor: LINE }}>
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: SERIF, color: INK, fontSize: '1.2rem' }}>Upgrade to Growth</DialogTitle>
                    <DialogDescription style={{ color: MUTED }}>
                        {hadTrial
                            ? 'Everything AfroAllure does, with no fee on your payments.'
                            : `Try everything free for ${TRIAL_DAYS} days. No card needed to start.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-3 mt-2">
                    <Option
                        value="year"
                        title="Yearly"
                        price={`${dollars(GROWTH_YEARLY_CENTS)}/yr`}
                        sub={`${yearlyPerMonth()}/mo · save ${dollars(YEARLY_SAVINGS_CENTS)}`}
                        badge={`Save ${YEARLY_SAVINGS_PERCENT}%`}
                    />
                    <Option
                        value="month"
                        title="Monthly"
                        price={`${dollars(GROWTH_MONTHLY_CENTS)}/mo`}
                        sub="Cancel anytime"
                    />
                </div>
                {interval === 'year' && (
                    <p className="text-xs -mt-1" style={{ color: MUTED }}>
                        {YEARLY_FREE_MONTHS} months free compared with paying monthly.
                    </p>
                )}

                <ul className="flex flex-col gap-2 mt-1">
                    {GROWTH_INCLUDES.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                            <Check size={14} style={{ color: RED, flexShrink: 0 }} />
                            {f}
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    onClick={go}
                    disabled={loading}
                    className="mt-2 w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
                >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {hadTrial ? 'Continue to checkout' : `Start ${TRIAL_DAYS}-day free trial`}
                </button>
                <p className="text-[11px] text-center" style={{ color: MUTED }}>
                    {hadTrial
                        ? 'Secure checkout by Stripe.'
                        : `You won't be charged during the trial. Add a card any time before day ${TRIAL_DAYS} to keep Growth.`}
                </p>
            </DialogContent>
        </Dialog>
    )
}
