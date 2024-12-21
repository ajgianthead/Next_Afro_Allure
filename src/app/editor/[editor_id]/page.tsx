'use client'

import Tabs from '@tailus-ui/Tabs'
import { Caption } from '@tailus-ui/typography';
import {
    type TabsListProps as ListProps,
    type TabsIndicatorProps as IndicatorProps,
} from "@tailus/themer"; import { Box, Columns2, Grid2x2, Image, PanelBottom, Rows2, Square, SquarePlus, Type, Video } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { Editor, Frame, Element } from "@craftjs/core";
import { Container } from '@components/editor/Container';
import { Button } from '@components/editor/Button';
import { Text } from '@components/editor/Text';


type TabsAppProps = "layout" | "components" | "pre-built"

interface TabsUIProps extends ListProps {
    indicatorVariant?: IndicatorProps["variant"]
}

export default function page() {
    const [state, setState] = useState<TabsAppProps>("components");
    const spanRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const activeTrigger = document.getElementById(state) as HTMLElement;
        if (spanRef.current) {
            spanRef.current.style.left = activeTrigger.offsetLeft + "px";
            spanRef.current.style.width = activeTrigger.offsetWidth + "px";
        }
    }, [state]);
    return (
        <div>
            <Editor resolver={{ Container, Button, Text }}>
                <div className='w-full h-10 border-b border-[#D4D4D4]'>

                </div>
                <main className='flex h-[calc(100vh-40px)] w-full bg-gray-100'>
                    <section className='h-full bg-white w-[400px] p-5 border-r border-[#D4D4D4]'>
                        <Tabs.Root className="space-y-4" defaultValue={state} onValueChange={(value) => setState(value as TabsAppProps)}>
                            <Tabs.List data-shade="925" variant="soft" triggerVariant="plain" size="sm" className='h-12'>
                                <Tabs.Indicator ref={spanRef} variant="elevated" className="bg-white" />
                                <Tabs.Trigger value="layout" id="layout">Layouts</Tabs.Trigger>
                                <Tabs.Trigger value="components" id="components">Components</Tabs.Trigger>
                                <Tabs.Trigger value="pre-built" id="pre-built">Pre-built Components</Tabs.Trigger>
                            </Tabs.List>
                            <Tabs.Content value="layout" className="text-[--caption-text-color]">
                                <div className='flex flex-wrap gap-2'>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Columns2 size={40} />
                                        </div>
                                        <Caption>Columns</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Rows2 size={40} />
                                        </div>
                                        <Caption>Rows</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Grid2x2 size={40} />
                                        </div>
                                        <Caption>Grid</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <PanelBottom size={40} />
                                        </div>
                                        <Caption>Section</Caption>
                                    </div>

                                </div>
                            </Tabs.Content>
                            <Tabs.Content value="components" className="text-[--caption-text-color]">
                                <div className='flex flex-wrap gap-2'>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Box size={40} />
                                        </div>
                                        <Caption>Container</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Type size={40} />
                                        </div>
                                        <Caption>Text</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <SquarePlus size={40} />
                                        </div>
                                        <Caption>Button</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Image size={40} />
                                        </div>
                                        <Caption>Image</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Video size={40} />
                                        </div>
                                        <Caption>Video</Caption>
                                    </div>
                                </div>
                            </Tabs.Content>
                            <Tabs.Content value="pre-built" className="text-[--caption-text-color]">
                                <div className='flex flex-wrap gap-2'>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Square size={40} />
                                        </div>
                                        <Caption>Navbar</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Square size={40} />
                                        </div>
                                        <Caption>Hero Section</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Square size={40} />
                                        </div>
                                        <Caption>Policies</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Square size={40} />
                                        </div>
                                        <Caption>Services</Caption>
                                    </div>
                                    <div className='w-[calc(100%/3-8px)] flex gap-1 flex-col  rounded-t border-[#D4D4D4] justify-center items-center'>
                                        <div className='w-full border border-[#D4D4D4] rounded flex justify-center py-5'>
                                            <Square size={40} />
                                        </div>
                                        <Caption>Call to Action</Caption>
                                    </div>
                                </div>
                            </Tabs.Content>
                        </Tabs.Root>
                    </section>
                    {/* Canvas */}
                    <section>
                        <div className='w-[900px] h-screen overflow-y-clip bg-gray-100'>
                            <Frame>
                                <Element is={Container} padding={5} background="#eee" canvas>
                                    <Button size="small" variant="outlined">Click</Button>
                                    <Text size="small" text="Hi world!" />
                                    <Element is={Container} padding={20} background="#999" canvas>
                                        <Text size="small" text="It's me again!" />
                                    </Element>
                                </Element>
                            </Frame>
                        </div>
                    </section>
                    {/* Settings Bar */}
                    <section>
                        <div className='w-[calc(100vw-1300px)] bg-white h-full border-l border-[#D4D4D4]'>

                        </div>
                    </section>
                </main>
            </Editor>


        </div >
    )
}
