'use client'
import { Text as AAText, Caption } from "@tailus-ui/typography";
import React, { useEffect, useRef, useState } from "react";
import { Node, useNode, UserComponent } from "@craftjs/core";
import ContentEditable from 'react-contenteditable'
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import { ALargeSmall, AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import ToggleGroup from "@components/ToggleGroup";
import { TbBoxMargin, TbBoxPadding, TbLetterSpacing, TbLineHeight } from "react-icons/tb";
import Popover from "@tailus-ui/Popover";
import Button from "@mui/joy/Button";
import { Color, SketchPicker, SketchPickerProps } from 'react-color';
import FontPicker from 'react-fontpicker-ts'
import 'react-fontpicker-ts/dist/index.css'
import IconButton from "@mui/joy/IconButton";


const EditableText: UserComponent = ({ text, fontFamily = 'Open Sans', textAlign = 'left', fontSize = 16, fontWeight = 'normal', fontStyle = 'none', textDecorationLine = 'underline', fontColor = '#111827', className, textArray = [], lineHeight = 1.5, letterSpacing = 0, margin = 'auto', padding = 'auto' }: any) => {

    const { connectors: { connect, drag }, hasSelectedNode, hasDraggedNode, isHovering, actions: { setProp } } = useNode((state: any) => ({
        hasSelectedNode: state.events.selected,
        hasDraggedNode: state.events.dragged,
        isHovering: state.events.hovered
    }));


    const [activeEdit, setActiveEdit] = useState<boolean>(false);
    useEffect(() => { !hasSelectedNode && setActiveEdit(false) }, [hasSelectedNode]);


    return (
        <div ref={(ref: any) => connect(drag(ref))} onClick={(e: any) => setActiveEdit(true)} style={{
            width: 'auto',
            height: 'auto',
            maxHeight: 'min-content'
        }}>
            <Text margin={margin} padding={padding} hasSelectedNode={hasSelectedNode} isHovering={isHovering} className={className} fontFamily={fontFamily} textAlign={textAlign} activeEdit={activeEdit} fontStyle={fontStyle} textDecorationLine={textDecorationLine} setActiveEdit={setActiveEdit} isEditable={true} text={text} setProp={setProp} fontSize={fontSize} fontColor={fontColor} fontWeight={fontWeight} lineHeight={lineHeight} letterSpacing={letterSpacing} />
        </div>


    )
}
const Text = (props: any) => {
    return (
        <div>
            {props.isEditable ? <div>
                <ContentEditable
                    html={props.text}
                    onChange={e =>
                        props.setProp((props: any) =>
                            props.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, "")
                        )
                    }
                    disabled={!props.activeEdit}
                    tagName="p"
                    className={`${props.className} hover:border-blue-800 ${!props.hasSelectedNode ? 'border-transparent' : ''} border  ${props.hasSelectedNode ? 'border-solid border-blue-800' : ''} ${props.isHovering && !props.hasSelectedNode ? 'border-dashed' : ""}`} style={{ fontSize: props.fontSize, color: props.fontColor, textDecorationLine: props.textDecorationLine, fontStyle: props.fontStyle, fontWeight: props.fontWeight, letterSpacing: props.letterSpacing, lineHeight: props.lineHeight, textAlign: props.textAlign, fontFamily: props.fontFamily, margin: props.margin, padding: props.padding }}
                />
            </div> : <AAText className={`${props.className}`} style={{ fontSize: props.fontSize, color: props.fontColor }}>{props.text}</AAText>}
        </div>

    )
}

export const TextSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));
    // useEffect(() => {
    //     if(props)
    // }, []);
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
            <Caption className='font-bold text-slate-300 mt-5'>Layout</Caption>
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
            <Caption className='font-bold text-slate-300 mt-5'>Typography</Caption>
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
                                <ToggleGroup.Item value="left" className='w-1/3'>
                                    <ToggleGroup.Icon size='xs'>
                                        <AlignLeft />
                                    </ToggleGroup.Icon>
                                </ToggleGroup.Item>
                                <ToggleGroup.Item value="center" className='w-1/3'>
                                    <ToggleGroup.Icon size='xs'>
                                        <AlignCenter />
                                    </ToggleGroup.Icon>
                                </ToggleGroup.Item>
                                <ToggleGroup.Item value="right" className='w-1/3'>
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
                                    <Button variant='outlined' sx={{
                                        color: "black",
                                        borderColor: "black",
                                        backgroundColor: "white",
                                        display: 'flex',
                                    }} className='w-full gap-2'><div className={`w-5 h-5`} style={{
                                        backgroundColor: props.fontColor
                                    }}></div>{props.fontColor}</Button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content mixed className="max-w-xs">
                                        <SketchPicker color={props.fontColor || '#000000'} onChangeComplete={(color: any, event: any) => {
                                            setProp((props: any) => props.fontColor = color.hex)
                                        }} />                                                            <Popover.Close asChild>
                                            {/* <IconButton size='sm' variant='plain'>
                                                                    <X />
                                                                </IconButton> */}
                                        </Popover.Close>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

EditableText.craft = {
    displayName: 'EditableText',
    related: {
        settings: TextSettings
    },
    props: {
        text: "Type here...",
        fontSize: 16,
        fontWeight: 'normal',
        fontColor: '#000000',
        fontStyle: 'none',
        fontFamily: "Open Sans",
        textDecorationLine: 'none',
        lineHeight: 1.5,
        letterSpacing: 0,
        textAlign: 'left',
        margin: 'auto',
        padding: 'auto',
    }
}

export { Text, EditableText };
