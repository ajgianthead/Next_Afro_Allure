
import React from 'react'
import lz from "lzutf8";
import Image from 'next/image';
import { fetchBusinessData } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import { getSectionImages } from 'app/dashboard/(other)/booking-site/actions';
import { Button } from '@mui/joy';
import { Render } from "@puckeditor/core";
import { config } from './edit/constants';
import { PuckRenderer } from './puckRenderer';
import { buildGoogleFontsUrl, extractFontsFromPuckData, normalizeFont } from '@lib/extractFonts';
import { RuntimeFontLoader } from './runtimeFontLoader';


interface PageProps {
    params: {
        businessName: string;
    };
}

export default async function Page({ params }: PageProps) {

    const { businessName } = await params;
    const result = await fetchBusinessData(businessName);

    if (result instanceof PostgrestError) {
        return result
    }
    if (result.result.web_editors[0].type === 'SECTIONS') {
        return (
            <div className='flex items-center flex-col p-10'>
                {result.result.web_editors[0].section_data?.map((sectionData: any, index) => {
                    return (
                        <div>{sectionData.type === 'image' ? <Image src={sectionData.url!} alt='image-section' width={1366 / 2} height={768 / 2} /> : <div className="w-full" dangerouslySetInnerHTML={{ __html: sectionData.html }} />}</div>
                    )
                })}
                <a href={`${result.result.url_name}/book`}><Button className='my-10' >Book Now</Button></a>
            </div>
        )
    } else {
        // Puck Editor
        const rawFonts = extractFontsFromPuckData(JSON.parse(result.result.web_editors[0].editor_data!))
        console.log(JSON.parse(result.result.web_editors[0].editor_data!));

        const fontsUsed = rawFonts.map((font) => ({
            ...font,
            family: normalizeFont(font.family),
        })); return (
            <div>
                <RuntimeFontLoader fonts={fontsUsed} />
                <PuckRenderer editorData={JSON.parse(result.result.web_editors[0].editor_data!)} />
            </div>
        )
    }


    // Decompress and parse editor data

}
