'use client'

import { decodeStoredReferral, encodeStoredReferral, normalizeReferralCode, referralStorageKey } from './referrals'

/**
 * Remembers a referral code from a shared link (?ref=) in this browser, per
 * business, so it still counts if the friend books later or after browsing
 * the website first. The server re-checks everything when they book.
 */
export function rememberReferralFromUrl(urlName: string): string {
    if (typeof window === 'undefined' || !urlName) return ''
    const fromUrl = normalizeReferralCode(new URLSearchParams(window.location.search).get('ref'))
    try {
        if (fromUrl) window.localStorage.setItem(referralStorageKey(urlName), encodeStoredReferral(fromUrl))
    } catch { /* storage blocked: the code still works on this visit */ }
    return fromUrl || storedReferralCode(urlName)
}

/** The remembered code for this business, or '' (expired after 30 days). */
export function storedReferralCode(urlName: string): string {
    if (typeof window === 'undefined' || !urlName) return ''
    try {
        const fromUrl = normalizeReferralCode(new URLSearchParams(window.location.search).get('ref'))
        if (fromUrl) return fromUrl
        return decodeStoredReferral(window.localStorage.getItem(referralStorageKey(urlName)))
    } catch {
        return ''
    }
}

/** Forget the code once a booking has used it. */
export function clearStoredReferral(urlName: string) {
    try { window.localStorage.removeItem(referralStorageKey(urlName)) } catch { /* ignore */ }
}
