import { NextResponse } from 'next/server'
import { MAX_PAGE_BYTES } from '@/features/builder/page'
import { saveDraft } from '@/features/builder/server/draft'

/**
 * Saves the website editor's draft when the page is closing (the editor sends
 * it with navigator.sendBeacon, which survives the page unloading; a server
 * action doesn't). Same rules as the editor's autosave: the signed-in owner's
 * own draft only.
 */
export async function POST(req: Request) {
    // Same-origin only (sendBeacon sends Origin); the auth cookie is SameSite=Lax as well.
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    if (!origin || !host || new URL(origin).host !== host) return NextResponse.json({ ok: false }, { status: 403 })

    const text = await req.text()
    if (text.length > MAX_PAGE_BYTES + 10_000) return NextResponse.json({ ok: false, error: 'Too large' }, { status: 413 })
    let body: unknown
    try { body = JSON.parse(text) } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

    const r = await saveDraft(body)
    return NextResponse.json(r, { status: r.ok ? 200 : 400 })
}
