'use client'

import { decodeStoredReferral, encodeStoredReferral, normalizeReferralCode, referralStorageKey, startsNewVisit } from './referrals'

// A referral code from a shared link (?ref=) is remembered for that visit only
// (website → booking, in the same tab), in sessionStorage. The server
// re-checks everything when they book.

const checkedThisLoad = new Set<string>()

/**
 * Once per page load and business: drop any code left from an earlier visit
 * when this load starts a new one. Also clears the 30-day copy older versions
 * kept in localStorage, which is what brought referrals back on later visits.
 */
function forgetEarlierVisit(key: string) {
    if (checkedThisLoad.has(key)) return
    checkedThisLoad.add(key)
    try { window.localStorage.removeItem(key) } catch { /* storage blocked */ }
    const nav = performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined
    if (startsNewVisit({ referrer: document.referrer, origin: window.location.origin, navigationType: nav?.type })) {
        try { window.sessionStorage.removeItem(key) } catch { /* storage blocked */ }
    }
}

function codeInUrl(): string {
    return normalizeReferralCode(new URLSearchParams(window.location.search).get('ref'))
}

/** Remembers a ?ref= code for this visit and returns the code that applies now ('' for none). */
export function rememberReferralFromUrl(urlName: string): string {
    if (typeof window === 'undefined' || !urlName) return ''
    const key = referralStorageKey(urlName)
    forgetEarlierVisit(key)
    const fromUrl = codeInUrl()
    try {
        if (fromUrl) window.sessionStorage.setItem(key, encodeStoredReferral(fromUrl))
    } catch { /* storage blocked: the code still works on this page */ }
    return fromUrl || storedReferralCode(urlName)
}

/** The code for this visit, or ''. */
export function storedReferralCode(urlName: string): string {
    if (typeof window === 'undefined' || !urlName) return ''
    try {
        const key = referralStorageKey(urlName)
        forgetEarlierVisit(key)
        return codeInUrl() || decodeStoredReferral(window.sessionStorage.getItem(key))
    } catch {
        return ''
    }
}

/** Forget the code once a booking has used it. */
export function clearStoredReferral(urlName: string) {
    const key = referralStorageKey(urlName)
    try { window.sessionStorage.removeItem(key) } catch { /* ignore */ }
    try { window.localStorage.removeItem(key) } catch { /* ignore */ }
}
