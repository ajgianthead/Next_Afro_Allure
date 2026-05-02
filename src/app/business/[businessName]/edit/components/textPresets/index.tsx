'use client'

import { ComponentConfig, ComponentData, DefaultComponentProps, Fields, useGetPuck } from "@puckeditor/core"
import { Text } from "../types"
import { PaintBucket, Type } from "lucide-react"
import { GoogleFont, loadGoogleFont } from "useGoogleFonts"
import { EditorConxtextProps, useEditorContext } from "@/app/utils/context/EditorContext"
import { FontBoldIcon, FontFamilyIcon, FontItalicIcon, LetterSpacingIcon, LineHeightIcon, TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon, UnderlineIcon } from "@radix-ui/react-icons"
import { NumInput, StrSelect } from "../fieldPrimitives"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

export const resolveTemplateTextFields: (data: Omit<ComponentData<Text, string, Record<string, DefaultComponentProps>>, "type">) => Fields<Text, {}> | Promise<Fields<Text, {}>> = (data) => {
    let templateTextFields: Fields<Text, {}> = {
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
            render: ({ onChange, value, id }) => {
                const { editorState }: { editorState: EditorConxtextProps } = useEditorContext()
                useEffect(() => {
                    if (value) loadGoogleFont(value)
                }, [value])
                return (
                    <div className="grid grid-cols-4 items-center gap-1.5">
                        <p className="text-xs font-medium text-slate-400">Font</p>
                        <div className="col-span-3">
                            <input
                                list={`font-list-${id}`}
                                className="w-full h-6 border border-input rounded-md px-2 text-xs bg-background"
                                value={value ?? ''}
                                onChange={(e) => {
                                    onChange(e.target.value)
                                    loadGoogleFont(e.target.value)
                                }}
                            />
                            <datalist id={`font-list-${id}`}>
                                {editorState.fonts?.map((font: GoogleFont) => (
                                    <option key={font.family} value={font.family} />
                                ))}
                            </datalist>
                        </div>
                    </div>
                )
            }
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
        linkType: {
            type: 'custom',
            label: 'Link Type',
            visible: false,
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
        },
        url: {
            type: 'custom',
            label: 'URL',
            visible: false,
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
        },
        sections: {
            type: 'custom',
            label: 'Section',
            visible: false,
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

    return templateTextFields
}

const textStyle = (style: string[] | undefined, extra?: React.CSSProperties): React.CSSProperties => ({
    textDecoration: style?.includes('underline') ? 'underline' : 'none',
    fontStyle: style?.includes('italic') ? 'italic' : 'normal',
    fontWeight: style?.includes('bold') ? 'bold' : undefined,
    ...extra,
})

const DEFAULT_TEXT_PROPS = { color: '#000000', fontFamily: 'Roboto', letterSpacing: 1.2, lineHeight: 1.5, align: 'start', style: [], isLink: false, sections: '', url: '', linkType: 'external', textTransform: 'none' }

export const textPresetsComponents: { [key: string]: ComponentConfig<Text> } = {
    HeadingOne: {
        label: 'Heading 1',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Heading 1' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <h1 style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</h1>
        )
    },
    HeadingTwo: {
        label: 'Heading 2',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Heading 2' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <h2 style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</h2>
        )
    },
    HeadingThree: {
        label: 'Heading 3',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Heading 3' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <h3 style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</h3>
        )
    },
    HeadingFour: {
        label: 'Heading 4',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Heading 4' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <h4 style={{ color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</h4>
        )
    },
    TitleLarge: {
        label: 'Title Large',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Title Large' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <p style={{ fontSize: '1.25rem', color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    TitleMedium: {
        label: 'Title Medium',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Title Medium' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <p style={{ fontSize: '1rem', fontWeight: 600, color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    TitleSmall: {
        label: 'Title Small',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Title Small' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    BodyLarge: {
        label: 'Body Large',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Body Large' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <p style={{ fontSize: '1.125rem', color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    BodyMedium: {
        label: 'Body Medium',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Body Medium' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <p style={{ fontSize: '1rem', color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    BodySmall: {
        label: 'Body Small',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Body Small' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <p style={{ fontSize: '0.875rem', color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
    BodyExtraSmall: {
        label: 'Body Extra-Small',
        resolveFields: resolveTemplateTextFields,
        defaultProps: { ...DEFAULT_TEXT_PROPS, text: 'Body Extra-Small' },
        render: ({ text, color, fontFamily, letterSpacing, lineHeight, style, align, textTransform }: any) => (
            <p style={{ fontSize: '0.75rem', color, fontFamily, letterSpacing, lineHeight, textAlign: align, textTransform: textTransform !== 'none' ? textTransform : undefined, ...textStyle(style) }}>{text}</p>
        )
    },
}
