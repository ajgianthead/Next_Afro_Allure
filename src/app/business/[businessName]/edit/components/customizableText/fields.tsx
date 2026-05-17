import { PaintBucket, Type } from "lucide-react"
import { ComponentData, DefaultComponentProps, Fields, useGetPuck } from "@puckeditor/core"
import { FontBoldIcon, FontItalicIcon, FontSizeIcon, LetterSpacingIcon, LineHeightIcon, TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon, UnderlineIcon } from "@radix-ui/react-icons"
import { RegularText } from "../types"
import { useEditorContext } from "@/app/utils/context/EditorContext"
import { NumInput, StrSelect } from "../fieldPrimitives"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FontSelector } from "../FontSelector"

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

const ColorField = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ ...lbl, minWidth: 40 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 26, borderRadius: 3, padding: '0 8px', background: '#F4F1EC', flex: 1, cursor: 'pointer' }}>
            <div className="relative shrink-0">
                <div style={{ width: 14, height: 14, borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)', backgroundColor: value }} />
                <input
                    type="color"
                    value={value ?? '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
            </div>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#A09790', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
        </div>
    </div>
)

const StyleToggle = ({ value, onChange }: { value: string[], onChange: (v: string[]) => void }) => {
    const current: string[] = Array.isArray(value) ? value : []
    const toggle = (v: string) => {
        const next = current.includes(v) ? current.filter(s => s !== v) : [...current, v]
        onChange(next)
    }
    return (
        <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 4, background: '#EEEBE4' }}>
            {([
                { v: 'bold', icon: <FontBoldIcon /> },
                { v: 'italic', icon: <FontItalicIcon /> },
                { v: 'underline', icon: <UnderlineIcon /> },
            ] as const).map(({ v, icon }) => (
                <button
                    key={v}
                    type="button"
                    onClick={() => toggle(v)}
                    style={{
                        flex: 1, height: 22, borderRadius: 3, fontSize: 12,
                        background: current.includes(v) ? '#FC6161' : 'transparent',
                        color: current.includes(v) ? '#fff' : '#A09790',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    {icon}
                </button>
            ))}
        </div>
    )
}

const AlignField = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ ...lbl, minWidth: 40 }}>Align</span>
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
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
    </div>
)

const SectionsField = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => {
    const { editorState } = useEditorContext()
    const getPuck = useGetPuck()
    const { appState } = getPuck()
    const sectionData = appState.data.content
        .filter(c => c.type === 'Section' && editorState.sections.has(c.props.id))
        .map(c => ({ value: c.props.sectionName, label: c.props.sectionName }))
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const, minWidth: 40 }}>{label}</span>
            <div style={{ flex: 1 }}>
                <Select value={value} onValueChange={(v) => onChange(v)}>
                    <SelectTrigger className="h-[26px] text-[11px] !bg-[#F4F1EC] !border-0 !shadow-none rounded-[3px] !text-[#1A1818]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {sectionData.map(s => (
                            <SelectItem key={s.value} value={s.value} className="text-[11px]">{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export let customizableTextFields: Partial<Fields<RegularText, {}>> = {
    text: {
        type: 'custom',
        label: 'Text',
        contentEditable: true,
        labelIcon: <Type size={16} className="mr-1" />,
        render: ({ onChange, value, field }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 40 }}>{field.label}</span>
                <input
                    style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        )
    },
    fontFamily: {
        type: 'custom',
        label: 'Font Family',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 40 }}>Font</span>
                <FontSelector value={value ?? ''} onChange={onChange} />
            </div>
        )
    },
    fontWeight: {
        type: 'custom',
        label: 'Font Weight',
        labelIcon: <Type size={16} className="mr-1" />,
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} step={100} icon={<FontBoldIcon />} />,
    },
    fontSize: {
        type: 'custom',
        label: 'Font Size (rem)',
        labelIcon: <FontSizeIcon />,
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} step={0.1} icon={<FontSizeIcon />} />,
    },
    style: {
        type: 'custom',
        render: ({ value, onChange }) => <StyleToggle value={value ?? []} onChange={onChange} />
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
        render: ({ onChange, value }) => <AlignField value={value} onChange={onChange} />
    },
    color: {
        type: 'custom',
        label: 'Color',
        labelIcon: <PaintBucket size={16} className="mr-1" />,
        render: ({ onChange, value, field }) => <ColorField value={value} onChange={onChange} label={field.label!} />
    },
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
    textTransform: {
        type: 'custom',
        label: 'Transform',
        render: ({ value, onChange, field }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                <StrSelect value={value ?? 'none'} onChange={onChange} options={['none', 'uppercase', 'lowercase', 'capitalize']} className="flex-1" />
            </div>
        )
    },
    maxWidth: {
        type: 'custom',
        label: 'Max Width (rem)',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>Max W (rem)</span>
                <NumInput value={value} onChange={onChange} step={0.5} className="flex-1" />
            </div>
        )
    },
}

export const resolveCustomizableTextFields: (data: Omit<ComponentData<RegularText, string, Record<string, DefaultComponentProps>>, "type">) => Fields<RegularText, {}> | Promise<Fields<RegularText, {}>> = (data) => {
    let fields = { ...customizableTextFields } as Fields<RegularText, {}>

    if (data.props.isLink) {
        fields.linkType = {
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
        }
        if (data.props.linkType === 'external') {
            fields.url = {
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
        } else {
            fields.sections = {
                type: 'custom',
                label: 'Section',
                visible: true,
                render: ({ value, onChange, field }) => <SectionsField value={value} onChange={onChange} label={field.label!} />
            }
        }
    }

    return fields
}
