'use client'

import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateStripeOnboardInfo } from './actions'

export default function ReturnClient() {
    const params = useParams()
    const stripe_account_id: any = params.stripe_account_id
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        (async () => {
            try {
                const result = await updateStripeOnboardInfo(stripe_account_id)
                if (result !== -1) {
                    router.replace('/dashboard')
                } else {
                    // Requirements still outstanding — restart onboarding
                    router.replace(`/onboarding/${stripe_account_id}`)
                }
            } catch {
                setError('Something went wrong finishing setup with Stripe.')
            }
        })()
    }, [])

    if (error) {
        return (
            <div className="flex w-full flex-col gap-4 h-screen justify-center items-center px-4 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                    onClick={() => router.replace(`/onboarding/${stripe_account_id}`)}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium"
                    style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                >
                    Try again
                </button>
            </div>
        )
    }

    return (
        <div className="flex w-full flex-col gap-2 h-screen justify-center items-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Redirecting…</p>
        </div>
    )
}
