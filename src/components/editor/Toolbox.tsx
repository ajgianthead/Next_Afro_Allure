'use client'
import { Caption, Title } from '@tailus-ui/typography'
import { Box, Image as ImageIcon, Link, SquarePlus, Type, Upload, Video as VideoIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Container } from './Container'
import { Element, useEditor } from '@craftjs/core';
import { EditableText, Text } from './Text';
import { EditableButton } from './Button';
import Drawer from '@mui/joy/Drawer';
import ModalClose from '@mui/joy/ModalClose';
import { Button, Input } from '@mui/joy'
import { uploadImage } from '@utils/upload_editor_images'
import { getUser } from 'app/dashboard/(other)/getUser'
import { User } from '@supabase/supabase-js'
import { createClient } from '@utils/supabase/client'
import { Database } from '../../../lib/database.types'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ImageContainer } from './Image'
import { Video } from './Video'
import { Hyperlink } from './Hyperlink'





export default function Toolbox() {
    const { connectors, query } = useEditor();
    const [openMediaPortal, setOpenMediaPortal] = useState(false)
    const fileInput = useRef<any>(null)
    const { editor_id } = useParams()
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const supabase = createClient<Database>();
    useEffect(() => {
        const getImages = async () => {
            const { data, error } = await supabase.storage.from('editor-media-pool').list(`editor/${editor_id}/image/`)
            if (error) {
                throw Error(error.message)
            }
            if (data && data.length) {
                if (data[0].name !== ".emptyFolderPlaceholder") {

                    const fileUrls = data?.map((images) => (supabase.storage.from("editor-media-pool").getPublicUrl(`editor/${editor_id}/image/${images.name}`).data.publicUrl))
                    setImageUrls(fileUrls!)

                }
            }
        }
        if (!imageUrls.length) {
            getImages()
        }
    }, [imageUrls]);
    const handleUpload = async (files: FileList) => {

        const id = crypto.randomUUID();
        const path = `editor/${editor_id}/image/${id}`

        // Upload
        const { data, error } = await supabase.storage.from('editor-media-pool').upload(path, files[0], {
            contentType: 'image/*'
        })


        // Get files and generate urls
        const url = supabase.storage.from('editor-media-pool').getPublicUrl(path).data.publicUrl
        if (error) {
            throw Error(error.message)
        }
        setImageUrls([
            ...imageUrls,
            url
        ])




    }
    return (
        <div>
            <div className='flex flex-wrap gap-2'>
                <button ref={(ref: any) => connectors.create(ref, <Element is={Container} padding={10} width={'100%'} height={115} background="#eee" canvas />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center' >
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <Box size={40} />
                    </div>
                    <Caption>Container</Caption>
                </button>
                <button ref={(ref: any) => connectors.create(ref, <EditableText text="Insert text..." />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <Type size={40} />
                    </div>
                    <Caption>Text</Caption>
                </button>
                <button ref={(ref: any) => connectors.create(ref, <EditableButton size='md' variant="solid" color='#ffffff' text="Insert text..." />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <SquarePlus size={40} />
                    </div>
                    <Caption>Button</Caption>
                </button>
                <button ref={(ref: any) => connectors.create(ref, <Hyperlink text="Hyperlink text..." src="https://example.com/" />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <Link size={40} />
                    </div>
                    <Caption>Hyperlink</Caption>
                </button>
                <button onClick={() => {
                    setOpenMediaPortal(true)
                }} className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <ImageIcon size={40} />
                    </div>
                    <Caption>Image</Caption>
                </button>
                <button ref={(ref: any) => connectors.create(ref, <Video url="https://www.youtube.com/embed/19g66ezsKAg" />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <VideoIcon size={40} />
                    </div>
                    <Caption>Video</Caption>
                </button>
            </div>
            <Drawer size='sm' hideBackdrop // Ensures no backdrop is shown
                disableEscapeKeyDown
                disableEnforceFocus
                disablePortal // Prevents closing via Escape key if needed
                slotProps={{
                    backdrop: {
                        style: { background: "transparent", pointerEvents: "none" }, // Removes backdrop functionality
                    },
                }}
                sx={{
                    position: "absolute", // Prevents blocking full-screen interactions
                    left: 0, // Keeps the drawer at the left
                    width: 300, // Adjust drawer width
                    pointerEvents: "auto", // Keeps the drawer interactive
                    zIndex: 1300, // Ensures it appears above content but doesn't block it

                }} open={openMediaPortal} onClose={() => setOpenMediaPortal(false)}>
                <ModalClose />
                <div className='m-5 flex flex-col flex-1 gap-2'>
                    <div>
                        <Title>Media Pool</Title>
                        <Caption>Upload or drag and drop an image on the page</Caption>
                    </div>
                    <div>
                        <Button onClick={() => fileInput.current.click()} variant='outlined' className='w-full'>
                            <div className='flex justify-center items-center gap-2'>
                                <Upload size={16} />
                                Upload Image
                            </div>
                        </Button>
                        <input accept='image/*' onChange={e => handleUpload(e.target.files!)} ref={fileInput} style={{ display: 'none' }} type='file' />

                    </div>
                    <div className='border p-2 border-black border-solid h-full'>
                        <div className='max-h-max flex flex-wrap gap-2'>
                            {imageUrls.map((url: string) => {
                                return (
                                    <button ref={(ref: any) => connectors.create(ref, <ImageContainer url={url} />)}>
                                        <div>
                                            <Image src={url} alt="image" width={120} height={120} />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    )
}
