'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Cloudflare Turnstile for a public form. Render `turnstile` somewhere in the
 * form and call `getToken()` right before submitting; pass the token to the
 * server action, which checks it (see guardPublicAction).
 *
 * The widget stays invisible unless Cloudflare needs the person to click
 * something. A fresh token is fetched on each submit, so tokens never expire
 * mid-form or get reused. With NEXT_PUBLIC_TURNSTILE_SITE_KEY unset this does
 * nothing and getToken() returns null.
 */

type TurnstileApi = {
    render: (el: HTMLElement, opts: Record<string, unknown>) => string
    execute: (id: string) => void
    reset: (id: string) => void
    remove: (id: string) => void
}
declare global {
    interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
    if (window.turnstile) return Promise.resolve()
    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = SCRIPT_SRC
            s.async = true
            s.onload = () => resolve()
            s.onerror = () => { scriptPromise = null; reject(new Error('Turnstile failed to load')) }
            document.head.appendChild(s)
        })
    }
    return scriptPromise
}

export function useTurnstile(action: string) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    // A callback ref: the widget renders whenever its placeholder appears (forms often mount after a loading state).
    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const widgetId = useRef<string | null>(null)
    const ready = useRef<Promise<void> | null>(null)
    const waiting = useRef<((token: string | null) => void) | null>(null)

    useEffect(() => {
        if (!siteKey || !container) return
        let cancelled = false
        ready.current = loadScript().then(() => {
            if (cancelled || !container || !window.turnstile) return
            widgetId.current = window.turnstile.render(container, {
                sitekey: siteKey,
                action,
                execution: 'execute',
                appearance: 'interaction-only',
                callback: (token: string) => { waiting.current?.(token); waiting.current = null },
                'error-callback': () => { waiting.current?.(null); waiting.current = null },
                'expired-callback': () => { /* a new token is fetched on submit */ },
            })
        }).catch(() => { /* script blocked: the server decides (it allows through if Cloudflare is unreachable) */ })
        return () => {
            cancelled = true
            if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
            widgetId.current = null
        }
    }, [siteKey, action, container])

    /** A fresh token for this submit, or null (not configured, blocked, or timed out after 30s). */
    const getToken = useCallback(async (): Promise<string | null> => {
        if (!siteKey) return null
        try { await ready.current } catch { return null }
        const id = widgetId.current
        if (!id || !window.turnstile) return null
        return new Promise(resolve => {
            const timer = setTimeout(() => { waiting.current = null; resolve(null) }, 30_000)
            waiting.current = (token) => { clearTimeout(timer); resolve(token) }
            window.turnstile!.reset(id)
            window.turnstile!.execute(id)
        })
    }, [siteKey])

    return { turnstile: <div ref={setContainer} />, getToken }
}
