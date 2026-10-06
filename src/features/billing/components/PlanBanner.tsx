'use client'

import { useUpgrade } from './UpgradeDialog'

/**
 * Shown to accounts from before paid plans while their free early access
 * runs: when it ends and what happens next. Says nothing about how the
 * access was granted.
 */
export function PlanBanner({ subscriptionStatus, complimentaryUntil }: {
    subscriptionStatus: string | null | undefined
    complimentaryUntil: string | null | undefined
}) {
    const { openUpgrade } = useUpgrade()
    if (subscriptionStatus !== 'complimentary' || !complimentaryUntil) return null
    const ends = new Date(complimentaryUntil)
    if (Number.isNaN(ends.getTime()) || ends.getTime() < Date.now()) return null

    const date = ends.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const daysLeft = Math.max(1, Math.ceil((ends.getTime() - Date.now()) / 86_400_000))

    return (
        <div
            className="mt-3 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
            style={{ backgroundColor: 'rgba(201,151,74,0.08)', border: '1px solid rgba(201,151,74,0.3)' }}
        >
            <p className="text-sm" style={{ color: '#1A1818' }}>
                <strong>Your free access to Growth ends {date}</strong>
                <span style={{ color: '#6F6863' }}>
                    {' '}({daysLeft} day{daysLeft === 1 ? '' : 's'} left). Choose a plan to keep everything, or you&apos;ll move to the free Starter plan.
                </span>
            </p>
            <button
                type="button"
                onClick={openUpgrade}
                className="shrink-0 rounded-xl px-4 py-2 text-xs font-semibold"
                style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
            >
                See plans
            </button>
        </div>
    )
}
