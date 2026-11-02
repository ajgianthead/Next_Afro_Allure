'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Render, type Data } from '@puckeditor/core'
import { renderConfig, type BuilderData } from '../config'
import type { BuilderMetadata } from './context'

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * A builder page drawn at `width` and scaled down to fit its frame, without
 * animations and without interaction (template cards, onboarding previews).
 */
export function PageThumbnail({ page, metadata, width = 390, height, className }: {
    page: BuilderData
    metadata: BuilderMetadata
    /** Width the page is laid out at, in CSS pixels. */
    width?: number
    /** Visible height of the frame; omit to show the whole page. */
    height?: number
    className?: string
}) {
    const outer = useRef<HTMLDivElement>(null)
    const inner = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [contentHeight, setContentHeight] = useState(0)

    useIsoLayoutEffect(() => {
        const o = outer.current, i = inner.current
        if (!o || !i) return
        const update = () => { setScale(Math.min(1, (o.clientWidth || width) / width)); setContentHeight(i.scrollHeight) }
        update()
        const ro = new ResizeObserver(update)
        ro.observe(o)
        ro.observe(i)
        return () => ro.disconnect()
    }, [width])

    return (
        <div ref={outer} className={className} style={{ height: height ?? contentHeight * scale, overflow: 'hidden', position: 'relative' }}>
            <div
                ref={inner}
                // transform keeps sticky bars inside the frame; inert: nothing in a thumbnail is clickable or focusable.
                style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as CSSProperties}
                aria-hidden
                inert
            >
                <Render config={renderConfig} data={page as Data} metadata={{ ...metadata, still: true } as unknown as Record<string, unknown>} />
            </div>
        </div>
    )
}
