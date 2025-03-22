'use client'
import { useEditor, useNode, UserComponent } from "@craftjs/core";
import React, { useRef, useState } from "react";
import { default as MUIButton } from '@mui/joy/Button';
import { ContainerSettings } from "./Container";
import { TextSettings } from "./Text";
import { Caption } from "@tailus-ui/typography";
import Input from "@mui/joy/Input";
import IconButton from "@mui/joy/IconButton";
import { TbBoxMargin, TbBoxPadding, TbLetterSpacing, TbLineHeight } from "react-icons/tb";
import ToggleGroup from "@components/ToggleGroup";
import { ALargeSmall, AlignCenter, AlignLeft, AlignRight, Bold, Italic, LayoutGrid, StretchHorizontal, StretchVertical, Underline } from "lucide-react";
import Popover from "@tailus-ui/Popover";
import { SketchPicker } from "react-color";
import FontPicker from "react-fontpicker-ts";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";


export const EditableButton: UserComponent = ({ size, variant = 'primary', color = '#000000', text = 'Insert text...', background = '#45c9ea', padding = 'auto', margin = 'auto', width = 'auto', height = 'auto', fontFamily = 'Open Sans', textAlign = 'center', fontSize = 16, fontWeight = 'normal', fontStyle = 'none', textDecorationLine = 'none', lineHeight = 1.5, letterSpacing = 0 }: any) => {
    const { connectors: { connect, drag }, id, hasSelectedNode, hasDraggedNode, isHovering, nodeWidth, nodeHeight, actions: { setProp } } = useNode((state) => ({
        nodeWidth: state.dom?.style.width.slice(0, state.dom?.style.width.length - 2),
        nodeHeight: state.dom?.style.height.slice(0, state.dom?.style.height.length - 2),
        hasSelectedNode: state.events.selected,
        hasDraggedNode: state.events.dragged,
        isHovering: state.events.hovered
    }));
    const { hoveringId, selectedNode, actions } = useEditor((state) => ({
        hoveringId: state.events.hovered,
        selectedNode: state.events.selected
    }));
    return (
        <div ref={(ref: any) => connect(drag(ref))} className={`max-w-max max-h-min ${selectedNode.values().toArray()[0] === id ? "border-solid border-blue-800" : ""} ${isHovering && selectedNode.values().toArray()[0] !== id ? `border-dashed border-blue-800 border-2` : ''} ${isHovering && selectedNode.values().toArray()[0] === id ? `border-solid border-blue-800 border-2` : ''} ${!isHovering && selectedNode.values().toArray()[0] === id ? `border-solid border-blue-800 border-2` : ''} `}>

            <MUIButton className="w-full h-full" size={size} variant={variant} color={'primary'} style={{
                color,
                padding,
                margin,
                width,
                height,
                background,
                fontSize,
                fontFamily,
                fontWeight,
                fontStyle,
                textDecorationLine,
                display: 'flex',
                justifyContent: textAlign,
                lineHeight,
                letterSpacing
            }}>
                {text}
            </MUIButton>
        </div>
    )
}



const ButtonSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));
    const handleTextDecoration = (value: string[]) => {
        console.log(value);
        setProp((props: any) => props.textArray = value)
        if (value.includes('bold')) {
            setProp((props: any) => props.fontWeight = 'bold')
        } else {
            setProp((props: any) => props.fontWeight = 'normal')
        }
        if (value.includes('underline')) {
            setProp((props: any) => props.textDecorationLine = 'underline')
        } else {
            setProp((props: any) => props.textDecorationLine = 'none')
        }
        if (value.includes('italic')) {
            setProp((props: any) => props.fontStyle = 'italic')
        } else {
            setProp((props: any) => props.fontStyle = 'normal')
        }
    }
    const [fontSize, setFontSize] = useState<string>(props.fontSize.toString())
    const fontSizeInputRef = useRef<HTMLInputElement>(null);
    return (
        <div>
            <div>
                <Caption className='font-bold text-slate-300  mb-2'>Layout</Caption>
                <div className='flex w-full flex-col gap-2'>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Width</Caption>
                        <Input className='w-1/3 text-xs' endDecorator={'px'} value={props.width === 'auto' ? 0 : props.width} onChange={(e) => setProp((props: any) => {
                            if (!e.target.value.length) {
                                props.width = 'auto'
                            } else {
                                props.width = parseInt(e.target.value)
                            }
                        })} />

                    </div>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Height</Caption>
                        <Input className='w-1/3 text-xs' endDecorator={'px'} value={props.height === 'auto' ? 0 : props.height} onChange={(e) => setProp((props: any) => {
                            if (!e.target.value.length) {
                                props.height = 'auto'
                            } else {
                                props.height = parseInt(e.target.value)
                            }
                        })} />

                    </div>
                    <div className='w-full flex flex-col gap-2 justify-end items-end'>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Margin</Caption>
                            <div className='w-1/2 flex justify-end gap-1'>
                                <Input className='w-4/6 text-xs' value={props.margin === 'auto' ? 0 : props.margin} onChange={(e) => setProp((props: any) => {

                                    if (!e.target.value.length) {
                                        props.margin = 'auto'
                                    } else {
                                        props.margin = parseInt(e.target.value)
                                    }
                                })

                                } endDecorator={'px'} />
                                <IconButton variant='outlined'>
                                    <TbBoxMargin />
                                </IconButton>
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Padding</Caption>
                            <div className='w-1/2 flex justify-end gap-1'>
                                <Input className='w-4/6 text-xs' value={props.padding === 'auto' ? 0 : props.padding} onChange={(e) => setProp((props: any) => {
                                    if (!e.target.value.length) {
                                        props.padding = 'auto'
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
                            <Caption>Color</Caption>
                            <div className='w-4/6 py-[1px]'>
                                <Popover.Root>
                                    <Popover.Trigger asChild>
                                        <MUIButton variant='outlined' sx={{
                                            color: "black",
                                            borderColor: "black",
                                            backgroundColor: "white",
                                            display: 'flex',
                                        }} className='w-full gap-2'><div className={`w-5 h-5 border-black border border-solid`} style={{
                                            backgroundColor: props.background
                                        }}></div>{props.background}</MUIButton>
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
                <Caption className='font-bold text-slate-300 mt-5 mb-2'>Typography</Caption>
                <div className='flex w-full flex-col gap-2'>
                    <div className='w-full justify-between items-center flex'>
                        <Caption>Font</Caption>
                        {/* <Select placeholder="Choose one…" className='w-4/6'>
                                    <Option value={"another"}>...</Option>
                                </Select> */}
                        <FontPicker
                            className={
                                `fontpicker 
                                     relative
                                     outline-0 w-4/6 h-7 rounded
                                     focus-within:ring-1 ring-inset ring-macaron-active `
                            }
                            autoLoad
                            defaultValue={props.fontFamily}
                            value={(font2: string) => setProp((props: any) => props.fontFamily = font2)}
                        />
                    </div>
                    <div className='w-full justify-end items-center flex'>
                        <Select placeholder="Choose one…" className='w-4/6'>
                            <Option value={"another"}>...</Option>
                        </Select>
                    </div>
                    <div className='w-full flex flex-col gap-2 justify-end items-end'>
                        <div className='flex w-4/6 items-end justify-between gap-1'>
                            <div className='w-1/2'>
                                <Input type="number" slotProps={{
                                    input: {
                                        step: 1
                                    }
                                }} ref={fontSizeInputRef} startDecorator={<ALargeSmall size={12} />} className='text-xs' value={fontSize} onKeyDown={(e) => {
                                    if (e.key === "Enter" && fontSizeInputRef.current) {
                                        setProp((props: any) => props.fontSize = parseInt(fontSize))
                                        fontSizeInputRef.current.blur(); // Remove focus when Enter is pressed

                                    }
                                    if (e.key === "Enter") {
                                    }
                                }} onChange={(e) => {
                                    setFontSize(e.target.value)
                                }} onBlur={(e) => {
                                    setProp((props: any) => props.fontSize = parseInt(fontSize))
                                }} />
                            </div>
                            <div className='w-1/2 border border-slate-300 rounded-lg py-[1px]'>
                                <ToggleGroup.Root defaultValue={props.textArray} onValueChange={handleTextDecoration} size='sm' variant='soft' type="multiple">
                                    <ToggleGroup.Item defaultChecked={props.fontWeight === 'bold'} value="bold">
                                        <ToggleGroup.Icon size='xs'>
                                            <Bold />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                    <ToggleGroup.Item defaultChecked={props.fontStyle === 'italic'} value="italic">
                                        <ToggleGroup.Icon size='xs'>
                                            <Italic />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                    <ToggleGroup.Item defaultChecked={props.textDecorationLine === 'underline'} value="underline">
                                        <ToggleGroup.Icon size='xs'>
                                            <Underline />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                </ToggleGroup.Root>
                            </div>
                        </div>
                        <div className='flex w-4/6 items-end justify-between gap-1'>
                            <div className='w-1/2'>
                                <Input value={props.lineHeight} onChange={(e) => {
                                    setProp((props: any) => props.lineHeight = parseFloat(e.target.value))
                                }} type="number" slotProps={{
                                    input: {
                                        step: 0.1
                                    }
                                }} startDecorator={<TbLineHeight />} className='text-xs' />
                            </div>
                            <div className='w-1/2'>
                                <Input value={props.letterSpacing} onChange={(e) => {
                                    setProp((props: any) => props.letterSpacing = parseFloat(e.target.value))
                                }} type="number" slotProps={{
                                    input: {
                                        step: 0.1
                                    }
                                }} startDecorator={<TbLetterSpacing />} className='text-xs' />
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Align</Caption>
                            <div className='w-4/6 border border-slate-300 rounded-lg py-[1px]'>
                                <ToggleGroup.Root defaultValue={props.textAlign} onValueChange={(value: string) => {
                                    setProp((props: any) => props.textAlign = value)
                                }} size='sm' variant='soft' type="single" className='w-full flex justify-evenly'>
                                    <ToggleGroup.Item value="flex-start" className='w-1/3'>
                                        <ToggleGroup.Icon size='xs'>
                                            <AlignLeft />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                    <ToggleGroup.Item value="center" className='w-1/3'>
                                        <ToggleGroup.Icon size='xs'>
                                            <AlignCenter />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                    <ToggleGroup.Item value="flex-end" className='w-1/3'>
                                        <ToggleGroup.Icon size='xs'>
                                            <AlignRight />
                                        </ToggleGroup.Icon>
                                    </ToggleGroup.Item>
                                </ToggleGroup.Root>
                            </div>
                        </div>
                        <div className='w-full justify-between items-center flex'>
                            <Caption>Color</Caption>
                            <div className='w-4/6 py-[1px]'>
                                <Popover.Root>
                                    <Popover.Trigger asChild>
                                        <MUIButton variant='outlined' sx={{
                                            color: "black",
                                            borderColor: "black",
                                            backgroundColor: "white",
                                            display: 'flex',
                                        }} className='w-full gap-2'><div className={`w-5 h-5`} style={{
                                            backgroundColor: props.fontColor
                                        }}></div>{props.fontColor}</MUIButton>
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content mixed className="max-w-xs">
                                            <SketchPicker color={props.color || '#000000'} onChangeComplete={(color: any, event: any) => {
                                                setProp((props: any) => props.color = color.hex)
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
            {/* <div>
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
            </div> */}
        </div>
    )
}

EditableButton.craft = {
    related: {
        settings: ButtonSettings
    },
    props: {
        width: 'auto',
        height: 'auto',
        margin: 'auto',
        padding: 'auto',
        text: 'Insert text...',
        color: '#ffffff',
        background: '#45c9ea',
        fontSize: 16,
        fontWeight: 'normal',
        fontColor: '#000000',
        fontStyle: 'none',
        fontFamily: "Open Sans",
        textDecorationLine: 'none',
        textAlign: 'center',
        lineHeight: 1.5,
        letterSpacing: 0
    }
}
