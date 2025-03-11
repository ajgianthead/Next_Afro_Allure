'use client'
import { Caption } from '@tailus-ui/typography';
import { ALargeSmall, AlignCenter, AlignHorizontalSpaceAround, AlignLeft, AlignRight, AlignVerticalSpaceAround, Bold, Box, ChevronDown, Columns2, Grid2x2, Image, Italic, LayoutGrid, PanelBottom, Rows2, Square, SquarePlus, StretchHorizontal, StretchVertical, Type, Underline, Video, X } from 'lucide-react';
import React, { useState } from 'react'
import { Editor, Frame, Element, useEditor, useNode } from "@craftjs/core";
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import ToggleGroup from '@components/ToggleGroup';
import Popover from '@tailus-ui/Popover';
import IconButton from '@mui/joy/IconButton';
import { SketchPicker } from 'react-color';
import { TbBoxMargin } from "react-icons/tb";
import { TbBoxPadding } from "react-icons/tb";
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useEditorContext } from '@utils/context/EditorContext';

export const Container = ({ background, flexDirection = 'row', margin = 0, padding = 0, children, width = 500, height = 200 }: any) => {
    const { connectors: { connect, drag }, id, hasSelectedNode, hasDraggedNode, isHovering, actions: { setProp } } = useNode((state: any) => ({
        hasSelectedNode: state.events.selected,
        hasDraggedNode: state.events.dragged,
        isHovering: state.events.hovered
    }));
    const { hoveringId, actions } = useEditor((state) => ({
        hoveringId: state.events.hovered
    }));
    const { isResizing, setIsResizing } = useEditorContext();
    return (
        <div ref={(ref: any) => connect(ref)} style={{ flexDirection, margin, padding, display: 'flex' }} className="max-h-min"
        //  onClick={(e) => {
        //     e.stopPropagation();
        //     if (hoveringId.values().toArray()[0] !== id) {

        //     }
        //     actions.selectNode(id);
        // }}
        >
            <ResizableBox
                resizeHandles={hasSelectedNode ? ["se", "e", "s"] : []} // Only show handles if selected
                width={width}
                height={height}
                axis="both" // Allows resizing in both directions
                minConstraints={[50, 50]}
                maxConstraints={[800, 600]}
                onResizeStop={(e: React.SyntheticEvent, { size }: any) => {
                    console.log('stop');

                    setIsResizing(false);
                    actions.setProp(id, (props: any) => {
                        props.width = size.width;
                        props.height = size.height;
                    });
                }}
                onResizeStart={() => {
                    console.log('start');

                    actions.selectNode(id)
                    setIsResizing(true);
                }}
                className={` relative ${hasSelectedNode ? "border-solid border-blue-800" : ""} ${isHovering && !isResizing ? `border-blue-800 ${hasSelectedNode ? 'border-solid' : 'border-dotted'}` : "border-transparent"} border`}
            >
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection, margin, padding }}>
                    {children}
                </div>
            </ResizableBox>
        </div>
    )
}

const ContainerSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));
    const [color, setColor] = useState<string>("#000000");
    return (
        <div>
            <div>
                <Caption className='font-bold text-slate-300 mb-5'>Layout</Caption>
                <div className='flex w-full flex-col gap-2'>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Width</Caption>
                        <Input className='w-1/3 text-xs' endDecorator={'px'} value={props.width} onChange={(e) => setProp((props: any) => props.width = e.target.value)} />

                    </div>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Height</Caption>
                        <Input className='w-1/3 text-xs' endDecorator={'px'} value={props.height} onChange={(e) => setProp((props: any) => props.height = e.target.value)} />

                    </div>
                    <div className='w-full flex flex-col gap-2 justify-end items-end'>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Margin</Caption>
                            <div className='w-1/2 flex justify-end gap-1'>
                                <Input className='w-4/6 text-xs' value={props.margin} onChange={(e) => setProp((props: any) => props.margin = e.target.value)} endDecorator={'px'} />
                                <IconButton variant='outlined'>
                                    <TbBoxMargin />
                                </IconButton>
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Padding</Caption>
                            <div className='w-1/2 flex justify-end gap-1'>
                                <Input className='w-4/6 text-xs' value={props.padding} onChange={(e) => setProp((props: any) => props.padding = e.target.value)} endDecorator={'px'} />
                                <IconButton variant='outlined'>
                                    <TbBoxPadding />
                                </IconButton>
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Direction</Caption>
                            <div className='w-4/6 border border-slate-300 rounded-lg py-[1px]'>
                                <ToggleGroup.Root defaultValue={props.flexDirection} onValueChange={(value: string) => {
                                    setProp((props: any) => props.flexDirection = value)
                                }} size='sm' variant='soft' type="single" className='w-full flex justify-evenly'>
                                    <ToggleGroup.Item value="column" className='w-1/3'>
                                        <ToggleGroup.Icon size='xs'>
                                            <StretchVertical />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                    <ToggleGroup.Item value="row" className='w-1/3'>
                                        <ToggleGroup.Icon size='xs'>
                                            <StretchHorizontal />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                    <ToggleGroup.Item value="grid" className='w-1/3'>
                                        <ToggleGroup.Icon size='xs'>
                                            <LayoutGrid />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                </ToggleGroup.Root>
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Gap</Caption>
                            <div className='w-4/6 flex gap-1 '>
                                <div className='w-1/2'>
                                    <Input startDecorator={<AlignVerticalSpaceAround size={12} />} className='text-xs' />
                                </div>
                                <div className='w-1/2'>
                                    <Input startDecorator={<AlignHorizontalSpaceAround size={12} />} className='text-xs' />
                                </div>
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Color</Caption>
                            <div className='w-4/6 py-[1px]'>
                                <Popover.Root>
                                    <Popover.Trigger asChild>
                                        <Button variant='outlined' sx={{
                                            color: "black",
                                            borderColor: "black",
                                            backgroundColor: "white",
                                            display: 'flex',
                                        }} className='w-full gap-2'><div className={`w-5 h-5`} style={{
                                            backgroundColor: color
                                        }}></div>{color}</Button>
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content mixed className="max-w-xs">
                                            <SketchPicker color={color} onChangeComplete={(color: any, event: any) => {
                                                setColor(color.hex)
                                            }} />                                                            <Popover.Close asChild>

                                            </Popover.Close>
                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Caption className='font-bold text-slate-300 mb-5'>Border</Caption>
                <div className='flex w-full flex-col gap-2'>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Width</Caption>
                        <Input className='w-1/3 text-xs' endDecorator={'px'} />
                    </div>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Color</Caption>
                        <div className='w-4/6 py-[1px]'>
                            <Popover.Root>
                                <Popover.Trigger asChild>
                                    <Button variant='outlined' sx={{
                                        color: "black",
                                        borderColor: "black",
                                        backgroundColor: "white",
                                        display: 'flex',
                                    }} className='w-full gap-2'><div className={`w-5 h-5`} style={{
                                        backgroundColor: color
                                    }}></div>{color}</Button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content mixed className="max-w-xs">
                                        <SketchPicker color={color} onChangeComplete={(color: any, event: any) => {
                                            setColor(color.hex)
                                        }} />                                                            <Popover.Close asChild>

                                        </Popover.Close>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        </div>
                    </div>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Radius</Caption>
                        <Input className='w-1/3 text-xs' endDecorator={'px'} />
                    </div>
                </div>
            </div>
        </div>
    )
}

Container.craft = {
    related: {
        settings: ContainerSettings
    },
    props: {
        width: 500,
        height: 200,
        margin: 0,
        padding: 0,
        flexDirection: 'row',
    }
}
