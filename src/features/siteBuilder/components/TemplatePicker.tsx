'use client'

import { Check } from 'lucide-react'
import { BRAND } from '@/features/welcomeSetup/components/shared'
import type { SiteData, SiteInfo } from '../siteData'
import { TEMPLATES, type TemplateId } from '../themes'
import { ScaledSite } from './SitePreview'

/**
 * The six templates as live mini-previews filled with the business's own
 * name, services and photos. `row` is a swipeable strip for phones and the
 * welcome modal; `grid` is for wider screens.
 */
export function TemplatePicker({ info, site, selected, onPick, layout = 'grid', previewHeight = 300 }: {
    info: SiteInfo
    site: SiteData
    selected: TemplateId | null
    onPick: (id: TemplateId) => void
    layout?: 'grid' | 'row'
    previewHeight?: number
}) {
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
                const preview: SiteData = { ...site, templateId: t.id, scheme: site.templateId === t.id ? site.scheme : '', fontPairing: site.templateId === t.id ? site.fontPairing : '' }
                return (
                    <button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onPick(t.id)}
                        className={`group flex flex-col overflow-hidden rounded-2xl text-left transition-shadow ${layout === 'row' ? 'w-[68%] shrink-0 snap-start sm:w-[44%]' : ''}`}
                        style={{ border: `2px solid ${active ? BRAND.dark : BRAND.border}`, backgroundColor: '#FFFFFF', boxShadow: active ? '0 8px 24px -12px rgba(15,14,14,.35)' : undefined }}
                    >
                        <div className="relative w-full overflow-hidden" style={{ height: previewHeight, backgroundColor: BRAND.cream }}>
                            <ScaledSite info={info} site={preview} width={390} height={previewHeight} editing={false} interactive={false} className="!overflow-hidden" />
                            {active && (
                                <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: BRAND.dark, color: '#FFFFFF' }}>
                                    <Check size={15} />
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 px-3.5 py-3" style={{ borderTop: `1px solid ${BRAND.border}` }}>
                            <span className="text-sm font-semibold" style={{ color: BRAND.ink }}>{t.name}</span>
                            <span className="text-xs" style={{ color: BRAND.warm }}>{t.tagline}</span>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
