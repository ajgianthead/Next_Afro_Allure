'use client'

import Tabs from '@tailus-ui/Tabs'
import { Caption } from '@tailus-ui/typography';
import {
    type TabsListProps as ListProps,
    type TabsIndicatorProps as IndicatorProps,
} from "@tailus/themer"; import { ALargeSmall, AlignCenter, AlignLeft, AlignRight, Bold, Box, ChevronDown, Columns2, Grid2x2, Image, Italic, PanelBottom, Rows2, Square, SquarePlus, Type, Underline, Video } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { Container } from '@components/editor/Container';
import { EditableButton } from '@components/editor/Button';
import { EditableText, Text } from '@components/editor/Text';
import Button from '@mui/joy/Button';
import Toolbox from '@components/editor/Toolbox';
import Input from '@mui/joy/Input';
import ToggleGroup from '@components/ToggleGroup';
import { TbLineHeight } from "react-icons/tb";
import { TbLetterSpacing } from "react-icons/tb";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

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
                    <section>
                        <div className='w-[900px] h-screen overflow-y-clip bg-gray-100'>
                            <Frame>
                                <Element is={Container} padding={5} background="#eee" canvas>
                                    <EditableButton size="small" variant="outlined">Click</EditableButton>
                                    <EditableText text="Hi world!" />
                                    <Element is={Container} padding={20} background="#999" canvas>
                                        <EditableText text="It's me again!" />
                                    </Element>
                                </Element>
                            </Frame>
                        </div>
                    </section>
                    {/* Settings Bar */}
                    <section>
                        <div className='w-[300px] bg-white h-full border-l border-[#D4D4D4] p-3'>
                            <div>
                                <Caption className='font-bold text-slate-300'>Typography</Caption>
                                <div className='flex w-full flex-col gap-2'>
                                    <div className='w-full justify-between items-center flex'>
                                        <Caption>Font</Caption>
                                        <Select placeholder="Choose one…" className='w-4/6'>
                                            <Option value={'some'}>...</Option>
                                        </Select>
                                    </div>
                                    <div className='w-full justify-end items-center flex'>
                                        <Select placeholder="Choose one…" className='w-4/6'>
                                            <Option value={"another"}>...</Option>
                                        </Select>
                                    </div>
                                    <div className='w-full flex flex-col gap-2 justify-end items-end'>
                                        <div className='flex w-4/6 items-end justify-between gap-1'>
                                            <div className='w-1/2'>
                                                <Input startDecorator={<ALargeSmall />} />
                                            </div>
                                            <div className='w-1/2 border border-slate-300 rounded-lg py-[1px]'>
                                                <ToggleGroup.Root size='sm' variant='soft' type="multiple">
                                                    <ToggleGroup.Item value="bold">
                                                        <ToggleGroup.Icon size='xs'>
                                                            <Bold />
                                                        </ToggleGroup.Icon>
                                                    </ToggleGroup.Item>
                                                    <ToggleGroup.Item value="italic">
                                                        <ToggleGroup.Icon size='xs'>
                                                            <Italic />
                                                        </ToggleGroup.Icon>
                                                    </ToggleGroup.Item>
                                                    <ToggleGroup.Item value="underline">
                                                        <ToggleGroup.Icon size='xs'>
                                                            <Underline />
                                                        </ToggleGroup.Icon>
                                                    </ToggleGroup.Item>
                                                </ToggleGroup.Root>
                                            </div>
                                        </div>
                                        <div className='flex w-4/6 items-end justify-between gap-1'>
                                            <div className='w-1/2'>
                                                <Input startDecorator={<TbLineHeight />} />
                                            </div>
                                            <div className='w-1/2'>
                                                <Input startDecorator={<TbLetterSpacing />} />
                                            </div>
                                        </div>
                                        <div className='w-full justify-between items-center flex'>
                                            <Caption>Align</Caption>
                                            <div className='w-4/6 border border-slate-300 rounded-lg py-[1px]'>
                                                <ToggleGroup.Root size='sm' variant='soft' type="single" className='w-full flex justify-evenly'>
                                                    <ToggleGroup.Item value="bold" className='w-1/3'>
                                                        <ToggleGroup.Icon size='xs'>
                                                            <AlignLeft />
                                                        </ToggleGroup.Icon>
                                                    </ToggleGroup.Item>
                                                    <ToggleGroup.Item value="italic" className='w-1/3'>
                                                        <ToggleGroup.Icon size='xs'>
                                                            <AlignCenter />
                                                        </ToggleGroup.Icon>
                                                    </ToggleGroup.Item>
                                                    <ToggleGroup.Item value="underline" className='w-1/3'>
                                                        <ToggleGroup.Icon size='xs'>
                                                            <AlignRight />
                                                        </ToggleGroup.Icon>
                                                    </ToggleGroup.Item>
                                                </ToggleGroup.Root>
                                            </div>
                                        </div>
                                        <div className='w-full justify-between items-center flex'>
                                            <Caption>Color</Caption>
                                            <div className='w-4/6 border border-slate-300 rounded-lg py-[1px]'>
                                                <ToggleGroup.Root size='sm' variant='soft' type="single" className='w-full flex justify-evenly'>
                                                    <ToggleGroup.Item value="bold" className='w-1/3'>
                                                        <ToggleGroup.Icon size='xs'>
                                                            <AlignLeft />
                                                        </ToggleGroup.Icon>
                                                    </ToggleGroup.Item>
                                                    <ToggleGroup.Item value="italic" className='w-1/3'>
                                                        <ToggleGroup.Icon size='xs'>
                                                            <AlignCenter />
                                                        </ToggleGroup.Icon>
                                                    </ToggleGroup.Item>
                                                    <ToggleGroup.Item value="underline" className='w-1/3'>
                                                        <ToggleGroup.Icon size='xs'>
                                                            <AlignRight />
                                                        </ToggleGroup.Icon>
                                                    </ToggleGroup.Item>
                                                </ToggleGroup.Root>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </Editor>


        </div >
    )
}
