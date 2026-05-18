
import React from 'react'
import { fetchBusinessData } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import { PuckRenderer } from './puckRenderer';
import { buildGoogleFontsUrl, extractFontsFromPuckData, normalizeFont } from '@lib/extractFonts';
import { RuntimeFontLoader } from './runtimeFontLoader';
import { Button } from '@/components/ui/button';
import { SectionsRenderer } from './sectionsRenderer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function FoundingMemberBadge({ memberNumber }: { memberNumber: number }) {
    const padded = String(memberNumber).padStart(3, '0')
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div style={{
                        position: 'fixed', bottom: 20, right: 20, zIndex: 50,
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

    if (!result.result) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">This booking page is not yet published.</p>
            </div>
        )
    }

    const isFoundingMember = result.result.founding_member === true
    const memberNumber = result.result.founding_member_number as number | null

    if (result.result.web_editors[0].type === 'SECTIONS') {
        const brandColor = result.result.brand_color ?? '#FC6161'
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <SectionsRenderer
                    sections={result.result.web_editors[0].section_data ?? []}
                    urlName={result.result.url_name}
                    brandColor={brandColor}
                    services={result.result.services ?? []}
                />
                <a href={`/business/${result.result.url_name}/book`}>
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
