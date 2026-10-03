'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export const COOKIE_CONSENT_KEY = 'aa_cookie_consent'
export const COOKIE_CONSENT_EVENT = 'aa-cookie-consent-changed'

export function CookieBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        try {
            if (!localStorage.getItem(COOKIE_CONSENT_KEY)) setVisible(true)
        } catch {
            // localStorage unavailable (private mode, etc.) — skip the banner
        }
    }, [])

    const setConsent = (value: 'all' | 'necessary') => {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, value)
        } catch {
            // ignore — consent just won't persist across visits
        }
        window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }))
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div
            role="region"
            aria-label="Cookie consent"
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-5 py-4"
            style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
        >
            <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
                We use cookies to keep you signed in and, with your consent, to understand how AfroAllure is used.{' '}
                <Link href="/cookies" className="underline" style={{ color: '#FC6161' }}>
                    Learn more
                </Link>
            </p>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={() => setConsent('necessary')}
                    className="text-sm px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: 'transparent', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                    Necessary Only
                </button>
                <button
                    type="button"
                    onClick={() => setConsent('all')}
                    className="text-sm px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                >
                    Accept All
                </button>
            </div>
        </div>
    )
}
