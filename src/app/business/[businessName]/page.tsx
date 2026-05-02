
import React from 'react'
import Image from 'next/image';
import { fetchBusinessData } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import { PuckRenderer } from './puckRenderer';
import { buildGoogleFontsUrl, extractFontsFromPuckData, normalizeFont } from '@lib/extractFonts';
import { RuntimeFontLoader } from './runtimeFontLoader';
import { Button } from '@/components/ui/button';


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

    if (result.result.web_editors[0].type === 'SECTIONS') {
        return (
            <div className='flex items-center flex-col p-10'>
                {result.result.web_editors[0].section_data?.map((sectionData: any, index: number) => {
                    return (
                        <div key={index}>
                            {sectionData.type === 'image'
                                ? <Image src={sectionData.url!} alt='image-section' width={1366 / 2} height={768 / 2} />
                                // TipTap output is sanitized to its configured extension set
                                : <div className="w-full" dangerouslySetInnerHTML={{ __html: sectionData.html }} />
                            }
                        </div>
                    )
                })}
                <a href={`/${result.result.url_name}/book`}>
                    <Button className='my-10'>Book Now</Button>
                </a>
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
        </div>
    )
}
