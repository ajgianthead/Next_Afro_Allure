'use client'
import { useEditor, useNode, UserComponent } from "@craftjs/core";
import { Button, IconButton, Input } from "@mui/joy";
import Popover from "@tailus-ui/Popover";
import { Caption } from "@tailus-ui/typography";
import { useEditorContext } from "@/app/utils/context/EditorContext";
import Image from "next/image";
import { useState } from "react";
import { SketchPicker } from "react-color";
import { TbBoxMargin } from "react-icons/tb";
import { ResizableBox } from "react-resizable";

export const Video: UserComponent = ({ margin = 0, width = 500, height = 500, url }: any) => {
    const { connectors: { connect, drag }, id, hasSelectedNode, hasDraggedNode, isHovering, parentNodeWidth, parentNodeHeight, actions: { setProp } } = useNode((state) => ({
        parentNodeWidth: state.dom?.parentElement?.style.width.slice(0, state.dom?.parentElement?.style.width.length - 2),
        parentNodeHeight: state.dom?.parentElement?.style.height.slice(0, state.dom?.parentElement?.style.height.length - 2),
        hasSelectedNode: state.events.selected,
        hasDraggedNode: state.events.dragged,
        isHovering: state.events.hovered
    }));
    const { selectedNode, actions } = useEditor((state) => ({
        selectedNode: state.events.selected
    }));
    const { isResizing, setIsResizing } = useEditorContext();


    return (
        <div ref={(ref: any) => connect(isResizing ? ref : drag(ref))} draggable={!isResizing} >
            <ResizableBox
                resizeHandles={hasSelectedNode && !hasDraggedNode ? ["se", "e", "s"] : []} // Only show handles if selected
                maxConstraints={[parseInt(parentNodeWidth!), parseInt(parentNodeHeight!)]}
                width={width}
                height={height}
                axis="both" // Allows resizing in both directions
                onResizeStop={(e: React.SyntheticEvent, { size }: any) => {
                    setIsResizing(false);
                    actions.setProp(id, (props: any) => {
                        props.width = size.width;
                        props.height = size.height;
                    });
                }}
                onResizeStart={() => {

                    actions.selectNode(id)
                    setIsResizing(true);
                }}
                style={{
                    width: '100%', height: '100%', display: 'flex', margin,
                }}
                className={`relative ${selectedNode.values().toArray()[0] === id ? "border-solid border-blue-800" : ""} ${isHovering && selectedNode.values().toArray()[0] !== id ? `border-dashed border-blue-800 border-2` : ''} ${isHovering && selectedNode.values().toArray()[0] === id ? `border-solid border-blue-800 border-2` : ''} ${!isHovering && selectedNode.values().toArray()[0] === id ? `border-solid border-blue-800 border-2` : ''} min-w-min min-h-min`}
            >
                <iframe src={url} className="w-full h-full" allowFullScreen loading="lazy" />
                <div className="absolute w-full h-full"></div>
            </ResizableBox>

        </div>
    )
}

const VideoSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));
    const [color, setColor] = useState<string>("#000000");

    return (
        <div>
            <div>
                <Caption className='font-bold text-slate-300 mt-5'>Layout</Caption>
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
                                <Input className='w-4/6 text-xs' value={props.margin} onChange={(e) => setProp((props: any) => props.margin = parseInt(e.target.value))} endDecorator={'px'} />
                                <IconButton variant='outlined'>
                                    <TbBoxMargin />
                                </IconButton>
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

Video.craft = {
    displayName: "Video",
    related: {
        settings: VideoSettings
    },
    props: {
        margin: 0,
        width: 500,
        height: 500,
        url: ""
    }
}
