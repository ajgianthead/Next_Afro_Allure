'use client'

import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { updateStripeOnboardInfo } from './actions'

export default function ReturnClient() {
    const params = useParams()
    const stripe_account_id: any = params.stripe_account_id
    const router = useRouter()

    useEffect(() => {
        (async () => {
            const result = await updateStripeOnboardInfo(stripe_account_id)
            if (result !== -1) {
                router.replace('/dashboard')
            } else {
                // Requirements still outstanding — restart onboarding
                router.replace(`/onboarding/${stripe_account_id}`)
            }
        })()
    }, [])

    return (
        <div className="flex w-full flex-col gap-2 h-screen justify-center items-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Redirecting…</p>
        </div>
    )
}
