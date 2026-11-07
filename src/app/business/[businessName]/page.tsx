
import React from 'react'
import { headers } from 'next/headers'
import { businessSitePath } from '@/lib/businessHost'
import { fetchBusinessData } from './data';
import { PostgrestError } from '@supabase/supabase-js';
import { PuckRenderer } from './puckRenderer';
import { buildGoogleFontsUrl, extractFontsFromPuckData, normalizeFont } from '@lib/extractFonts';
import { RuntimeFontLoader } from './runtimeFontLoader';
import { Button } from '@/components/ui/button';
import { SectionsRenderer } from './sectionsRenderer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Metadata } from 'next';
import { createAdminClient } from '@/app/utils/supabase/admin';
import { parseSiteData } from '@/features/siteBuilder/siteData';
import { loadSiteInfo } from '@/features/siteBuilder/server/loadSite';
import { BuilderPage } from '@/features/builder/render/BuilderPage';
import { loadBuilderExtras } from '@/features/builder/server/loadExtras';
import { sanitizePage } from '@/features/builder/page';
import { effectivePlanType } from '@/lib/beta';

function FoundingMemberBadge({ memberNumber, bottom = 20 }: { memberNumber: number; bottom?: number }) {
    const padded = String(memberNumber).padStart(3, '0')
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div style={{
                        position: 'fixed', bottom, right: 20, zIndex: 50,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#C9974A', color: '#fff',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        padding: '8px 14px', borderRadius: 999,
                        boxShadow: '0 4px 16px rgba(201,151,74,0.4)',
                        cursor: 'default',
                        userSelect: 'none',
                    }}>
                        ✦ Founding Member #{padded}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left" style={{ maxWidth: 220 }}>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                        This stylist is founding member #{padded} of AfroAllure — one of the first 250 professionals on the platform.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}


interface PageProps {
    params: {
        businessName: string;
    };
}

/** Title, description and preview image for shared links (template and builder sites use their own words and photos). */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { businessName } = await params
    const { data } = await createAdminClient()
        .from('business_users')
        .select('business_name, web_editors(type, site_data, builder_data)')
        .eq('url_name', businessName)
        .maybeSingle()
    if (!data) return {}
    const editor = (data.web_editors as any)?.[0] ?? (data.web_editors as any)
    // Builder sites can show a different name (Site look → Name on your website).
    const siteName = editor?.type === 'BUILDER' ? String(editor.builder_data?.root?.props?.siteName ?? '').trim() : ''
    const title = `${siteName || data.business_name} | Book online`
    let description: string
    let image: string | undefined
    if (editor?.type === 'BUILDER') {
        // The hero's words and photo, else the first photo on the page.
        const sections: { type: string; props?: { content?: Record<string, any> } }[] = editor.builder_data?.content ?? []
        const hero = sections.find(s => s.type === 'Hero')?.props?.content ?? {}
        description = String(hero.subheading || hero.heading || `Book with ${data.business_name} online.`).slice(0, 160)
        const photos = [hero.media, ...sections.flatMap(s => [s.props?.content?.media, ...(s.props?.content?.photos ?? [])])]
        image = photos.find(m => m?.kind === 'image' && /^https:\/\//.test(m.url))?.url
    } else if (editor?.type === 'TEMPLATE') {
        const site = parseSiteData(editor.site_data)
        description = (site.content.tagline || site.content.bio || `Book with ${data.business_name} online.`).slice(0, 160)
        image = [site.media.cover, ...site.media.gallery, site.media.about].find(m => m?.kind === 'image')?.url
    } else {
        return { title }
    }
    return {
        title,
        description,
        openGraph: { title, description, ...(image ? { images: [image] } : {}) },
        twitter: { card: image ? 'summary_large_image' : 'summary', title, description, ...(image ? { images: [image] } : {}) },
    }
}

export default async function Page({ params }: PageProps) {

    const { businessName } = await params;
    const result = await fetchBusinessData(businessName);

    if (result instanceof PostgrestError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">This page could not be loaded.</p>
            </div>
        )
    }

    // A business that hasn't built its booking site yet has no editor row —
    // this used to crash the page (web_editors[0] is undefined).
    if (!result.result || !result.result.web_editors?.[0]) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">This booking page is not yet published.</p>
            </div>
        )
    }

    // Keep visitors on the host they came in on (kayla.afroallure.co vs the app domain).
    const basePath = businessSitePath(result.result.url_name, '', (await headers()).get('host')).replace(/\/$/, '')

    const isFoundingMember = result.result.founding_member === true
    const memberNumber = result.result.founding_member_number as number | null

    if ((result.result.web_editors[0].type as string) === 'BUILDER') {
        const clean = sanitizePage((result.result.web_editors[0] as any).builder_data)
        const info = result.result.published_site && clean.ok ? await loadSiteInfo(result.result.business_id) : null
        if (!info || !clean.ok) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-muted-foreground">This booking page is not yet published.</p>
                </div>
            )
        }
        const planType = effectivePlanType((result.result as any).plan_type) === 'GROWTH' ? 'GROWTH' : 'STARTER'
        const extras = await loadBuilderExtras(result.result.business_id, info, basePath)
        return (
            <div className="min-h-screen">
                <BuilderPage page={clean.page} metadata={{ info, basePath, planType, businessId: result.result.business_id, ...extras }} />
                {isFoundingMember && memberNumber && <FoundingMemberBadge memberNumber={memberNumber} bottom={96} />}
            </div>
        )
    }

    if (result.result.web_editors[0].type === 'TEMPLATE') {
        // Template sites can be unpublished; their booking page keeps working.
        // A row that only holds a booking-page look (no template chosen) isn't a site yet.
        const rawSite = (result.result.web_editors[0] as any).site_data
        const chosen = !!rawSite && typeof rawSite.templateId === 'string'
        const info = result.result.published_site && chosen ? await loadSiteInfo(result.result.business_id) : null
        if (!info) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-muted-foreground">This booking page is not yet published.</p>
                </div>
            )
        }
        // Template sites render as their template's starter page in the website builder (same text, photos and colors).
        const site = parseSiteData(rawSite)
        const planType = effectivePlanType((result.result as any).plan_type) === 'GROWTH' ? 'GROWTH' : 'STARTER'
        const extras = await loadBuilderExtras(result.result.business_id, info, basePath)
        return (
            <div className="min-h-screen">
                <BuilderPage site={site} metadata={{ info, basePath, planType, businessId: result.result.business_id, ...extras }} />
                {/* Raised so it clears the sticky Book bar on phones. */}
                {isFoundingMember && memberNumber && <FoundingMemberBadge memberNumber={memberNumber} bottom={96} />}
            </div>
        )
    }

    if (result.result.web_editors[0].type === 'SECTIONS') {
        const brandColor = result.result.brand_color ?? '#FC6161'
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <SectionsRenderer
                    sections={result.result.web_editors[0].section_data ?? []}
                    basePath={basePath}
                    brandColor={brandColor}
                    services={result.result.services ?? []}
                />
                <a href={`${basePath}/book`}>
                    <Button className='my-10'>Book Now</Button>
                </a>
                {isFoundingMember && memberNumber && <FoundingMemberBadge memberNumber={memberNumber} />}
            </div>
        )
    }

    // Puck Editor
    const rawFonts = extractFontsFromPuckData(JSON.parse(result.result.web_editors[0].editor_data!))
    const fontsUsed = rawFonts.map((font) => ({
        ...font,
        family: normalizeFont(font.family),
    }))

    return (
        <div>
            <RuntimeFontLoader fonts={fontsUsed} />
            <PuckRenderer editorData={JSON.parse(result.result.web_editors[0].editor_data!)} />
            {isFoundingMember && memberNumber && <FoundingMemberBadge memberNumber={memberNumber} />}
        </div>
    )
}
