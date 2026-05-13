'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createSubscriptionCheckout, createSubscriptionForExistingCustomer } from 'app/for-businesses/actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export interface GatableBusinessData {
    hadTrial?: boolean
    stripeCustomerId?: string | null
    businessId?: string
}

export function PlanGateCard({ featureName, description, businessData }: {
    featureName: string
    description: string
    businessData: GatableBusinessData
}) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleUpgrade = async () => {
        setLoading(true)
        try {
            const session = businessData.stripeCustomerId
                ? await createSubscriptionForExistingCustomer(businessData.stripeCustomerId)
                : await createSubscriptionCheckout(businessData.hadTrial ?? false, businessData.businessId)
            if (session.url) router.push(session.url)
        } catch {
            toast.error('Failed to start checkout. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="rounded-2xl p-6 flex flex-col gap-4 max-w-sm w-full"
            style={{ backgroundColor: 'white', border: '1px solid #E8E2D6' }}
        >
            <span
                className="self-start text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: 'rgba(201,151,74,0.1)', color: '#C9974A' }}
            >
                Growth Plan Feature
            </span>
            <div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                    {featureName}
                </h3>
                <p className="text-sm mt-1" style={{ color: '#6F6863' }}>{description}</p>
            </div>
            <div>
                <p className="text-sm font-medium" style={{ color: '#1A1818' }}>$25/month · 14-day free trial</p>
                <p className="text-xs mt-0.5" style={{ color: '#6F6863' }}>No credit card required</p>
            </div>
            <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#FC6161', color: 'white' }}
            >
                {loading ? 'Loading…' : 'Start Free Trial'}
            </button>
            <a
                href="/for-businesses#pricing"
                className="text-center text-xs hover:underline"
                style={{ color: '#6F6863' }}
            >
                See all Growth features →
            </a>
        </div>
    )
}

export function GlassOverlay({ children, featureName, description, businessData }: {
    children: React.ReactNode
    featureName: string
    description: string
    businessData: GatableBusinessData
}) {
    return (
        <div className="relative">
            <div className="blur-sm pointer-events-none select-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <PlanGateCard featureName={featureName} description={description} businessData={businessData} />
            </div>
        </div>
    )
}
