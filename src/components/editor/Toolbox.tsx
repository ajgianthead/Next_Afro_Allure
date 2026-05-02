'use client'

import { Box, Image as ImageIcon, Link, SquarePlus, Type, Upload, Video as VideoIcon, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Container } from './Container'
import { Element, useEditor } from '@craftjs/core';
import { EditableText } from './Text';
import { EditableButton } from './Button';
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ImageContainer } from './Image'
import { Video } from './Video'
import { Hyperlink } from './Hyperlink'
import { createClient } from '@/app/utils/supabase/client'
import { Database } from '../../../lib/database.types'

export default function Toolbox() {
    const { connectors } = useEditor();
    const [openMediaPortal, setOpenMediaPortal] = useState(false)
    const fileInput = useRef<any>(null)
    const { editor_id } = useParams()
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const supabase = createClient<Database>();

    useEffect(() => {
        const getImages = async () => {
            const { data, error } = await supabase.storage.from('editor-media-pool').list(`editor/${editor_id}/image/`)
            if (error) throw Error(error.message)
            if (data?.length && data[0].name !== '.emptyFolderPlaceholder') {
                const fileUrls = data.map((img) =>
                    supabase.storage.from('editor-media-pool').getPublicUrl(`editor/${editor_id}/image/${img.name}`).data.publicUrl
                )
                setImageUrls(fileUrls)
            }
        }
        if (!imageUrls.length) getImages()
    }, [imageUrls]);

    const handleUpload = async (files: FileList) => {
        const id = crypto.randomUUID();
        const path = `editor/${editor_id}/image/${id}`
        const { error } = await supabase.storage.from('editor-media-pool').upload(path, files[0], { contentType: 'image/*' })
        if (error) throw Error(error.message)
        const url = supabase.storage.from('editor-media-pool').getPublicUrl(path).data.publicUrl
        setImageUrls((prev) => [...prev, url])
    }

    return (
        <div className="relative">
            <div className='flex flex-wrap gap-2'>
                <button ref={(ref: any) => connectors.create(ref, <Element is={Container} padding={10} width={'100%'} height={115} background="#eee" canvas />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <Box size={40} />
                    </div>
                    <span className="text-xs text-muted-foreground">Container</span>
                </button>
                <button ref={(ref: any) => connectors.create(ref, <EditableText text="Insert text..." />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <Type size={40} />
                    </div>
                    <span className="text-xs text-muted-foreground">Text</span>
                </button>
                <button ref={(ref: any) => connectors.create(ref, <EditableButton size='md' variant="solid" color='#ffffff' text="Insert text..." />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <SquarePlus size={40} />
                    </div>
                    <span className="text-xs text-muted-foreground">Button</span>
                </button>
                <button ref={(ref: any) => connectors.create(ref, <Hyperlink text="Hyperlink text..." src="https://example.com/" />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <Link size={40} />
                    </div>
                    <span className="text-xs text-muted-foreground">Hyperlink</span>
                </button>
                <button onClick={() => setOpenMediaPortal(true)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <ImageIcon size={40} />
                    </div>
                    <span className="text-xs text-muted-foreground">Image</span>
                </button>
                <button ref={(ref: any) => connectors.create(ref, <Video url="https://www.youtube.com/embed/19g66ezsKAg" />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <VideoIcon size={40} />
                    </div>
                    <span className="text-xs text-muted-foreground">Video</span>
                </button>
            </div>

            {openMediaPortal && (
                <div
                    className="absolute left-0 top-0 w-75 h-full bg-background border-r border-border shadow-lg z-1300 overflow-auto flex flex-col"
                >
                    <button
                        onClick={() => setOpenMediaPortal(false)}
                        className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <X className="size-4" />
                        <span className="sr-only">Close</span>
                    </button>
                    <div className='m-5 flex flex-col flex-1 gap-2'>
                        <div>
                            <p className="text-sm font-semibold">Media Pool</p>
                            <p className="text-xs text-muted-foreground">Upload or drag and drop an image on the page</p>
                        </div>
                        <div>
                            <Button variant="outline" className="w-full" onClick={() => fileInput.current.click()}>
                                <Upload className="size-4" />
                                Upload Image
                            </Button>
                            <input
                                accept='image/*'
                                onChange={(e) => handleUpload(e.target.files!)}
                                ref={fileInput}
                                style={{ display: 'none' }}
                                type='file'
                            />
                        </div>
                        <div className='border border-solid border-black p-2 h-full'>
                            <div className='max-h-max flex flex-wrap gap-2'>
                                {imageUrls.map((url) => (
                                    <button key={url} ref={(ref: any) => connectors.create(ref, <ImageContainer url={url} />)}>
                                        <Image src={url} alt="image" width={120} height={120} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
