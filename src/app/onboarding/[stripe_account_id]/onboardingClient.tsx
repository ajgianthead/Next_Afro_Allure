'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createAccountLinkAction } from '@/features/stripe/actions'

export default function OnboardingClient() {
    const accountID = useParams().stripe_account_id as string
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        createAccountLinkAction(accountID)
            .then((url) => router.replace(url))
            .catch(() => setError('Could not start Stripe setup. Please try again.'))
    }, [])

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center w-screen h-screen gap-4 px-4 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium"
                    style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                >
                    Try again
                </button>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center w-screen h-screen">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
    )
}
