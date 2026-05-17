'use client'

import { ComponentConfig, ComponentData, DefaultComponentProps, Fields, useGetPuck } from "@puckeditor/core"
import { Text } from "../types"
import { TEXT_SIZE_MAP, TEXT_SIZE_OPTIONS } from "@/features/editor/lib/responsive"
import { PaintBucket, Type } from "lucide-react"
import { useEditorContext } from "@/app/utils/context/EditorContext"
import { FontBoldIcon, FontItalicIcon, LetterSpacingIcon, LineHeightIcon, TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon, UnderlineIcon } from "@radix-ui/react-icons"
import { NumInput, StrSelect } from "../fieldPrimitives"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { FontSelector } from "../FontSelector"

export const resolveTemplateTextFields: (data: Omit<ComponentData<Text, string, Record<string, DefaultComponentProps>>, "type">) => Fields<Text, {}> | Promise<Fields<Text, {}>> = (data) => {
    let templateTextFields: Partial<Fields<Text, {}>> = {
        text: {
            type: 'custom',
            label: 'Text',
            contentEditable: true,
            labelIcon: <Type size={16} className="mr-1" />,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <Input
                        className="col-span-3 h-6 text-xs"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )
        },
        fontFamily: {
            type: 'custom',
            label: 'Font Family',
            render: ({ onChange, value }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">Font</p>
                    <FontSelector value={value ?? ''} onChange={onChange} />
                </div>
            )
        },
        style: {
            type: 'custom',
            render: ({ value, onChange }) => {
                const current: string[] = Array.isArray(value) ? value : []
                const toggle = (v: string) => {
                    const next = current.includes(v) ? current.filter(s => s !== v) : [...current, v]
                    onChange(next)
                }
                return (
                    <div className="flex gap-1 w-full">
                        {([
                            { v: 'bold', icon: <FontBoldIcon /> },
                            { v: 'italic', icon: <FontItalicIcon /> },
                            { v: 'underline', icon: <UnderlineIcon /> },
                        ] as const).map(({ v, icon }) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => toggle(v)}
                                className={cn(
                                    'flex-1 flex items-center justify-center py-1 rounded border text-sm transition-colors',
                                    current.includes(v)
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-input hover:bg-accent'
                                )}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                )
            }
        },
        lineHeight: {
            type: 'custom',
            label: 'Line Height',
            labelIcon: <LineHeightIcon />,
            render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} step={0.1} icon={<LineHeightIcon />} />,
        },
        letterSpacing: {
            type: 'custom',
            label: 'Letter Spacing',
            labelIcon: <LetterSpacingIcon />,
            render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} step={0.1} icon={<LetterSpacingIcon />} />,
        },
        align: {
            type: 'custom',
            label: 'Align',
            render: ({ onChange, value }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">Align</p>
                    <div className="col-span-3 flex gap-1">
                        {([
                            { v: 'start', icon: <TextAlignLeftIcon /> },
                            { v: 'center', icon: <TextAlignCenterIcon /> },
                            { v: 'end', icon: <TextAlignRightIcon /> },
                            { v: 'justify', icon: <TextAlignJustifyIcon /> },
                        ] as const).map(({ v, icon }) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => onChange(v)}
                                className={cn(
                                    'flex-1 flex items-center justify-center py-1 rounded border text-xs transition-colors',
                                    value === v
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-input hover:bg-accent'
                                )}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>
            )
        },
        color: {
            type: 'custom',
            label: 'Color',
            labelIcon: <PaintBucket size={16} className="mr-1" />,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <div className="col-span-3 flex items-center gap-2 border border-input rounded-md px-2 py-1 bg-background cursor-pointer">
                        <div className="relative shrink-0">
                            <div className="size-4 rounded-sm border shadow-sm" style={{ backgroundColor: value }} />
                            <input
                                type="color"
                                value={value ?? '#000000'}
                                onChange={(e) => onChange(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground truncate">{value}</span>
                    </div>
                </div>
            )
        },
        isLink: {
            type: 'custom',
            label: 'Hyperlink',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <label className="col-span-3 flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => onChange(e.target.checked)}
                            className="h-3.5 w-3.5"
                        />
                        <span className="text-xs text-muted-foreground">Enable link</span>
                    </label>
                </div>
            )
        },
        textTransform: {
            type: 'custom',
            label: 'Transform',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                    <StrSelect value={value ?? 'none'} onChange={onChange} options={['none', 'uppercase', 'lowercase', 'capitalize']} className="col-span-2 col-start-3" />
                </div>
            )
        },
        size: {
            type: 'custom',
            label: 'Text size',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                    <select
                        value={value ?? 'md'}
                        onChange={(e) => onChange(e.target.value)}
                        className="col-span-2 col-start-3 h-6 border border-input rounded-md px-2 text-xs bg-background"
                    >
                        {TEXT_SIZE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            )
        },
    }

    if (data.props.isLink) {
        templateTextFields.linkType = {
            type: 'custom',
            label: 'Link Type',
            visible: true,
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <div className="col-span-3">
                        <Select value={value} onValueChange={(v) => onChange(v)}>
                            <SelectTrigger className="h-6 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="external">External</SelectItem>
                                <SelectItem value="internal">Internal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )
        }
        if (data.props.linkType === 'external') {
            templateTextFields.url = {
                type: 'custom',
                label: 'URL',
                visible: true,
                render: ({ onChange, value, field }) => (
                    <div className="grid grid-cols-4 items-center gap-1.5">
                        <p className="text-xs font-medium text-slate-400">{field.label}</p>
                        <Input
                            className="col-span-3 h-6 text-xs"
                            placeholder="https://example.com"
                            value={value ?? ''}
                            onChange={(e) => onChange(e.target.value)}
                        />
                    </div>
                )
            }
        } else {
            templateTextFields.sections = {
                type: 'custom',
                label: 'Section',
                visible: true,
                render: ({ value, onChange, field }) => {
                    const { editorState } = useEditorContext()
                    const getPuck = useGetPuck()
                    const { appState } = getPuck()
                    const sectionData = appState.data.content
                        .filter(c => c.type === 'Section' && editorState.sections.has(c.props.id))
                        .map(c => ({ value: c.props.sectionName, label: c.props.sectionName }))
                    return (
                        <div className="grid grid-cols-4 items-center gap-1.5">
                            <p className="text-xs font-medium text-slate-400">{field.label}</p>
                            <div className="col-span-3">
                                <Select value={value} onValueChange={(v) => onChange(v)}>
                                    <SelectTrigger className="h-6 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionData.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )
                }
            }
        }
    }

    return templateTextFields as unknown as Fields<Text, {}>
}

const textStyle = (style: string[] | undefined, extra?: React.CSSProperties): React.CSSProperties => ({
    textDecoration: style?.includes('underline') ? 'underline' : 'none',
    fontStyle: style?.includes('italic') ? 'italic' : 'normal',
    fontWeight: style?.includes('bold') ? 'bold' : undefined,
    ...extra,
})

const DEFAULT_TEXT_PROPS = { color: '#000000', fontFamily: 'Roboto', letterSpacing: 1.2, lineHeight: 1.5, align: 'start', style: [], isLink: false, sections: '', url: '', linkType: 'external', textTransform: 'none', size: 'md' }

export const textPresetsComponents: { [key: string]: ComponentConfig<Text> } = {
    HeadingOne: {
        label: 'Heading 1',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Heading 1', size: 'xl' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <h1 className={TEXT_SIZE_MAP[size ?? 'xl']} style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</h1>
        )
    },
    HeadingTwo: {
        label: 'Heading 2',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Heading 2', size: 'lg' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <h2 className={TEXT_SIZE_MAP[size ?? 'lg']} style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</h2>
        )
    },
    HeadingThree: {
        label: 'Heading 3',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Heading 3', size: 'md' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <h3 className={TEXT_SIZE_MAP[size ?? 'md']} style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</h3>
        )
    },
    HeadingFour: {
        label: 'Heading 4',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Heading 4', size: 'sm' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <h4 className={TEXT_SIZE_MAP[size ?? 'sm']} style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</h4>
        )
    },
    TitleLarge: {
        label: 'Title Large',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Title Large', size: 'lg' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <p className={TEXT_SIZE_MAP[size ?? 'lg']} style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    TitleMedium: {
        label: 'Title Medium',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Title Medium', size: 'md' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <p className={TEXT_SIZE_MAP[size ?? 'md']} style={{ fontWeight: 600, color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    TitleSmall: {
        label: 'Title Small',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Title Small', size: 'sm' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <p className={TEXT_SIZE_MAP[size ?? 'sm']} style={{ fontWeight: 600, color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    BodyLarge: {
        label: 'Body Large',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Body Large', size: 'md' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <p className={TEXT_SIZE_MAP[size ?? 'md']} style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    BodyMedium: {
        label: 'Body Medium',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Body Medium', size: 'sm' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <p className={TEXT_SIZE_MAP[size ?? 'sm']} style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    BodySmall: {
        label: 'Body Small',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Body Small', size: 'sm' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <p className={TEXT_SIZE_MAP[size ?? 'sm']} style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    BodyExtraSmall: {
        label: 'Body Extra-Small',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Body Extra-Small', size: 'sm' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform, size }: any) => (
            <p className={TEXT_SIZE_MAP[size ?? 'sm']} style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
}
