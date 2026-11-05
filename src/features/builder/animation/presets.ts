// Animation presets: what each entrance does, timing, and which choices each
// plan gets. Pure data, no DOM — used by the runner and the Animation tab.

import {
    BASIC_AMBIENT, BASIC_ENTRANCES, BASIC_HOVER, BASIC_SCROLL,
    type AmbientEffect, type Entrance, type HoverEffect, type ScrollEffect, type SectionAnimation, type Tier,
} from '../types'

/** Keyframes as [from, to] per property, in the shape motion's animate() takes. */
export type Keyframes = Record<string, [string | number, string | number]>

export const ENTRANCE_KEYFRAMES: Record<Exclude<Entrance, 'none'>, Keyframes> = {
    'fade': { opacity: [0, 1] },
    'fade-up': { opacity: [0, 1], y: [24, 0] },
    'fade-down': { opacity: [0, 1], y: [-24, 0] },
    'slide-left': { opacity: [0, 1], x: [-48, 0] },
    'slide-right': { opacity: [0, 1], x: [48, 0] },
    'zoom-in': { opacity: [0, 1], scale: [0.92, 1] },
    'zoom-out': { opacity: [0, 1], scale: [1.08, 1] },
    'blur-in': { opacity: [0, 1], filter: ['blur(12px)', 'blur(0px)'] },
    'soft-rise': { opacity: [0, 1], y: [40, 0] },
    'reveal-up': { opacity: [1, 1], clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'] },
    'reveal-sides': { opacity: [1, 1], clipPath: ['inset(0% 50% 0% 50%)', 'inset(0% 0% 0% 0%)'] },
    // Headings are split into words; each word rises (lines: quick, words: one by one).
    'lines': { opacity: [0, 1], y: ['0.6em', '0em'] },
    'words': { opacity: [0, 1], y: ['0.4em', '0em'] },
    'flip-in': { opacity: [0, 1], rotateX: [35, 0], transformPerspective: [800, 800] },
}

/** Entrances that animate a heading word by word, and the gap between words (ms). */
export const SPLIT_ENTRANCES: Partial<Record<Entrance, number>> = { lines: 35, words: 90 }

export const EASINGS: Record<SectionAnimation['easing'], [number, number, number, number]> = {
    smooth: [0.22, 1, 0.36, 1],
    snappy: [0.4, 0, 0.2, 1],
    soft: [0.34, 1.56, 0.64, 1], // a slight overshoot ("soft bounce")
}

export const DURATIONS = { fast: 350, normal: 600, slow: 1000 } as const

// ─── Labels for the Animation tab ────────────────────────────────────────────

export const ENTRANCE_LABELS: Record<Entrance, string> = {
    'none': 'None', 'fade': 'Fade', 'fade-up': 'Fade up', 'fade-down': 'Fade down',
    'slide-left': 'Slide from left', 'slide-right': 'Slide from right', 'zoom-in': 'Zoom in', 'zoom-out': 'Zoom out',
    'blur-in': 'Blur in', 'soft-rise': 'Soft rise', 'reveal-up': 'Reveal up', 'reveal-sides': 'Reveal from sides',
    'lines': 'Heading line by line', 'words': 'Heading word by word', 'flip-in': 'Gentle flip in',
}
export const SCROLL_LABELS: Record<ScrollEffect, string> = {
    'none': 'None', 'parallax-slow': 'Parallax background (slow)', 'parallax-medium': 'Parallax background (medium)',
    'zoom': 'Photo zooms while scrolling', 'fade-out': 'Fades out when leaving', 'sticky': 'Sticky photo',
}
export const HOVER_LABELS: Record<HoverEffect, string> = {
    'none': 'None', 'lift': 'Lift', 'zoom': 'Zoom photo', 'glow': 'Glow', 'underline': 'Underline grows', 'tilt': 'Slight tilt',
}
export const AMBIENT_LABELS: Record<AmbientEffect, string> = {
    'none': 'None', 'kenburns': 'Slow zoom on photo', 'gradient': 'Gradient drift',
}

// ─── Plan gating ─────────────────────────────────────────────────────────────

export const entranceTier = (e: Entrance): Tier => (BASIC_ENTRANCES.includes(e) ? 'basic' : 'pro')
export const scrollTier = (e: ScrollEffect): Tier => (BASIC_SCROLL.includes(e) ? 'basic' : 'pro')
export const hoverTier = (e: HoverEffect): Tier => (BASIC_HOVER.includes(e) ? 'basic' : 'pro')
export const ambientTier = (e: AmbientEffect): Tier => (BASIC_AMBIENT.includes(e) ? 'basic' : 'pro')

/** The animation with every Growth-only choice replaced by its plain equivalent. */
export function basicAnimation(a: SectionAnimation): SectionAnimation {
    return {
        ...a,
        entrance: entranceTier(a.entrance) === 'basic' ? a.entrance : 'fade-up',
        scroll: scrollTier(a.scroll) === 'basic' ? a.scroll : 'none',
        hover: hoverTier(a.hover) === 'basic' ? a.hover : 'none',
        ambient: ambientTier(a.ambient) === 'basic' ? a.ambient : 'none',
        countUp: false,
    }
}

/** True when the animation uses anything Growth-only. */
export const animationIsPro = (a: SectionAnimation) =>
    entranceTier(a.entrance) === 'pro' || scrollTier(a.scroll) === 'pro' || hoverTier(a.hover) === 'pro' || ambientTier(a.ambient) === 'pro' || a.countUp
