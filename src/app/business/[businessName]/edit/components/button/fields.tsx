import { Type } from "lucide-react";
import { MOBILE_WIDTH_OPTIONS } from "@/features/editor/lib/responsive";
import {
    ColumnSpacingIcon, DotIcon, FontBoldIcon, FontItalicIcon,
    FontSizeIcon, LetterSpacingIcon, LineHeightIcon, RowSpacingIcon,
    TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon,
    UnderlineIcon, ViewHorizontalIcon, ViewVerticalIcon,
} from "@radix-ui/react-icons";
import { ButtonContainer } from "../types";
import { Fields, useGetPuck } from "@puckeditor/core";
import { NumInput, SegToggle, ColorPicker, StrSelect } from "../fieldPrimitives";
import { BorderField, MarginField, PaddingField, PositionField, RadiusField } from "../compoundFields";
import { EditorConxtextProps, useEditorContext } from "@/app/utils/context/EditorContext";
import { GoogleFont, loadGoogleFont } from "useGoogleFonts";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

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
    value: string; onChange: (v: string) => void; options: { v: string; icon: React.ReactNode }[]
}) => (
    <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {options.map(({ v, icon }) => (
            <button
                key={v}
                type="button"
                onClick={() => onChange(v)}
                title={v}
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
    flexDirection: {
        type: 'custom',
        visible: true,
        label: 'Direction',
        render: ({ onChange, value }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p style={{ ...lbl, gridColumn: 'span 2' }}>Direction</p>
                <SegToggle value={value} onChange={onChange} className="col-span-2 col-start-3" options={[
                    { label: <div className="flex justify-center"><ViewHorizontalIcon className="my-0.5" /></div>, value: 'flex-col' },
                    { label: <div className="flex justify-center"><ViewVerticalIcon className="my-0.5 mr-0.5" /></div>, value: 'flex-row' },
                ]} />
            </div>
        )
    },
    gapX: { label: 'Gap X', visible: true, type: 'custom', render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<ColumnSpacingIcon />} /> },
    gapY: { label: 'Gap Y', visible: true, type: 'custom', render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<RowSpacingIcon />} /> },
    grow: {
        type: 'custom', label: 'Grow',
        render: ({ value, onChange }) => (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 13, height: 13 }} />
                <span style={lbl}>Grow</span>
            </label>
        )
    },
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
    responsive: {
        type: 'custom', label: undefined,
        render: ({ value, onChange }) => (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 13, height: 13 }} />
                <span style={lbl}>Responsive</span>
            </label>
        )
    },
    mainAxisLayout: {
        visible: true, type: 'custom', label: 'Main Axis',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Main</span>
                <AlignBtns value={value} onChange={onChange as (v: string) => void} options={[
                    { v: 'start', icon: '←' },
                    { v: 'center', icon: '⊙' },
                    { v: 'end', icon: '→' },
                    { v: 'space-between', icon: '↔' },
                    { v: 'space-evenly', icon: '≡' },
                    { v: 'space-around', icon: '∿' },
                ]} />
            </div>
        )
    },
    altAxisLayout: {
        visible: true, type: 'custom', label: 'Cross Axis',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Cross</span>
                <AlignBtns value={value} onChange={onChange as (v: string) => void} options={[
                    { v: 'start', icon: '↑' },
                    { v: 'center', icon: '⊙' },
                    { v: 'end', icon: '↓' },
                    { v: 'baseline', icon: '≡' },
                    { v: 'stretch', icon: '↕' },
                ]} />
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
        type: 'custom', label: 'Position',
        render: ({ value, onChange }) => <PositionField value={value ?? 'relative'} onChange={onChange as (v: string) => void} />
    },
    top: { visible: false, type: 'number' },
    bottom: { visible: false, type: 'number' },
    left: { visible: false, type: 'number' },
    right: { visible: false, type: 'number' },
    rotation: {
        type: 'custom', label: 'Rotation',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Rotation</span>
                <NumInput value={value} onChange={onChange} icon={<DotIcon />} className="flex-1" />
            </div>
        )
    },
    draggable: { type: 'number' },

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
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} step={100} icon={<FontBoldIcon />} />,
    },
    fontSize: {
        type: 'custom', label: 'Font Size',
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<FontSizeIcon />} step={0.1} />
    },
    style: {
        type: 'custom',
        render: ({ value, onChange }) => <StyleToggle value={value ?? []} onChange={onChange} />
    },
    lineHeight: {
        type: 'custom', label: 'Line Height',
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<LineHeightIcon />} step={0.1} />
    },
    letterSpacing: {
        type: 'custom', label: 'Letter Spacing',
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<LetterSpacingIcon />} step={0.1} />
    },
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
        action: {
            label: 'Action',
            type: 'custom',
            render: ({ value, onChange, field }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>{field.label}</span>
                    <StrSelect value={value} onChange={onChange} options={['REDIRECT']} className="flex-1" />
                </div>
            )
        },
        variant: {
            type: 'custom', label: 'Variant',
            render: ({ value, onChange, field }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>{field.label}</span>
                    <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'space-between', 'space-evenly', 'space-around']} className="flex-1" />
                </div>
            )
        },
        link: {
            visible: true, type: 'custom', label: 'Link',
            render: ({ value, onChange, field }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>{field.label}</span>
                    <input
                        style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )
        },
        ...(sharedLayoutFields(data) as any),
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
