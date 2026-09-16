import { Type } from "lucide-react";
import { MOBILE_WIDTH_OPTIONS } from "@/features/editor/lib/responsive";
import {
    FontBoldIcon, FontItalicIcon,
    FontSizeIcon,
    TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon,
    UnderlineIcon,
} from "@radix-ui/react-icons";
import { ButtonContainer } from "../types";
import { Fields } from "@puckeditor/core";
import { FONT_WEIGHT_OPTIONS, KVSelect, NumInput, ColorPicker } from "../fieldPrimitives";
import { BorderField, MarginField, OpacityField, PaddingField, PositionField, RadiusField } from "../compoundFields";
import { EditorConxtextProps, useEditorContext } from "@/app/utils/context/EditorContext";
import { GoogleFont, loadGoogleFont } from "useGoogleFonts";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionsField } from "../customizableText/fields";

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

const StyleToggle = ({ value, onChange }: { value: string[], onChange: (v: string[]) => void }) => {
    const current: string[] = Array.isArray(value) ? value : []
    const toggle = (v: string) => {
        const next = current.includes(v) ? current.filter(s => s !== v) : [...current, v]
        onChange(next)
    }
    return (
        <div className="flex gap-0.5 w-full p-0.5 rounded-[4px]" style={{ background: '#EEEBE4' }}>
            {([
                { v: 'bold', icon: <FontBoldIcon /> },
                { v: 'italic', icon: <FontItalicIcon /> },
                { v: 'underline', icon: <UnderlineIcon /> },
            ] as const).map(({ v, icon }) => (
                <button
                    key={v}
                    type="button"
                    onClick={() => toggle(v)}
                    className="flex-1 flex items-center justify-center rounded-[3px] text-[11px] transition-colors"
                    style={{ height: 22, background: current.includes(v) ? '#FC6161' : 'transparent', color: current.includes(v) ? '#fff' : '#A09790', border: 'none' }}
                >
                    {icon}
                </button>
            ))}
        </div>
    )
}

const AlignBtns = ({ value, onChange, options }: {
    value: string; onChange: (v: string) => void; options: { v: string; icon: React.ReactNode; title: string }[]
}) => (
    <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {options.map(({ v, icon, title }) => (
            <button
                key={v}
                type="button"
                onClick={() => onChange(v)}
                title={title}
                style={{
                    flex: 1, height: 26, borderRadius: 3, fontSize: 12,
                    background: value === v ? '#FC6161' : '#F4F1EC',
                    color: value === v ? '#fff' : '#A09790',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                {icon}
            </button>
        ))}
    </div>
)

import React from "react";

const sharedLayoutFields = (data: any): Partial<Fields<ButtonContainer, {}>> => ({
    paddingExpanded: {
        type: 'custom', label: 'Padding',
        render: ({ value, onChange }) => <PaddingField value={value ?? 'false'} onChange={onChange} />
    },
    padding: { visible: false, type: 'number' },
    paddingTop: { visible: false, type: 'number' },
    paddingBottom: { visible: false, type: 'number' },
    paddingLeft: { visible: false, type: 'number' },
    paddingRight: { visible: false, type: 'number' },
    marginExpanded: {
        type: 'custom', label: 'Margin',
        render: ({ value, onChange }) => <MarginField value={value ?? 'false'} onChange={onChange} />
    },
    margin: { visible: false, type: 'number' },
    marginTop: { visible: false, type: 'number' },
    marginBottom: { visible: false, type: 'number' },
    marginLeft: { visible: false, type: 'number' },
    marginRight: { visible: false, type: 'number' },
    backgroundColor: {
        type: 'custom', label: 'Color',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Color</span>
                <ColorPicker value={value} onChange={onChange} className="flex-1" />
            </div>
        )
    },
    borderExpanded: {
        type: 'custom', label: 'Border',
        render: ({ value, onChange }) => <BorderField value={value ?? 'false'} onChange={onChange} />
    },
    borderWidth: { visible: false, type: 'number' },
    borderTop: { visible: false, type: 'number' },
    borderBottom: { visible: false, type: 'number' },
    borderLeft: { visible: false, type: 'number' },
    borderRight: { visible: false, type: 'number' },
    borderColor: { visible: false, type: 'text' },
    borderType: { visible: false, type: 'text' },
    borderRadiusExpanded: {
        type: 'custom', label: 'Radius',
        render: ({ value, onChange }) => <RadiusField value={value ?? 'false'} onChange={onChange} />
    },
    borderRadius: { visible: false, type: 'number' },
    borderRadiusTopLeft: { visible: false, type: 'number' },
    borderRadiusTopRight: { visible: false, type: 'number' },
    borderRadiusBottomLeft: { visible: false, type: 'number' },
    borderRadiusBottomRight: { visible: false, type: 'number' },
    positionType: {
        type: 'custom', label: 'Positioning',
        render: ({ value, onChange }) => <PositionField value={value ?? 'relative'} onChange={onChange as (v: string) => void} />
    },
    top: { visible: false, type: 'number' },
    bottom: { visible: false, type: 'number' },
    left: { visible: false, type: 'number' },
    right: { visible: false, type: 'number' },
    // ── Typography ─────────────────────────────────────────────────────────────
    text: {
        type: 'custom', label: 'Text', labelIcon: <Type size={16} className="mr-1" />,
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Text</span>
                <input
                    style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        )
    },
    fontFamily: {
        type: 'custom', label: 'Font Family',
        render: ({ onChange, value, id }) => {
            const { editorState }: { editorState: EditorConxtextProps } = useEditorContext()
            useEffect(() => { if (value) loadGoogleFont(value) }, [value])
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>Font</span>
                    <div style={{ flex: 1 }}>
                        <input
                            list={`font-list-btn-${id}`}
                            style={{ width: '100%', height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                            value={value ?? ''}
                            onChange={(e) => { onChange(e.target.value); loadGoogleFont(e.target.value) }}
                        />
                        <datalist id={`font-list-btn-${id}`}>
                            {editorState.fonts?.map((font: GoogleFont) => (
                                <option key={font.family} value={font.family} />
                            ))}
                        </datalist>
                    </div>
                </div>
            )
        }
    },
    fontWeight: {
        type: 'custom', label: 'Font Weight',
        render: ({ onChange, value }) => (
            <KVSelect value={String(value ?? 400)} onChange={(v) => onChange(Number(v))} options={FONT_WEIGHT_OPTIONS} className="w-full" />
        ),
    },
    fontSize: {
        type: 'custom', label: 'Font Size',
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<FontSizeIcon />} step={0.1} allowNegative={false} />
    },
    style: {
        type: 'custom',
        render: ({ value, onChange }) => <StyleToggle value={value ?? []} onChange={onChange} />
    },
    // No longer panel-editable — render() still reads whatever's stored, so
    // each template's existing tracked-uppercase button style (letterSpacing
    // baked into the template data) is unaffected; new buttons get whatever
    // buttonProps' defaults already specify.
    lineHeight: { visible: false, type: 'number' },
    letterSpacing: { visible: false, type: 'number' },
    align: {
        type: 'custom', label: 'Align',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Align</span>
                <AlignBtns value={value} onChange={onChange} options={[
                    { v: 'start', icon: <TextAlignLeftIcon /> },
                    { v: 'center', icon: <TextAlignCenterIcon /> },
                    { v: 'end', icon: <TextAlignRightIcon /> },
                    { v: 'justify', icon: <TextAlignJustifyIcon /> },
                ]} />
            </div>
        )
    },
    color: {
        type: 'custom', label: 'Text Color',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Color</span>
                <ColorPicker value={value} onChange={onChange} className="flex-1" />
            </div>
        )
    },
})

export const buttonResolvedFields: (data: any) => {} = (data: any) => {
    const fields: Fields<ButtonContainer, {}> = {
        isLink: {
            type: 'custom',
            label: 'Hyperlink',
            render: ({ value, onChange, field }) => (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 13, height: 13 }} />
                    <span style={lbl}>{field.label}</span>
                </label>
            )
        },
        ...(data.props.isLink ? {
            linkType: {
                type: 'custom',
                label: 'Link Type',
                visible: true,
                render: ({ value, onChange, field }) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ ...lbl, minWidth: 40 }}>{field.label}</span>
                        <div style={{ flex: 1 }}>
                            <Select value={value} onValueChange={(v) => onChange(v)}>
                                <SelectTrigger className="h-[26px] text-[11px] !bg-[#F4F1EC] !border-0 !shadow-none rounded-[3px] !text-[#1A1818]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="external" className="text-[11px]">External</SelectItem>
                                    <SelectItem value="internal" className="text-[11px]">Internal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )
            },
            ...(data.props.linkType === 'external' ? {
                url: {
                    type: 'custom',
                    label: 'URL',
                    visible: true,
                    render: ({ onChange, value, field }) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ ...lbl, minWidth: 40 }}>{field.label}</span>
                            <input
                                style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                                placeholder="https://example.com"
                                value={value ?? ''}
                                onChange={(e) => onChange(e.target.value)}
                            />
                        </div>
                    )
                }
            } : {
                sections: {
                    type: 'custom',
                    label: 'Section',
                    visible: true,
                    render: ({ value, onChange, field }) => <SectionsField value={value} onChange={onChange} label={field.label!} />
                }
            }),
        } : {}),
        ...(sharedLayoutFields(data) as any),
        opacity: {
            type: 'custom',
            label: 'Opacity',
            render: ({ value, onChange }) => <OpacityField value={value ?? 100} onChange={onChange} />
        },
        mobileWidth: {
            type: 'custom',
            label: 'Width on mobile',
            render: ({ value, onChange }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ ...lbl, minWidth: 56 }}>Mobile W</span>
                    <select
                        value={value ?? 'full'}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                    >
                        {MOBILE_WIDTH_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            )
        },
    }

    return fields
}
