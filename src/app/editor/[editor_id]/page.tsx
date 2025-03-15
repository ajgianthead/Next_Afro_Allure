'use client'

import Tabs from '@tailus-ui/Tabs'
import { Caption } from '@tailus-ui/typography';
import {
    type TabsListProps as ListProps,
    type TabsIndicatorProps as IndicatorProps,
} from "@tailus/themer";
import { Columns2, Grid2x2, PanelBottom, Rows2, Square } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { Container } from '@components/editor/Container';
import { EditableButton } from '@components/editor/Button';
import { EditableText } from '@components/editor/Text';
import Toolbox from '@components/editor/Toolbox';
import Settings from '@components/editor/Settings';
import { EditorWrapper } from '@utils/context/EditorContext';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";



type TabsAppProps = "layout" | "components" | "pre-built"

interface TabsUIProps extends ListProps {
    indicatorVariant?: IndicatorProps["variant"]
}

export default function Page() {
    const [state, setState] = useState<TabsAppProps>("components");
    const spanRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const activeTrigger = document.getElementById(state) as HTMLElement;
        if (spanRef.current) {
            spanRef.current.style.left = activeTrigger.offsetLeft + "px";
            spanRef.current.style.width = activeTrigger.offsetWidth + "px";
        }
    }, [state]);
    const containerRef = useRef<any>(null);
    return (
        <EditorWrapper>
            <div>
                {/* TODO: Put Transform Wrapper in a component and use useEditor() */}
                <Editor resolver={{ Container, EditableButton, EditableText }}>
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
                                    <Toolbox />
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
                        <div className='flex overflow-y-hidden' ref={containerRef}>
                            <EditorSpace />
                        </div>

                        {/* Settings Bar */}
                        <section className=' w-[300px]'>
                            <div className='overflow-y-scroll flex flex-col gap-5 bg-white h-full border-l border-[#D4D4D4] p-3'>
                                <Settings />
                            </div>
                        </section>
                    </main>
                </Editor>


            </div >
        </EditorWrapper>

    )
}

const EditorSpace = () => {
    const [isPanningEnabled, setIsPanningEnabled] = useState(false);

    const handleMouseDown = (e: any) => {
        // Prevent react-zoom-pan-pinch from interfering with Craft.js dragging
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            setIsPanningEnabled(true); // Enable zoom pan pinch panning
        } else {
            e.stopPropagation();
        }
    };

    const handleMouseUp = () => {
        setIsPanningEnabled(false);
    };

    return (
        <div onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
            <TransformWrapper panning={{ disabled: !isPanningEnabled }} centerZoomedOut={true} minScale={0.5} initialScale={0.6} maxScale={5} initialPositionX={1280 / 2 - 550}>
                <TransformComponent>
                    <section>
                        <div className='w-full h-screen bg-gray-100'>
                            <Frame>
                                <Element is={Container} padding={5} background="#fff" flexDirection='column' width={1280} height={900} canvas>
                                    <EditableButton size='md' variant="solid" color='#000000' text="Insert text..." />
                                    <EditableText text="Hi world!" />
                                    <Element is={Container} padding={20} background="#999" canvas>
                                        <EditableText text="It's me again!" />
                                    </Element>
                                </Element>
                            </Frame>
                        </div>
                    </section>
                </TransformComponent>
            </TransformWrapper>
        </div>
    )
}
