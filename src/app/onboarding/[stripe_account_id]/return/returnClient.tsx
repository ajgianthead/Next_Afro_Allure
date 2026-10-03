'use client'

import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { updateStripeOnboardInfo } from './actions'

export default function ReturnClient() {
    const params = useParams()
    const stripe_account_id = params.stripe_account_id as string
    const router = useRouter()

    useEffect(() => {
        (async () => {
            // Always land back in the dashboard. Previously an unfinished
            // Stripe form (e.g. "Return to AfroAllure" mid-way) bounced the
            // business straight back into Stripe, and any error left them
            // stuck on this page with no way back to the dashboard.
            try {
                const result = await updateStripeOnboardInfo(stripe_account_id)
                router.replace(result === 'complete'
                    ? '/dashboard/monetization?onboarding=complete'
                    : '/dashboard/monetization?onboarding=incomplete')
            } catch (err) {
                console.error('Failed to finalize Stripe onboarding:', err)
                router.replace('/dashboard/monetization?onboarding=error')
            }
        })()
    }, [])

    return (
        <div className="flex w-full flex-col gap-2 h-screen justify-center items-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Taking you back to your dashboard…</p>
        </div>
    )
}
