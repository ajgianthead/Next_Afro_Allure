import { Caption } from '@tailus-ui/typography'
import { Box, Image, SquarePlus, Type, Video } from 'lucide-react'
import React from 'react'
import { Container } from './Container'
import { useEditor } from '@craftjs/core';
import { EditableText, Text } from './Text';
import { EditableButton } from './Button';

export default function Toolbox() {
    const { connectors, query } = useEditor();
    return (
        <div>
            <div className='flex flex-wrap gap-2'>
                <button ref={(ref: any) => connectors.create(ref, <Container padding={10} background="#eee" />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
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
                <button ref={(ref: any) => connectors.create(ref, <EditableButton size='md' variant="solid" color='primary' text="Insert text..." />)} className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <SquarePlus size={40} />
                    </div>
                    <Caption>Button</Caption>
                </button>
                <button className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <Image size={40} />
                    </div>
                    <Caption>Image</Caption>
                </button>
                <button className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                    <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                        <Video size={40} />
                    </div>
                    <Caption>Video</Caption>
                </button>
            </div>
        </div>
    )
}
