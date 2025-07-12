'use client'
import { Caption } from '@tailus-ui/typography';
import { ALargeSmall, AlignCenter, AlignHorizontalSpaceAround, AlignLeft, AlignRight, AlignVerticalSpaceAround, Bold, Box, ChevronDown, Columns2, Grid2x2, Image, Italic, LayoutGrid, PanelBottom, Rows2, Square, SquarePlus, StretchHorizontal, StretchVertical, Type, Underline, Video, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { Editor, Frame, Element, useEditor, useNode, UserComponent } from "@craftjs/core";
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import ToggleGroup from '@components/ToggleGroup';
import Popover from '@tailus-ui/Popover';
import IconButton from '@mui/joy/IconButton';
import { SketchPicker } from 'react-color';
import { TbBoxMargin } from "react-icons/tb";
import { TbBoxPadding } from "react-icons/tb";
import 'react-resizable/css/styles.css';
import { useEditorContext } from '@utils/context/EditorContext';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { Resizable } from 're-resizable';



export const Container: UserComponent = ({ gap = 0, background = '#ffffff', flexDirection = 'column', margin = 0, padding = 0, children, width, height, alignMain = "start", alignAlt = "start" }: any) => {
    const { connectors: { connect, drag }, id, hasSelectedNode, parentElement, parentFlexDirection, hasChildNodes, childNodes, hasDraggedNode, parentChildNodes, isHovering, parentNodeWidth, parentNodeHeight, actions: { setProp } } = useNode((state) => ({
        hasChildNodes: state.dom?.hasChildNodes,
        parentFlexDirection: state.dom?.parentElement?.style.flexDirection,
        childNodes: state.dom?.childNodes[0].childNodes,
        parentNodeWidth: state.dom?.parentElement?.clientWidth! - parseInt((state.dom?.parentElement?.style.padding.slice(0, state.dom?.parentElement?.style!.padding.length - 2))!) * 2,
        parentNodeHeight: state.dom?.parentElement?.clientHeight! - parseInt((state.dom?.parentElement?.style.padding.slice(0, state.dom?.parentElement?.style!.padding.length - 2))!) * 2,
        parentChildNodes: state.dom?.parentElement?.childNodes,
        parentElement: state.dom?.parentElement,
        hasSelectedNode: state.events.selected,
        hasDraggedNode: state.events.dragged,
        isHovering: state.events.hovered
    }));
    const { hoveringId, selectedNode, actions, query } = useEditor((state) => ({
        hoveringId: state.events.hovered,
        selectedNode: state.events.selected
    }));

    const nodeRef = useRef<HTMLDivElement>(null);
    const { isResizing, setIsResizing } = useEditorContext();
    console.log(parentNodeWidth);
    useEffect(() => {
        if (width === '100%') {
            actions.setProp(id, (props) => {
                props.width = parentNodeWidth;

            })
        }
    }, [parentElement]);

    const handleMarginChange = (e: any) => {

    }

    return (
        <div id={id} ref={(ref: any) => connect(isResizing ? ref : drag(ref))} draggable={!isResizing}>
            {/* 🟠 Margin Overlay */}
            {(hoveringId.values().toArray()[0] === id && id !== 'ROOT' && !isResizing) && (
                <div
                    style={{
                        width: width + (margin * 2),
                        height: margin * 2 + height,
                        position: 'absolute',
                        backgroundColor: 'rgba(255, 165, 0, 0.1)', // orange
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                >

                </div>
            )}

            <Resizable as={'div'}

                size={{ width: width === '100%' ? parentNodeWidth : width, height: height }}
                onResizeStart={() => {
                    setIsResizing(true)
                    if (hasChildNodes) {
                        let sumWidth = 0;
                        let minHeight = -Infinity;
                        childNodes?.forEach((node: any) => {
                            if (node.nodeName !== 'SPAN') {
                                // Handle width
                                sumWidth += node.offsetWidth
                                // Handle height
                                if (node.offsetHeight > minHeight) {
                                    minHeight = node.offsetHeight
                                }
                            }
                        })

                    }
                }}
                // maxHeight={maxHeight}
                // maxWidth={maxWidth}
                // minHeight={minHeight}
                // minWidth={minWidth}
                snap={{
                    x: [parentNodeWidth - margin * 2, parentNodeWidth / 2, ...Array.prototype.slice.call(childNodes ?? []).map((node) => {
                        return node.offsetWidth + padding * 2
                    }), ...Array.prototype.slice.call(parentChildNodes ?? []).map((node) => {
                        return node.offsetWidth
                    }), query.node("ROOT").get().dom?.offsetWidth! - padding * 2, query.node("ROOT").get().dom?.offsetWidth! / 2], y: [parentNodeHeight, parentNodeHeight / 2, ...Array.prototype.slice.call(childNodes ?? []).map((node) => {
                        return node.offsetHeight + padding * 2
                    }), ...Array.prototype.slice.call(parentChildNodes ?? []).map((node) => {
                        return node.offsetHeight
                    }), query.node("ROOT").get().dom?.offsetHeight, padding * 2, query.node("ROOT").get().dom?.offsetHeight! / 2]
                }}
                snapGap={20}
                // bounds={parentElement!}
                // boundsByDirection
                onResizeStop={(_, __, ___, delta) => {
                    setIsResizing(false)
                    // const currentWidth = typeof width === 'string' ? parseFloat(width) : width;
                    // const newWidth = currentWidth + delta.width;
                    console.log(delta);

                    actions.setProp(id, (props) => {
                        props.width += delta.width;
                        props.height += delta.height
                    })
                    // if (nodeRef.current) {
                    //     Array.from(nodeRef.current.children).forEach((child) => {
                    //         const childEl = child as HTMLElement;
                    //         const originalChildWidth = childEl.offsetWidth;
                    //         const percent = (originalChildWidth / currentWidth) * 100;
                    //         const newChildWidth = (newWidth * percent) / 100;
                    //         childEl.style.width = `${newChildWidth}px`;
                    //     });
                    // }
                }}
                style={{
                    display: 'flex', flexDirection, margin, padding, background, gap: `${gap}px`, width, height
                }}
                className={` relative ${selectedNode.values().toArray()[0] === id ? "outline outline-blue-800" : ""}  ${isHovering && selectedNode.values().toArray()[0] !== id ? `outline-dashed outline-blue-800 outline-2` : ''} ${isHovering && selectedNode.values().toArray()[0] === id ? `outline outline-blue-800 outline-2` : ''} ${!isHovering && selectedNode.values().toArray()[0] === id ? `outline outline-blue-800 outline-2` : ''} justify-${alignMain} items-${alignAlt} outline-offset-1`}
                defaultSize={{ width: width === '100%' ? parentElement?.offsetWidth : width, height: height }}
            >
                {hoveringId.values().toArray()[0] === id && id !== 'ROOT' && !isResizing && (
                    <div><div
                        style={{
                            position: 'absolute',
                            height: padding,
                            width: width,
                            top: 0,
                            left: 0,
                            backgroundColor: 'rgba(0, 128, 0, 0.1)', // green
                            zIndex: 0,
                            pointerEvents: 'none',
                            borderRadius: 4,
                        }}
                    >
                    </div>
                        <div
                            style={{
                                position: 'absolute',
                                height: padding,
                                width: width,
                                top: height - padding,
                                left: 0,
                                backgroundColor: 'rgba(0, 128, 0, 0.1)', // green
                                zIndex: 0,
                                pointerEvents: 'none',
                                borderRadius: 4,
                            }}
                        >
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                height: height - padding * 2,
                                width: padding,
                                top: padding,
                                left: 0,
                                backgroundColor: 'rgba(0, 128, 0, 0.1)', // green
                                zIndex: 0,
                                pointerEvents: 'none',
                                borderRadius: 4,
                            }}
                        >
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                height: height - padding * 2,
                                width: padding,
                                top: padding,
                                left: width - padding,
                                backgroundColor: 'rgba(0, 128, 0, 0.1)', // green
                                zIndex: 0,
                                pointerEvents: 'none',
                            }}
                        >
                        </div></div>
                )}

                {children}
            </Resizable>
        </div>


    )
}



export const ContainerSettings = () => {
    const { actions: { setProp }, props, parentNodeHeight, parentNodeWidth } = useNode((state) => ({
        props: state.data.props,
        parentNodeWidth: state.dom?.parentElement?.clientWidth! - parseInt((state.dom?.parentElement?.style.padding.slice(0, state.dom?.parentElement?.style!.padding.length - 2))!) * 2,
        parentNodeHeight: state.dom?.parentElement?.clientHeight! - parseInt((state.dom?.parentElement?.style.padding.slice(0, state.dom?.parentElement?.style!.padding.length - 2))!) * 2,
    }));
    useEffect(() => {

    }, []);
    const [color, setColor] = useState<string>("#000000");
    const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const margin = parseInt(e.target.value)
        console.log(parentNodeWidth, props.width + margin)
        if (props.width + margin * 2 > parentNodeWidth) {
            setProp((props: Record<string, any>) => props.width = props.width - (props.width + (margin * 2) - parentNodeWidth))
        }
        setProp((props: any) => props.margin = margin)
    }
    return (
        <div>
            <div>
                <Caption className='font-bold text-slate-300 mt-5'>Layout</Caption>
                <div className='flex w-full flex-col gap-2'>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Width</Caption>
                        <Input className='w-1/3 text-xs' endDecorator={'px'} value={props.width} onChange={(e) => setProp((props: any) => props.width = parseInt(e.target.value))} />

                    </div>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Height</Caption>
                        <Input className='w-1/3 text-xs' endDecorator={'px'} value={props.height} onChange={(e) => setProp((props: any) => props.height = parseInt(e.target.value))} />

                    </div>
                    <div className='w-full flex flex-col gap-2 justify-end items-end'>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Margin</Caption>
                            <div className='w-1/2 flex justify-end gap-1'>
                                <Input className='w-4/6 text-xs' value={props.margin} onChange={handleMarginChange} endDecorator={'px'} />
                                <IconButton variant='outlined'>
                                    <TbBoxMargin />
                                </IconButton>
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Padding</Caption>
                            <div className='w-1/2 flex justify-end gap-1'>
                                <Input className='w-4/6 text-xs' value={props.padding} onChange={(e) => setProp((props: any) => {
                                    if (!e.target.value.length) {
                                        props.padding = 0
                                    } else {
                                        props.padding = parseInt(e.target.value)
                                    }
                                })} endDecorator={'px'} />
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
                                    <ToggleGroup.Item value="row" className='w-1/3'>
                                        <ToggleGroup.Icon size='xs'>
                                            <StretchVertical />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                    <ToggleGroup.Item value="column" className='w-1/3'>
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
                        <Caption className='font-bold text-slate-300 mt-2
                         self-start'>Alignment</Caption>

                        <div className='w-full justify-between items-center flex'>
                            <Caption>{props.flexDirection === 'row' ? "Horizontal" : "Vertical"}</Caption>
                            <div className='w-4/6 border border-slate-300 rounded-lg py-[1px]'>
                                <Select defaultValue={props.alignMain} onChange={(event, value) => {
                                    setProp((props: any) => props.alignMain = value)
                                }}>
                                    <Option value="start">Start</Option>
                                    <Option value="center">Center</Option>
                                    <Option value="end">End</Option>
                                    <Option value="between">Spread Evenly</Option>
                                    <Option value="around">Loosely Spaced</Option>
                                    <Option value="evenly">Fully Spaced</Option>
                                </Select>
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>{props.flexDirection === 'row' ? "Vertical" : "Horizontal"}</Caption>
                            <div className='w-4/6 border border-slate-300 rounded-lg py-[1px]'>
                                <Select defaultValue={props.alignAlt} onChange={(event, value) => {
                                    setProp((props: any) => props.alignAlt = value)
                                }}>
                                    <Option value="start">Start</Option>
                                    <Option value="center">Center</Option>
                                    <Option value="end">End</Option>
                                    <Option value="between">Spread Evenly</Option>
                                    <Option value="around">Loosely Spaced</Option>
                                    <Option value="evenly">Fully Spaced</Option>
                                </Select>
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Gap</Caption>
                            <div className=' w-1/3 flex gap-1 '>
                                <div className='w-full'>
                                    <Input value={props.gap} onChange={(e) => {
                                        setProp((props: any) => props.gap = e.target.value)
                                    }} endDecorator={`px`} className='text-xs' />
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
                                        }} className='w-full gap-2'><div className={`w-5 h-5 border-black border border-solid`} style={{
                                            backgroundColor: props.background
                                        }}></div>{props.background}</Button>
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content mixed className="max-w-xs">
                                            <SketchPicker color={props.background} onChangeComplete={(color: any, event: any) => {
                                                setProp((props: any) => props.background = color.hex)

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
                                    }} className='w-full gap-2'><div className={`w-5 h-5 border border-black border-solid`} style={{
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
    displayName: "Container",
    related: {
        settings: ContainerSettings
    },
    props: {
        width: '100%',
        height: 200,
        margin: 0,
        padding: 0,
        flexDirection: 'row',
        gap: 0,
        alignMain: "start",
        alignAlt: "start",
    }
}
