'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { resendConfirmationEmail } from './actions'

/** "Resend confirmation email" for people whose link never arrived or expired. */
export function ResendConfirmationButton({ email }: { email: string }) {
    const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
    const [error, setError] = useState<string | null>(null)

    const resend = async () => {
        if (state === 'sending') return
        setState('sending')
        setError(null)
        const res = await resendConfirmationEmail(email).catch(() => null)
        if (res && !res.ok) {
            setError(res.error)
            setState('idle')
            return
        }
        setState('sent')
    }

    return (
        <div className="text-center">
            <button
                type="button"
                onClick={resend}
                disabled={state !== 'idle' || !email}
                className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-60"
                style={{ color: '#FC6161' }}
            >
                {state === 'sending' && <Loader2 size={14} className="animate-spin" />}
                {state === 'sent' ? 'Sent. Check your inbox.' : 'Resend confirmation email'}
            </button>
            {error && (
                <p className="text-xs mt-2" style={{ color: '#DC2626' }}>{error}</p>
            )}
        </div>
    )
}
