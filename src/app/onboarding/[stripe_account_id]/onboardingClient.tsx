'use client'

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createAccountLinkAction } from '@/features/stripe/actions'

export default function OnboardingClient() {
    const accountID = useParams().stripe_account_id as string
    const router = useRouter()

    useEffect(() => {
        createAccountLinkAction(accountID).then((url) => router.replace(url))
    }, [])

    return (
        <div className="flex justify-center items-center w-screen h-screen">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
    )
}
