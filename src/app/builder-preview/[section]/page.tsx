import { notFound } from 'next/navigation'
import { TEMPLATE_IDS, type TemplateId } from '@/features/siteBuilder/themes'
import { LayoutGallery } from './LayoutGallery'
import { TemplateCompare } from './TemplateCompare'

export const metadata = { title: 'Builder layout preview', robots: { index: false } }

/**
 * Development only: every layout of one section, with sample data, for
 * checking layouts by eye and for the visual tests (phone / tablet / desktop).
 * /builder-preview/hero?scheme=ink-gold&template=maison-tresse
 * /builder-preview/template-fade-house?v=old|new  (a template site, old renderer vs. builder page)
 */
export default async function Page({ params, searchParams }: {
    params: Promise<{ section: string }>
    searchParams: Promise<{ template?: string; scheme?: string; only?: string; v?: string }>
}) {
    if (process.env.NODE_ENV === 'production' && process.env.BUILDER_PREVIEW !== '1') notFound()
    const { section } = await params
    const q = await searchParams
    const t = section.replace(/^template-/, '')
    if (section.startsWith('template-') && (TEMPLATE_IDS as readonly string[]).includes(t)) {
        return <TemplateCompare template={t as TemplateId} which={q.v === 'old' ? 'old' : 'new'} />
    }
    return <LayoutGallery section={section} template={q.template} scheme={q.scheme} only={q.only ? Number(q.only) : undefined} />
}
