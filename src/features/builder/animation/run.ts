// Runs a section's animation in the browser with motion's DOM API.
//
// Layouts mark what can move: data-enter="heading" | "text" | "item" | "media",
// data-parallax on a background layer, data-count on a number. The section
// root carries data-enter-root. On the live site builder.css hides marked
// elements (the page root has .aa-anim) until this runs; a 2.5 s safety rule
// reveals them anyway, a <noscript> rule shows them without JavaScript, and
// "reduce motion" turns everything off.

import { animate, inView, scroll } from 'motion'
import { DURATIONS, EASINGS, ENTRANCE_KEYFRAMES, SPLIT_ENTRANCES, type Keyframes } from './presets'
import type { SectionAnimation } from '../types'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const markShown = (els: Element[]) => els.forEach(el => el.setAttribute('data-entered', ''))

/** Splits a heading's text into word spans once, so words can rise one by one. */
function splitWords(el: HTMLElement): HTMLElement[] {
    if (el.dataset.split === '1') return Array.from(el.querySelectorAll<HTMLElement>('[data-word]'))
    const words = (el.textContent ?? '').split(/(\s+)/)
    el.textContent = ''
    for (const w of words) {
        if (/^\s+$/.test(w) || !w) { el.append(w); continue }
        const span = document.createElement('span')
        span.dataset.word = ''
        span.style.display = 'inline-block'
        span.textContent = w
        el.append(span)
    }
    el.dataset.split = '1'
    return Array.from(el.querySelectorAll<HTMLElement>('[data-word]'))
}

function fromKeyframes(kf: Keyframes): Record<string, string | number> {
    return Object.fromEntries(Object.entries(kf).map(([k, v]) => [k, v[0]]))
}

function countUp(el: HTMLElement, duration: number) {
    const text = el.dataset.countText ?? el.textContent ?? ''
    el.dataset.countText = text
    const m = text.match(/-?\d+(?:[.,]\d+)?/)
    if (!m) return
    const target = parseFloat(m[0].replace(',', '.'))
    const decimals = (m[0].split(/[.,]/)[1] ?? '').length
    animate(0, target, {
        duration: duration / 1000,
        ease: EASINGS.smooth,
        onUpdate: v => { el.textContent = text.replace(m[0], v.toFixed(decimals)) },
    })
}

/**
 * Starts the section's animation. Returns a cleanup function.
 * `immediate` plays it now (the editor's Preview button) instead of on scroll.
 */
export function runSectionAnimation(root: HTMLElement, a: SectionAnimation, opts: { immediate?: boolean } = {}): () => void {
    const all = Array.from(root.querySelectorAll<HTMLElement>('[data-enter]'))
    const cleanups: (() => void)[] = []

    if (reducedMotion() || a.entrance === 'none') {
        markShown(all)
    } else {
        const headings = all.filter(el => el.dataset.enter === 'heading')
        const texts = all.filter(el => el.dataset.enter === 'text' || el.dataset.enter === 'media')
        const items = all.filter(el => el.dataset.enter === 'item')
        // Which elements move, in order: [elements, delay before this group]
        const groups: HTMLElement[][] =
            a.target === 'section' ? [[root.querySelector<HTMLElement>('[data-enter-root]') ?? root]]
                : a.target === 'heading' ? [headings]
                    : a.target === 'items' ? [items.length ? items : [...headings, ...texts]]
                        : [[...headings, ...texts], items]
        const moving = new Set(groups.flat())
        // Everything not animated just shows.
        markShown(all.filter(el => !moving.has(el)))

        const split = SPLIT_ENTRANCES[a.entrance]
        const kf = ENTRANCE_KEYFRAMES[a.entrance]
        const duration = (a.duration || DURATIONS.normal) / 1000
        const ease = EASINGS[a.easing] ?? EASINGS.smooth

        const play = () => {
            let offset = a.delay / 1000
            for (const group of groups) {
                group.forEach((el, i) => {
                    const delay = offset + (group.length > 1 ? (i * a.stagger) / 1000 : 0)
                    el.setAttribute('data-entered', '')
                    if (split && el.dataset.enter === 'heading') {
                        const words = splitWords(el)
                        words.forEach((w, j) => {
                            Object.assign(w.style, fromKeyframes(kf))
                            animate(w, kf as any, { duration, ease, delay: delay + (j * split) / 1000 })
                        })
                    } else {
                        animate(el, kf as any, { duration, ease, delay })
                    }
                })
                offset += (group.length ? (group.length - 1) * (a.stagger / 1000) : 0) + duration * 0.5
            }
        }

        if (opts.immediate) {
            play()
        } else {
            const stop = inView(root, () => {
                play()
                if (a.once) return undefined
                // Replays when it scrolls back in: hide again on leave.
                return () => { for (const el of moving) { el.removeAttribute('data-entered'); el.style.opacity = '0' } }
            }, { amount: a.start === 'half' ? 0.5 : 0.15 })
            cleanups.push(stop)
        }
    }

    if (!reducedMotion()) {
        // Scroll-linked effects
        const bgLayer = root.querySelector<HTMLElement>('[data-parallax]')
        if (bgLayer && (a.scroll === 'parallax-slow' || a.scroll === 'parallax-medium')) {
            const dist = a.scroll === 'parallax-slow' ? 40 : 90
            cleanups.push(scroll(animate(bgLayer, { y: [-dist, dist] }, { ease: 'linear' }), { target: root, offset: ['start end', 'end start'] }))
        }
        if (a.scroll === 'zoom') {
            for (const img of Array.from(root.querySelectorAll<HTMLElement>('[data-enter="media"] img, [data-parallax] img'))) {
                cleanups.push(scroll(animate(img, { scale: [1, 1.12] }, { ease: 'linear' }), { target: root, offset: ['start end', 'end start'] }))
            }
        }
        if (a.scroll === 'fade-out') {
            const inner = root.querySelector<HTMLElement>('[data-enter-root]') ?? root
            cleanups.push(scroll(animate(inner, { opacity: [1, 0.25] }, { ease: 'linear' }), { target: root, offset: ['center center', 'end start'] }))
        }
        if (a.countUp) {
            const nums = Array.from(root.querySelectorAll<HTMLElement>('[data-count]'))
            if (nums.length) cleanups.push(inView(root, () => { nums.forEach(n => countUp(n, Math.max(800, a.duration * 2))) }, { amount: 0.4 }))
        }
    }

    return () => cleanups.forEach(c => { try { c() } catch { /* already stopped */ } })
}
