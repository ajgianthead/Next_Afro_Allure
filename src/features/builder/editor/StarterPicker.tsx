'use client'

import { useMemo } from 'react'
import { Check } from 'lucide-react'
import type { SiteData, SiteInfo } from '@/features/siteBuilder/siteData'
import { TEMPLATES, type TemplateId } from '@/features/siteBuilder/themes'
import { presetPage } from '../presets'
import { PageThumbnail } from '../render/PageThumbnail'

/**
 * The six templates as starter pages, previewed live with the business's own
 * name, services and photos. `row` is a swipeable strip (phones, the welcome
 * modal); `grid` is for wider screens.
 */
export function StarterPicker({ info, site, selected, onPick, layout = 'grid', previewHeight = 300 }: {
    info: SiteInfo
    /** Photos, text and colors to show in the previews (the business's template site, or what onboarding collected). */
    site: SiteData | null
    selected: TemplateId | null
    onPick: (id: TemplateId) => void
    layout?: 'grid' | 'row'
    previewHeight?: number
}) {
    const pages = useMemo(() => Object.fromEntries(TEMPLATES.map(t => [t.id, presetPage(t.id, info, site)])), [info, site])
    return (
        <div
            className={layout === 'row'
                ? '-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-7 sm:px-7'
                : 'grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3'}
            role="radiogroup"
            aria-label="Templates"
        >
            {TEMPLATES.map(t => {
                const active = selected === t.id
                return (
                    // A div, not a <button>: the preview inside contains the page's links, and a button can't contain links.
                    <div
                        key={t.id}
                        role="radio"
                        tabIndex={0}
                        aria-checked={active}
                        aria-label={`${t.name}: ${t.tagline}`}
                        onClick={() => onPick(t.id)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(t.id) } }}
                        className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl text-left transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 ${layout === 'row' ? 'w-[68%] shrink-0 snap-start sm:w-[44%]' : ''}`}
                        style={{ border: `2px solid ${active ? '#1A1818' : '#E8E2D6'}`, backgroundColor: '#FFFFFF', boxShadow: active ? '0 8px 24px -12px rgba(15,14,14,.35)' : undefined }}
                    >
                        <div className="relative block w-full overflow-hidden" style={{ height: previewHeight, backgroundColor: '#FAF7F2' }}>
                            <PageThumbnail page={pages[t.id]} metadata={{ info, basePath: '', planType: 'GROWTH' }} width={390} height={previewHeight} />
                            {active && (
                                <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: '#1A1818', color: '#FFFFFF' }}>
                                    <Check size={15} />
                                </span>
                            )}
                        </div>
                        <span className="flex flex-col gap-0.5 px-3.5 py-3" style={{ borderTop: '1px solid #E8E2D6' }}>
                            <span className="text-sm font-semibold" style={{ color: '#1A1818' }}>{t.name}</span>
                            <span className="text-xs" style={{ color: '#6F6863' }}>{t.tagline}</span>
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
