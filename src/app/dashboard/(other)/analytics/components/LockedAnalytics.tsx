import { GlassOverlay } from '@/components/dashboard/PlanGate'
import { AnalyticsSkeleton } from './AnalyticsSkeleton'

interface LockedAnalyticsProps {
    business: {
        had_trial: boolean
        stripe_customer_id: string | null
        business_id: string
    }
}

export function LockedAnalytics({ business }: LockedAnalyticsProps) {
    return (
        <div className="p-4 sm:p-6 max-w-5xl">
            <div className="mb-6">
                <h1
                    className="text-lg font-semibold"
                    style={{ fontFamily: 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)', color: '#1A1818' }}
                >
                    Analytics
                </h1>
                <p className="text-sm mt-0.5" style={{ color: '#6F6863' }}>
                    Track earnings, booking trends, client retention, and growth.
                </p>
            </div>
            <GlassOverlay
                featureName="Analytics"
                description="Track earnings, booking trends, client retention, and growth — all in one place."
                businessData={{
                    hadTrial: business.had_trial,
                    stripeCustomerId: business.stripe_customer_id,
                    businessId: business.business_id,
                }}
            >
                <AnalyticsSkeleton />
            </GlassOverlay>
        </div>
    )
}
