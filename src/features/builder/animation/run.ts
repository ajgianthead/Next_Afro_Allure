// Runs a section's animation in the browser with the native Web Animations
// API (element.animate). Not motion's animate(): it checks
// `element instanceof Element`, which fails for elements inside the editor's
// canvas iframe (they belong to the iframe's window), so nothing moved there.
// Everything here uses the element's own window instead.
//
// Layouts mark what can move: data-enter="heading" | "text" | "item" | "media",
// data-parallax on a background layer, data-count on a number. The section
// root carries data-enter-root. On the live site builder.css hides marked
// elements (the page root has .aa-anim) until this runs; a 2.5 s safety rule
// reveals them anyway, a <noscript> rule shows them without JavaScript, and
// "reduce motion" turns everything off (the editor plays them anyway).

import { animate as animateValue } from 'motion'
import { DURATIONS, EASINGS, ENTRANCE_KEYFRAMES, SPLIT_ENTRANCES, type Keyframes } from './presets'
import type { SectionAnimation } from '../types'

const winOf = (el: Element) => el.ownerDocument.defaultView ?? window
const reducedMotion = (el: Element) => !!winOf(el).matchMedia?.('(prefers-reduced-motion: reduce)').matches
const markShown = (els: Element[]) => els.forEach(el => el.setAttribute('data-entered', ''))

const px = (v: string | number) => (typeof v === 'number' ? `${v}px` : v)
const deg = (v: string | number) => (typeof v === 'number' ? `${v}deg` : v)

/** One CSS keyframe from motion-style [from, to] values (x/y/scale/rotateX/transformPerspective become a transform). */
export function cssFrame(kf: Keyframes, at: 0 | 1): Keyframe {
    const v = (k: string) => kf[k]?.[at]
    const frame: Keyframe = {}
    const t: string[] = []
    if (v('transformPerspective') !== undefined) t.push(`perspective(${px(v('transformPerspective')!)})`)
    if (v('x') !== undefined || v('y') !== undefined) t.push(`translate(${px(v('x') ?? 0)}, ${px(v('y') ?? 0)})`)
    if (v('scale') !== undefined) t.push(`scale(${v('scale')})`)
    if (v('rotateX') !== undefined) t.push(`rotateX(${deg(v('rotateX')!)})`)
    if (t.length) frame.transform = t.join(' ')
    if (v('opacity') !== undefined) frame.opacity = v('opacity')
    if (v('filter') !== undefined) frame.filter = String(v('filter'))
    if (v('clipPath') !== undefined) frame.clipPath = String(v('clipPath'))
    return frame
}

const cssFrames = (kf: Keyframes): Keyframe[] => [cssFrame(kf, 0), cssFrame(kf, 1)]
const cubic = (e: readonly number[]) => `cubic-bezier(${e.join(', ')})`

/** Animations this runner started, so a replay can cancel them first. */
const running = new WeakMap<Element, Animation[]>()
function play(el: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) {
    // 'backwards': hidden during the delay, then back to the element's own styles,
    // so hover effects (lift, tilt) still work after the entrance.
    const anim = el.animate(frames, { fill: 'backwards', ...options })
    running.set(el, [...(running.get(el) ?? []), anim])
    anim.addEventListener('finish', () => running.set(el, (running.get(el) ?? []).filter(a => a !== anim)))
}
function stop(el: Element) {
    for (const a of running.get(el) ?? []) a.cancel()
    running.delete(el)
}

/** Splits a heading's text into word spans once, so words can rise one by one. */
function splitWords(el: HTMLElement): HTMLElement[] {
    if (el.dataset.split === '1') return Array.from(el.querySelectorAll<HTMLElement>('[data-word]'))
    const words = (el.textContent ?? '').split(/(\s+)/)
    el.textContent = ''
    for (const w of words) {
        if (/^\s+$/.test(w) || !w) { el.append(w); continue }
        const span = el.ownerDocument.createElement('span')
        span.dataset.word = ''
        span.style.display = 'inline-block'
        span.textContent = w
        el.append(span)
    }
    el.dataset.split = '1'
    return Array.from(el.querySelectorAll<HTMLElement>('[data-word]'))
}

/** Calls `onEnter` when `el` scrolls into view. Returning a function makes it run again on the next entry (the function runs on leave); returning nothing stops watching. */
function inView(el: Element, onEnter: () => (() => void) | void, amount: number): () => void {
    const io = new (winOf(el).IntersectionObserver)(entries => {
        for (const e of entries) {
            if (e.isIntersecting) {
                const onLeave = onEnter()
                if (onLeave) leave = onLeave
                else io.disconnect()
            } else if (leave) {
                leave()
                leave = undefined
            }
        }
    }, { threshold: amount })
    let leave: (() => void) | undefined
    io.observe(el)
    return () => io.disconnect()
}

/**
 * Ties an animation to scrolling: progress goes 0 → 1 while `root` moves
 * through the window. 'through' = from entering at the bottom to leaving at
 * the top; 'leaving' = from centered to gone at the top.
 */
function scrollLinked(root: HTMLElement, el: HTMLElement, frames: Keyframe[], range: 'through' | 'leaving'): () => void {
    const win = winOf(root)
    const anim = el.animate(frames, { duration: 1000, fill: 'both', easing: 'linear' })
    anim.pause()
    let frame = 0
    const update = () => {
        frame = 0
        const r = root.getBoundingClientRect()
        const vh = win.innerHeight
        const p = range === 'through'
            ? (vh - r.top) / (vh + r.height)
            : (vh / 2 - r.height / 2 - r.top) / (vh / 2 + r.height / 2)
        anim.currentTime = Math.min(1, Math.max(0, p)) * 1000
    }
    const onScroll = () => { if (!frame) frame = win.requestAnimationFrame(update) }
    update()
    win.addEventListener('scroll', onScroll, { passive: true })
    win.addEventListener('resize', onScroll)
    return () => {
        win.removeEventListener('scroll', onScroll)
        win.removeEventListener('resize', onScroll)
        if (frame) win.cancelAnimationFrame(frame)
        anim.cancel()
    }
}

function countUp(el: HTMLElement, duration: number) {
    const text = el.dataset.countText ?? el.textContent ?? ''
    el.dataset.countText = text
    const m = text.match(/-?\d+(?:[.,]\d+)?/)
    if (!m) return
    const target = parseFloat(m[0].replace(',', '.'))
    const decimals = (m[0].split(/[.,]/)[1] ?? '').length
    // motion animating a plain number (not an element), so it works in any window.
    animateValue(0, target, {
        duration: duration / 1000,
        ease: EASINGS.smooth,
        onUpdate: v => { el.textContent = text.replace(m[0], v.toFixed(decimals)) },
    })
}

/**
 * Starts the section's animation. Returns a cleanup function.
 * `immediate` plays the entrance now (the editor's Preview and live edits)
 * instead of on scroll; `force` plays even when the device asks for reduced
 * motion (the editor, so the owner sees what they're choosing).
 */
export function runSectionAnimation(root: HTMLElement, a: SectionAnimation, opts: { immediate?: boolean; force?: boolean } = {}): () => void {
    const all = Array.from(root.querySelectorAll<HTMLElement>('[data-enter]'))
    const cleanups: (() => void)[] = []
    const still = !opts.force && reducedMotion(root)
    all.forEach(stop)

    if (still || a.entrance === 'none') {
        markShown(all)
    } else {
        const headings = all.filter(el => el.dataset.enter === 'heading')
        const texts = all.filter(el => el.dataset.enter === 'text' || el.dataset.enter === 'media')
        const items = all.filter(el => el.dataset.enter === 'item')
        // Which elements move, in order.
        const groups: HTMLElement[][] =
            a.target === 'section' ? [[root.querySelector<HTMLElement>('[data-enter-root]') ?? root]]
                : a.target === 'heading' ? [headings]
                    : a.target === 'items' ? [items.length ? items : [...headings, ...texts]]
                        : [[...headings, ...texts], items]
        const moving = new Set(groups.flat())
        // Everything not animated just shows.
        markShown(all.filter(el => !moving.has(el)))

        const split = SPLIT_ENTRANCES[a.entrance]
        const frames = cssFrames(ENTRANCE_KEYFRAMES[a.entrance])
        const duration = a.duration || DURATIONS.normal
        const easing = cubic(EASINGS[a.easing] ?? EASINGS.smooth)

        const playAll = () => {
            let offset = a.delay
            for (const group of groups) {
                group.forEach((el, i) => {
                    const delay = offset + (group.length > 1 ? i * a.stagger : 0)
                    el.setAttribute('data-entered', '')
                    stop(el)
                    if (split && el.dataset.enter === 'heading') {
                        splitWords(el).forEach((w, j) => { stop(w); play(w, frames, { duration, easing, delay: delay + j * split }) })
                    } else {
                        play(el, frames, { duration, easing, delay })
                    }
                })
                offset += (group.length ? (group.length - 1) * a.stagger : 0) + duration * 0.5
            }
        }

        if (opts.immediate) {
            playAll()
        } else {
            cleanups.push(inView(root, () => {
                playAll()
                if (a.once) return undefined
                // Replays when it scrolls back in: hide again on leave.
                return () => { for (const el of moving) el.removeAttribute('data-entered') }
            }, a.start === 'half' ? 0.5 : 0.15))
        }
    }

    if (!still) {
        // Scroll-linked effects
        const bgLayer = root.querySelector<HTMLElement>('[data-parallax]')
        if (bgLayer && (a.scroll === 'parallax-slow' || a.scroll === 'parallax-medium')) {
            const dist = a.scroll === 'parallax-slow' ? 40 : 90
            cleanups.push(scrollLinked(root, bgLayer, [{ transform: `translateY(${-dist}px)` }, { transform: `translateY(${dist}px)` }], 'through'))
        }
        if (a.scroll === 'zoom') {
            for (const img of Array.from(root.querySelectorAll<HTMLElement>('[data-enter="media"] img, [data-parallax] img'))) {
                cleanups.push(scrollLinked(root, img, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }], 'through'))
            }
        }
        if (a.scroll === 'fade-out') {
            const inner = root.querySelector<HTMLElement>('[data-enter-root]') ?? root
            cleanups.push(scrollLinked(root, inner, [{ opacity: 1 }, { opacity: 0.25 }], 'leaving'))
        }
        if (a.countUp) {
            const nums = Array.from(root.querySelectorAll<HTMLElement>('[data-count]'))
            if (nums.length) {
                const run = () => nums.forEach(n => countUp(n, Math.max(800, a.duration * 2)))
                if (opts.immediate) run()
                else cleanups.push(inView(root, () => { run() }, 0.4))
            }
        }
    }

    return () => {
        cleanups.forEach(c => { try { c() } catch { /* already stopped */ } })
        all.forEach(stop)
    }
}
