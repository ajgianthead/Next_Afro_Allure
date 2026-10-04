const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

// Shown before any subscription checkout so the per-booking fees
// is disclosed up front, not discovered later on a payout statement.
export function FeeDisclosure({ planName, monthlyAmount }: { planName: string; monthlyAmount: number }) {
    return (
        <div
            className="flex flex-col gap-1.5 rounded-xl p-3 text-sm"
            style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8E2D6' }}
        >
            <div className="flex justify-between">
                <span style={{ color: '#6F6863' }}>Plan</span>
                <span style={{ color: '#1A1818' }}>{planName}</span>
            </div>
            <div className="flex justify-between">
                <span style={{ color: '#6F6863' }}>Subscription</span>
                <span style={{ color: '#1A1818' }}>${monthlyAmount}/month</span>
            </div>
            <div style={{ borderTop: '1px solid #E8E2D6', margin: '4px 0' }} />
            <div className="flex justify-between">
                <span style={{ color: '#6F6863' }}>Platform fee on bookings</span>
                <span style={{ color: '#1A1818' }}>1% per transaction</span>
            </div>
            <div className="flex justify-between">
                <span style={{ color: '#6F6863' }}>Card processing (Stripe, at cost)</span>
                <span style={{ color: '#1A1818' }}>2.9% + $0.30 per transaction</span>
            </div>
            <div style={{ borderTop: '1px solid #E8E2D6', margin: '4px 0' }} />
            <div className="flex justify-between font-medium">
                <span style={{ fontFamily: SERIF, color: '#1A1818' }}>You pay today</span>
                <span style={{ fontFamily: SERIF, color: '#1A1818' }}>${monthlyAmount}</span>
            </div>
            <p className="text-xs mt-1" style={{ color: '#6F6863' }}>
                No hidden fees. The 1% platform fee and Stripe&rsquo;s processing fee (passed through at cost, no markup) only
                apply to card payments you collect from clients — they&rsquo;re taken from your payout, not charged to you
                separately. Cash payments have no fees.
            </p>
        </div>
    )
}
