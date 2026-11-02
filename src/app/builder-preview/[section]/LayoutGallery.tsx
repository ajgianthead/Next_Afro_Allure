'use client'

import { SectionRender, newSectionProps, DEFAULT_THEME } from '@/features/builder/config'
import { BuilderRoot } from '@/features/builder/render/BuilderRoot'
import { SAMPLE_METADATA, SAMPLE_PHOTOS } from '@/features/builder/sample'
import { SECTIONS } from '@/features/builder/sections'
import { WIREFRAME_SECTIONS } from '@/features/builder/wireframes'
import type { TemplateId } from '@/features/siteBuilder/themes'

/** Sample content for a section: its defaults with photos filled in. */
function sampleContent(type: string, base: Record<string, unknown>): Record<string, unknown> {
    const p = SAMPLE_PHOTOS
    switch (type) {
        case 'Hero':
            return { ...base, eyebrow: 'Braids · Brooklyn', secondary: { label: 'View services', href: '#services' }, media: p.cover, media2: p.second, media3: p.third, slides: p.gallery.slice(0, 3), before: p.gallery[4], after: p.gallery[5] }
        case 'About':
            return { ...base, heading: 'Hi, I’m Kay', body: 'I’ve been braiding for eight years, first for friends and family, then from my own studio in Brooklyn.\n\nEvery style starts with healthy hair: gentle tension, clean parts and products that won’t weigh you down.', since: '2016', media: p.portrait, media2: p.gallery[1], media3: p.gallery[2], button: { label: 'Book with Kay', href: 'book' } }
        case 'Services':
            return { ...base, intro: 'Prices start at the amount shown; longer lengths cost more.', media: p.cover }
        case 'Gallery':
            return { ...base, photos: [...p.gallery, p.cover, p.second, p.third, p.portrait], captions: ['Knotless, waist length', 'Boho knotless', 'Silk press', 'Loc retwist', 'Feed-in cornrows', 'Kids braids'].join('\n'), button: { label: 'Follow on Instagram', href: 'https://instagram.com/kaysbraids' } }
        case 'Navbar':
            return { ...base, phone: '(718) 555-0142', announcement: { label: 'Refer a friend: you both get $10 off', href: 'book' }, socials: [{ kind: 'instagram', url: 'https://instagram.com/kaysbraids' }, { kind: 'tiktok', url: 'https://tiktok.com/@kaysbraids' }] }
        case 'Footer':
            return { ...base, tagline: 'Knotless braids, silk presses and loc care in Brooklyn.', phone: '(718) 555-0142', email: 'hello@kaysbraids.com', socials: [{ kind: 'instagram', url: 'https://instagram.com/kaysbraids' }, { kind: 'tiktok', url: 'https://tiktok.com/@kaysbraids' }], photos: p.gallery.slice(0, 6), legal: 'Licensed cosmetologist' }
        default:
            return base
    }
}

export function LayoutGallery({ section, template, scheme, only }: { section: string; template?: string; scheme?: string; only?: number }) {
    const def = SECTIONS.find(s => s.type.toLowerCase() === section.toLowerCase() || s.wireframeId === section)
    if (!def) return <p style={{ padding: 24 }}>No section “{section}”. Try: {SECTIONS.map(s => s.wireframeId).join(', ')}</p>
    const names = WIREFRAME_SECTIONS.find(w => w.id === def.wireframeId)?.layouts ?? []
    const theme = { ...DEFAULT_THEME, templateId: (template as TemplateId) ?? DEFAULT_THEME.templateId, scheme: scheme ?? '' }
    const base = newSectionProps(def)
    const layouts = Array.from({ length: 20 }, (_, i) => i + 1).filter(n => !only || n === only)

    return (
        <BuilderRoot themeProps={theme} metadata={SAMPLE_METADATA} editing={false}>
            {layouts.map(n => (
                <div key={n} data-layout={n}>
                    <div style={{ padding: '10px 20px', font: '600 13px system-ui', background: '#1a1818', color: '#fff', position: 'relative', zIndex: 5 }}>
                        {def.label} {n} · {names[n - 1]?.name ?? ''}
                    </div>
                    <SectionRender def={def} id={`preview-${n}`} props={{ ...base, layout: n, content: sampleContent(def.type, base.content as Record<string, unknown>) }} />
                    {/* Menu bars: a stand-in page below, so overlay bars have something to sit on. */}
                    {def.type === 'Navbar' && <div style={{ height: 240, background: `center/cover url(${SAMPLE_PHOTOS.cover.url})` }} />}
                </div>
            ))}
        </BuilderRoot>
    )
}
