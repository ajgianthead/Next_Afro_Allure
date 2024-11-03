'use client'

import Input from '@components/Input';
import Label from '@components/Label';
import ScrollArea from '@components/ScrollArea';
import Textarea from '@components/TextArea';
import Card from '@tailus-ui/Card';
import { Text } from '@tailus-ui/typography';
import Image from 'next/image';
import React, { useState } from 'react';
import InputColor from 'react-input-color';
import { ResponsiveIframeViewer, ViewportSize } from 'react-responsive-iframe-viewer';



const Page = () => {
    const [images, setImages] = useState<string[]>([])
    return (
        <div className='flex gap-2'>
            {/* Input */}
            <div className="w-[400px] p-8">
                <div className='flex flex-col gap-2'>
                    <Text weight={'semibold'}>Choose a template</Text>
                    <ScrollArea.Root className=" py-2">
                        <ScrollArea.Viewport>
                            <div className='flex gap-2 '>
                                <Card className='min-w-[152.5px] bg-slate-600' variant='outlined'>
                                </Card>
                                <Card className='min-w-[152.5px] bg-slate-600' variant='outlined'>
                                </Card>
                                <Card className='min-w-[152.5px] bg-slate-600' variant='outlined'>
                                </Card>

                            </div>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar data-orientation="horizontal" orientation="horizontal" />
                    </ScrollArea.Root>
                    <div className='flex items-center gap-2'>
                        <Text weight={'semibold'}>Primary Color:</Text>                        <InputColor
                            initialValue="#FC6161"
                            onChange={() => { }}
                            placement="bottom"
                        />
                    </div>
                    <div>
                        <Label>Upload Logo</Label>
                        <Input type="file" />
                    </div>
                    <div>
                        <Label htmlFor="hero-heading" >Hero Section Heading</Label>
                        <Input id="hero-heading" placeholder="Ex. Connect and Book" />
                    </div>

                    <div>
                        <Label>Hero Section Subtext</Label>
                        <Textarea placeholder="Ex. We offer amazing hairstyles" />
                    </div>
                    <div>
                        <Label>About Section</Label>
                        <Textarea placeholder="Tell clients about your business" />
                    </div>
                    <div>
                        <Label>Upload Image(s)</Label>
                        <p className='text-xs font-light text-gray-400 italic mb-1' >Max of 15 images</p>
                        <Input type="file" max={15} onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setImages([
                                    ...images,
                                    URL.createObjectURL(e.target.files[0])
                                ])
                            }
                        }} />
                        <div className='flex flex-wrap gap-1 mt-3'>
                            {images.map((image, index) => {
                                return (
                                    <div key={index}>
                                        <Image alt='image' src={image} width={70} height={70} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {/* Preview */}
            <div className='w-full flex items-center'>
                <ResponsiveIframeViewer
                    className="w-full border border-black"
                    src="http://localhost:3000/dashboard/preview/b9b2eabd-5764-4830-9c6b-66c29a34f8f5"
                    title="Booking Site Preview"
                    size={ViewportSize.desktop}
                /> </div>
        </div>
        // 
    );
}

export default Page;
