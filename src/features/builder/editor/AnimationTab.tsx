'use client'

import { Play } from 'lucide-react'
import { AMBIENT_LABELS, animationIsPro, ambientTier, DURATIONS, ENTRANCE_LABELS, entranceTier, HOVER_LABELS, hoverTier, SCROLL_LABELS, scrollTier } from '../animation/presets'
import { ENTRANCES, type AmbientEffect, type HoverEffect, type ScrollEffect, type SectionAnimation } from '../types'
import { Segmented, Select, Slider, Toggle } from './controls'
import { useEditor } from './EditorContext'
import { ProNotice } from './LayoutTab'
import { previewAnimation } from './preview'

const SCROLLS = Object.keys(SCROLL_LABELS) as ScrollEffect[]
const HOVERS = Object.keys(HOVER_LABELS) as HoverEffect[]
const AMBIENTS = Object.keys(AMBIENT_LABELS) as AmbientEffect[]

export function AnimationTab({ id, animation, setAnimation }: { id: string; animation: SectionAnimation; setAnimation: (a: Partial<SectionAnimation>) => void }) {
    const { plan } = useEditor()
    const starter = plan !== 'GROWTH'
    const lock = (tier: 'basic' | 'pro') => starter && tier === 'pro'
    const speed = (Object.entries(DURATIONS).find(([, ms]) => ms === animation.duration)?.[0] ?? 'custom') as keyof typeof DURATIONS | 'custom'

    return (
        <div className="grid gap-4 p-3.5">
            {starter && animationIsPro(animation) && <ProNotice what="One of these animations" />}
            <button type="button" className="bld-btn" data-dark="" onClick={() => previewAnimation(id)}><Play size={14} /> Preview</button>
            <p className="bld-help -mt-2">Changes play in the preview as you make them. Use Play animations at the top to scroll through the page as visitors see it.</p>

            <section className="grid gap-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[.08em]" style={{ color: 'var(--b-faint)' }}>When it scrolls into view</h3>
                <Select label="Entrance" value={animation.entrance} onChange={entrance => setAnimation({ entrance })}
                    options={ENTRANCES.map(e => ({ value: e, label: ENTRANCE_LABELS[e], locked: lock(entranceTier(e)) }))} />
                {animation.entrance !== 'none' && <>
                    <Segmented label="What moves" value={animation.target} onChange={target => setAnimation({ target })}
                        options={[{ value: 'section', label: 'Whole section' }, { value: 'heading', label: 'Heading' }, { value: 'text-then-items', label: 'Text, then items' }, { value: 'items', label: 'Items one by one' }]} />
                    <Segmented label="Speed" value={speed} onChange={s => s !== 'custom' && setAnimation({ duration: DURATIONS[s] })}
                        options={[{ value: 'fast', label: 'Fast' }, { value: 'normal', label: 'Normal' }, { value: 'slow', label: 'Slow' }, ...(speed === 'custom' ? [{ value: 'custom' as const, label: `${animation.duration} ms` }] : [])]} />
                    <Segmented label="Feel" value={animation.easing} onChange={easing => setAnimation({ easing })}
                        options={[{ value: 'smooth', label: 'Smooth' }, { value: 'snappy', label: 'Snappy' }, { value: 'soft', label: 'Soft' }]} />
                </>}
            </section>

            {animation.entrance !== 'none' && (
                <details className="bld-group rounded-lg" style={{ border: '1px solid var(--b-line)', background: '#fff' }}>
                    <summary>Timing</summary>
                    <div>
                        <Slider label="Length" unit=" ms" value={animation.duration} min={200} max={1600} step={50} onChange={duration => setAnimation({ duration })} />
                        <Slider label="Wait before starting" unit=" ms" value={animation.delay} min={0} max={1500} step={50} onChange={delay => setAnimation({ delay })} />
                        {(animation.target === 'items' || animation.target === 'text-then-items') && (
                            <Slider label="Gap between items" unit=" ms" value={animation.stagger} min={0} max={300} step={10} onChange={stagger => setAnimation({ stagger })} />
                        )}
                        <Segmented label="Starts when" value={animation.start} onChange={start => setAnimation({ start })}
                            options={[{ value: 'appear', label: 'It first appears' }, { value: 'half', label: 'Half is visible' }]} />
                        <Toggle label="Only the first time" checked={animation.once} onChange={once => setAnimation({ once })} help="Off: it plays again each time the section scrolls back into view." />
                    </div>
                </details>
            )}

            <section className="grid gap-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[.08em]" style={{ color: 'var(--b-faint)' }}>Extras</h3>
                <Select label="On hover" value={animation.hover} onChange={hover => setAnimation({ hover })}
                    options={HOVERS.map(h => ({ value: h, label: HOVER_LABELS[h], locked: lock(hoverTier(h)) }))} help="For cards, photos and buttons." />
                <Select label="While scrolling" value={animation.scroll} onChange={scroll => setAnimation({ scroll })}
                    options={SCROLLS.map(s => ({ value: s, label: SCROLL_LABELS[s], locked: lock(scrollTier(s)) }))} />
                <Select label="Always moving" value={animation.ambient} onChange={ambient => setAnimation({ ambient })}
                    options={AMBIENTS.map(a => ({ value: a, label: AMBIENT_LABELS[a], locked: lock(ambientTier(a)) }))} help="Gentle and slow. Turned off for visitors who prefer less motion." />
                <Toggle label="Numbers count up" checked={animation.countUp} locked={starter} onChange={countUp => setAnimation({ countUp })} help="Stats, ratings and prices count up from zero." />
            </section>
        </div>
    )
}
