'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { SiteRenderer } from '../templates'
import type { SiteData, SiteInfo } from '../siteData'
import { resolveTheme } from '../themes'

/**
 * Renders the site at a fixed width (390px phone, 1280px desktop) and scales
 * it to fit the space it's given. Templates lay out by their own width
 * (container queries), so the preview matches the real page on that device.
 * Links don't navigate in the preview.
 */
export function ScaledSite({ info, site, width, height, editing = true, interactive = true, className }: {
    info: SiteInfo
    site: SiteData
    /** Width the site is laid out at; 'fit' uses the frame's own width (no scaling). */
    width: number | 'fit'
    /** Visible height of the frame, in screen pixels; omit to show the whole page. */
    height?: number
    editing?: boolean
    interactive?: boolean
    className?: string
}) {
    const outer = useRef<HTMLDivElement>(null)
    const inner = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [fitWidth, setFitWidth] = useState(390)
    const [contentHeight, setContentHeight] = useState(0)
    const layoutWidth = width === 'fit' ? fitWidth : width
    const theme = resolveTheme(site.templateId, site.scheme, site.customColors, site.fontPairing)

    const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
    useIsoLayoutEffect(() => {
        const o = outer.current
        const i = inner.current
        if (!o || !i) return
        const update = () => {
            if (width === 'fit') setFitWidth(o.clientWidth || 390)
            else setScale(Math.min(1, o.clientWidth / width))
            setContentHeight(i.scrollHeight)
        }
        update()
        const ro = new ResizeObserver(update)
        ro.observe(o)
        ro.observe(i)
        return () => ro.disconnect()
    }, [width])

    return (
        <div
            ref={outer}
            className={className}
            style={{ height: height ?? contentHeight * scale, overflowY: height ? 'auto' : 'hidden', overflowX: 'hidden', position: 'relative', overscrollBehavior: 'contain' }}
        >
            <div style={{ height: contentHeight * scale, position: 'relative' }}>
                <div
                    ref={inner}
                    // Thumbnails (not interactive) hide the floating Book bar, which would cover the hero.
                    className={interactive ? undefined : '[&_[data-book-bar]]:hidden'}
                    // transform makes the sticky header/book bar and the lightbox stay inside the frame.
                    // --site-vh sizes "full screen" heroes to this frame rather than the browser window.
                    style={{ width: layoutWidth, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, pointerEvents: interactive ? undefined : 'none', ...(height ? { '--site-vh': `${height / scale / 100}px` } : {}) } as CSSProperties}
                    onClickCapture={e => {
                        const link = (e.target as HTMLElement).closest('a')
                        if (link) e.preventDefault()
                    }}
                    aria-hidden={!interactive || undefined}
                    inert={!interactive || undefined}
                >
                    <SiteRenderer info={info} site={site} theme={theme} basePath="" editing={editing} />
                </div>
            </div>
        </div>
    )
}

/** The builder's live preview, with a phone/desktop switch. */
export function SitePreview({ info, site, device, fullBleed }: {
    info: SiteInfo
    site: SiteData
    device: 'phone' | 'desktop'
    /** On phones the preview fills the screen instead of sitting in a frame. */
    fullBleed?: boolean
}) {
    if (fullBleed) {
        return <ScaledSite info={info} site={site} width="fit" className="w-full" />
    }
    if (device === 'phone') {
        return (
            <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[2rem] border-[6px] border-[#1A1818] bg-white shadow-xl">
                <ScaledSite info={info} site={site} width={390} height={720} />
            </div>
        )
    }
    return (
        <div className="w-full overflow-hidden rounded-xl border border-[#E8E2D6] bg-white shadow-xl">
            <div className="flex h-8 items-center gap-1.5 border-b border-[#E8E2D6] bg-[#FAF7F2] px-3" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#E8E2D6]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E8E2D6]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E8E2D6]" />
            </div>
            <ScaledSite info={info} site={site} width={1280} height={640} />
        </div>
    )
}
