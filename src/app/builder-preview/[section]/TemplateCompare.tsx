'use client'

import { Render, type Data } from '@puckeditor/core'
import { renderConfig } from '@/features/builder/config'
import { templateToBuilder } from '@/features/builder/presets'
import { SAMPLE_INFO, SAMPLE_METADATA, SAMPLE_PHOTOS } from '@/features/builder/sample'
import { SiteRenderer } from '@/features/siteBuilder/templates'
import { defaultSiteData, type SiteData } from '@/features/siteBuilder/siteData'
import { resolveTheme, type TemplateId } from '@/features/siteBuilder/themes'

/** A template site in the old renderer (`old`) or converted to a builder page (`new`), with the same sample data. */
export function TemplateCompare({ template, which }: { template: TemplateId; which: 'old' | 'new' }) {
    const p = SAMPLE_PHOTOS
    const site: SiteData = {
        ...defaultSiteData(template),
        media: { logo: null, cover: p.cover, about: p.portrait, gallery: p.gallery },
        content: { tagline: 'Braids that last, booked in a minute', bio: 'I’ve been braiding in Brooklyn for eight years. Every style starts with healthy hair.', phone: '(718) 555-0142', email: 'hello@kaysbraids.com', instagram: 'kaysbraids', tiktok: '' },
    }
    if (which === 'old') {
        return <SiteRenderer info={SAMPLE_INFO} site={site} theme={resolveTheme(site.templateId, site.scheme, site.customColors, site.fontPairing)} basePath="" />
    }
    return <Render config={renderConfig} data={templateToBuilder(site, SAMPLE_INFO) as Data} metadata={SAMPLE_METADATA as any} />
}
