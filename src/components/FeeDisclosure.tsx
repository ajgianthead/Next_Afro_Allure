import {
    dollars, GROWTH_MONTHLY_CENTS, GROWTH_YEARLY_CENTS, TRIAL_DAYS, YEARLY_SAVINGS_PERCENT,
} from '@/features/billing/plans'
import { INSTANT_PAYOUT_FEE_LABEL } from '@/lib/fees'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

// Shown before signup and plan upgrades so the per-booking fees are
// disclosed up front, not discovered later on a payout statement.
export function FeeDisclosure({ signup = false }: { signup?: boolean }) {
    const Row = ({ label, value }: { label: string; value: string }) => (
        <div className="flex justify-between gap-3">
            <span style={{ color: '#6F6863' }}>{label}</span>
            <span className="text-right" style={{ color: '#1A1818' }}>{value}</span>
        </div>
    )
    return (
        <div
            className="flex flex-col gap-1.5 rounded-xl p-3 text-sm"
            style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8E2D6' }}
        >
            <Row label="Growth" value={`${dollars(GROWTH_MONTHLY_CENTS)}/mo or ${dollars(GROWTH_YEARLY_CENTS)}/yr (save ${YEARLY_SAVINGS_PERCENT}%)`} />
            <Row label="AfroAllure fee on Growth" value="0%" />
            <Row label="Starter (free plan)" value="1% per card payment" />
            <Row label="Card processing (Stripe, at cost)" value="2.9% + $0.30 per card payment" />
            <Row label="Payouts to your bank" value="Free (about 2 business days)" />
            <Row label="Instant payouts (optional)" value={INSTANT_PAYOUT_FEE_LABEL} />
            {signup && (
                <>
                    <div style={{ borderTop: '1px solid #E8E2D6', margin: '4px 0' }} />
                    <div className="flex justify-between font-medium">
                        <span style={{ fontFamily: SERIF, color: '#1A1818' }}>You pay today</span>
                        <span style={{ fontFamily: SERIF, color: '#1A1818' }}>$0</span>
                    </div>
                </>
            )}
            <p className="text-xs mt-1" style={{ color: '#6F6863' }}>
                {signup && `Every account starts on the free Starter plan. Upgrade to Growth whenever you like and try it free for ${TRIAL_DAYS} days, no card needed. `}
                Fees only apply to card payments you collect from clients and come out of your payout, not charged to you
                separately. Cash payments have no fees.
            </p>
        </div>
    )
}
