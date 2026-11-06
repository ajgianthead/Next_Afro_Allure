'use client'

import { useEffect, useRef, useState } from 'react'
import { MediaView } from '@/features/siteBuilder/templates/parts'
import { paletteVars, sectionPalette } from '../palette'
import { runSectionAnimation } from '../animation/run'
import type { Divider, SectionProps, SectionType, Size } from '../types'
import { SectionProvider, useBuilder } from './context'
import { cx } from './primitives'

const PAD_TOP: Record<Size, string> = { none: 'pt-0', s: 'pt-8', m: 'pt-12 @3xl:pt-14', l: 'pt-14 @3xl:pt-20', xl: 'pt-20 @3xl:pt-32' }
const PAD_BOTTOM: Record<Size, string> = { none: 'pb-0', s: 'pb-8', m: 'pb-12 @3xl:pb-14', l: 'pb-14 @3xl:pb-20', xl: 'pb-20 @3xl:pb-32' }
const WIDTH = { narrow: 'max-w-3xl', normal: 'max-w-6xl', wide: 'max-w-7xl', full: 'max-w-none' } as const

/** Anchor the navbar links to, e.g. "services". */
export const anchorFor = (type: SectionType, anchor: string) =>
    (anchor || type.replace(/([a-z])([A-Z])/g, '$1-$2')).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')

function DividerShape({ shape, edge }: { shape: Divider; edge: 'top' | 'bottom' }) {
    if (shape === 'none') return null
    const paths: Record<Exclude<Divider, 'none'>, string> = {
        wave: 'M0 30 C 240 0 480 60 720 30 C 960 0 1200 60 1440 30 V60 H0 Z',
        curve: 'M0 60 Q 720 -20 1440 60 Z',
        slant: 'M0 60 L1440 0 V60 Z',
        zigzag: 'M0 60 L0 30 ' + Array.from({ length: 24 }, (_, i) => `L${i * 60 + 30} ${i % 2 ? 30 : 0} L${(i + 1) * 60} 30`).join(' ') + ' L1440 60 Z',
    }
    return (
        <svg aria-hidden viewBox="0 0 1440 60" preserveAspectRatio="none"
            className={cx('pointer-events-none absolute left-0 h-[28px] w-full @3xl:h-[48px]', edge === 'top' ? '-top-px rotate-180' : '-bottom-px')}
            style={{ fill: 'var(--s-bg)' }}>
            <path d={paths[shape]} />
        </svg>
    )
}

/**
 * Everything a section's settings do that isn't layout: colors (theme, own,
 * inverted), background (solid, gradient, image, video, overlay, pattern),
 * spacing and width, dividers, phone/desktop visibility, hover/ambient effects
 * and the animation. Layouts render inside it and only arrange content.
 */
export function SectionShell({ type, id, props, fullBleed, sticky, children }: {
    type: SectionType
    id?: string
    props: SectionProps<unknown>
    /** Layouts that run edge to edge (navbars, full-photo heroes) skip the padding and width wrapper. */
    fullBleed?: boolean
    /** Stays at the top while scrolling; 'overlay' also takes no height (the layout positions itself). */
    sticky?: boolean | 'overlay'
    children: React.ReactNode
}) {
    const { theme, editing, still } = useBuilder()
    const { style, animation } = props
    const palette = sectionPalette(theme, style)
    const ref = useRef<HTMLElement>(null)

    // Live site: animate on scroll. Editor: play when the settings change or Preview asks
    // (an aa-preview event for this section); with "Play animations" on (the canvas document
    // has data-aa-live), animate on scroll like the live site. The editor plays animations
    // even when the device asks for reduced motion, so the owner sees what they choose.
    const [live, setLive] = useState(false)
    useEffect(() => {
        const doc = ref.current?.ownerDocument
        if (!editing || !doc) return
        const sync = () => setLive(doc.documentElement.dataset.aaLive === '1')
        sync()
        doc.addEventListener('aa-live-preview', sync)
        return () => doc.removeEventListener('aa-live-preview', sync)
    }, [editing])

    const animKey = JSON.stringify(animation)
    const lastKey = useRef(animKey)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (still) return
        if (!editing) return runSectionAnimation(el, animation)
        if (live) {
            // Hide again so each section animates as it scrolls into view.
            el.querySelectorAll('[data-entered]').forEach(n => n.removeAttribute('data-entered'))
            return runSectionAnimation(el, animation, { force: true })
        }
        let cleanup: (() => void) | undefined
        // A changed setting plays right away (not on first load).
        if (lastKey.current !== animKey) cleanup = runSectionAnimation(el, animation, { immediate: true, force: true })
        lastKey.current = animKey
        const onPreview = (e: Event) => {
            if ((e as CustomEvent).detail?.id !== id) return
            cleanup?.()
            cleanup = runSectionAnimation(el, animation, { immediate: true, force: true })
        }
        el.ownerDocument.addEventListener('aa-preview', onPreview)
        return () => { el.ownerDocument.removeEventListener('aa-preview', onPreview); cleanup?.() }
    }, [editing, still, live, animKey, id]) // eslint-disable-line react-hooks/exhaustive-deps

    const bg = style.background
    const media = bg.kind === 'image' || bg.kind === 'video' ? bg.media : null
    const gradient = bg.kind === 'gradient' && bg.gradient ? `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})` : undefined

    return (
        <SectionProvider value={{ style, palette, animation, layout: props.layout }}>
            <section
                ref={ref}
                id={anchorFor(type, style.anchor)}
                data-section={type}
                className={cx(
                    sticky ? 'sticky top-0 z-40' : 'relative isolate scroll-mt-20',
                    sticky === 'overlay' && 'h-0',
                    style.visibility.hideMobile && 'aa-hide-mobile',
                    style.visibility.hideDesktop && 'aa-hide-desktop',
                    animation.hover !== 'none' && `aa-hover-${animation.hover}`,
                    animation.ambient === 'kenburns' && 'aa-ambient-kenburns',
                    animation.ambient === 'gradient' && gradient && 'aa-ambient-gradient',
                    bg.pattern && bg.pattern !== 'none' && `aa-pattern-${bg.pattern}`,
                )}
                style={{
                    ...(paletteVars(palette) as React.CSSProperties),
                    background: sticky === 'overlay' ? 'transparent' : gradient ?? 'var(--s-bg)',
                    color: 'var(--s-fg)',
                    borderTop: style.spacing.border ? '1px solid var(--s-border)' : undefined,
                }}
            >
                {media && (
                    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden" data-parallax="" data-kenburns="">
                        <div className="absolute inset-[-12%]" style={{ filter: bg.blur ? `blur(${bg.blur}px)` : undefined }}>
                            <MediaView media={media} alt="" />
                        </div>
                        {bg.overlay && bg.overlay.opacity > 0 && (
                            <div className="absolute inset-0" style={{ background: bg.overlay.color, opacity: Math.min(90, bg.overlay.opacity) / 100 }} />
                        )}
                    </div>
                )}
                <DividerShape shape={style.spacing.dividerTop} edge="top" />
                <div data-enter-root="">
                    {fullBleed ? children : (
                        <div className={cx('px-5 @3xl:px-12 @5xl:px-20', PAD_TOP[style.spacing.top], PAD_BOTTOM[style.spacing.bottom])}>
                            <div className={cx('mx-auto w-full', WIDTH[style.spacing.width])}>{children}</div>
                        </div>
                    )}
                </div>
                <DividerShape shape={style.spacing.dividerBottom} edge="bottom" />
            </section>
        </SectionProvider>
    )
}
