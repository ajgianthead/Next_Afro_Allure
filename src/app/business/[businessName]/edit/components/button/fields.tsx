import { ArrowRightLeft, ArrowUpDown, LocateFixed, PaintBucket, Signpost, Square, SquareDashedBottom, Type } from "lucide-react";
import { MOBILE_WIDTH_OPTIONS } from "@/features/editor/lib/responsive";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BorderAllIcon, BorderBottomIcon, BorderLeftIcon, BorderRightIcon, BorderTopIcon, ColumnSpacingIcon, CornerBottomLeftIcon, CornerBottomRightIcon, CornersIcon, CornerTopLeftIcon, CornerTopRightIcon, DotIcon, FontBoldIcon, FontFamilyIcon, FontItalicIcon, FontSizeIcon, LetterSpacingIcon, LineHeightIcon, PaddingIcon, RowSpacingIcon, TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon, UnderlineIcon, ViewHorizontalIcon, ViewVerticalIcon } from "@radix-ui/react-icons";
import { ButtonContainer } from "../types";
import { Fields, useGetPuck } from "@puckeditor/core";
import { NumInput, SegToggle, ColorPicker, StrSelect } from "../fieldPrimitives";
import { EditorConxtextProps, useEditorContext } from "@/app/utils/context/EditorContext";
import { GoogleFont, loadGoogleFont } from "useGoogleFonts";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const expandOpts = [{ label: 'All', value: 'false' }, { label: 'Various', value: 'true' }]
const posOpts = [{ label: 'Relative', value: 'relative' }, { label: 'Absolute', value: 'absolute' }]

const StyleToggle = ({ value, onChange }: { value: string[], onChange: (v: string[]) => void }) => {
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
                <button key={v} type="button" onClick={() => toggle(v)}
                    className={cn('flex-1 flex items-center justify-center py-1 rounded border text-sm transition-colors',
                        current.includes(v) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent')}>
                    {icon}
                </button>
            ))}
        </div>
    )
}

const sharedLayoutFields = (data: any): Partial<Fields<ButtonContainer, {}>> => ({
    flexDirection: {
        type: 'custom',
        visible: true,
        label: 'Layout Direction',
        labelIcon: <Signpost size={16} className="mr-1" />,
        render: ({ onChange, value, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <SegToggle value={value} onChange={onChange} options={[
                    { label: <div className="flex justify-center"><ViewHorizontalIcon className="my-1" /></div>, value: 'flex-col' },
                    { label: <div className="flex justify-center"><ViewVerticalIcon className="my-1 mr-1" /></div>, value: 'flex-row' },
                ]} />
            </div>
        )
    },
    gapX: { label: 'Gap X', visible: true, type: 'custom', render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<ColumnSpacingIcon />} /> },
    gapY: { label: 'Gap Y', visible: true, type: 'custom', render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<RowSpacingIcon />} /> },
    grow: {
        type: 'custom', label: 'Grow',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <label className="col-span-3 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">Enabled</span>
                </label>
            </div>
        )
    },
    paddingExpanded: {
        type: 'custom', label: 'Padding', labelIcon: <SquareDashedBottom size={16} className="mr-1" />,
        render: ({ field, value, onChange }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <SegToggle value={value} onChange={onChange} options={expandOpts} />
            </div>
        )
    },
    padding: { type: 'custom', label: undefined, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<PaddingIcon />} /> },
    paddingTop: { type: 'custom', label: 'Padding Top', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> },
    paddingBottom: { type: 'custom', label: 'Padding Bottom', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> },
    paddingRight: { type: 'custom', label: 'Padding Right', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> },
    paddingLeft: { type: 'custom', label: 'Padding Left', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> },
    marginExpanded: {
        type: 'custom', label: 'Margin', labelIcon: <Square size={16} className="mr-1" />,
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <SegToggle value={value} onChange={onChange} options={expandOpts} />
            </div>
        )
    },
    margin: { type: 'custom', label: undefined, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<PaddingIcon />} /> },
    marginTop: { type: 'custom', label: 'Margin Top', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> },
    marginBottom: { type: 'custom', label: 'Margin Bottom', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> },
    marginRight: { type: 'custom', label: 'Margin Right', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> },
    marginLeft: { type: 'custom', label: 'Margin Left', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> },
    backgroundColor: {
        type: 'custom', label: 'Color',
        render: ({ onChange, value, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <ColorPicker value={value} onChange={onChange} />
            </div>
        )
    },
    responsive: {
        type: 'custom', label: undefined,
        render: ({ value, onChange }) => (
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5" />
                <span className="text-xs text-muted-foreground">Responsive</span>
            </label>
        )
    },
    mainAxisLayout: {
        visible: true, type: 'custom', label: 'Main Axis Alignment', labelIcon: <ArrowRightLeft size={16} className="mr-1" />,
        render: ({ field, onChange, value }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'space-between', 'space-evenly', 'space-around']} className="col-span-2 col-start-3" />
            </div>
        )
    },
    altAxisLayout: {
        visible: true, label: 'Cross Axis Alignment', labelIcon: <ArrowUpDown size={16} className="mr-1" />, type: 'custom',
        render: ({ field, onChange, value }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'baseline', 'stretch']} className="col-span-2 col-start-3" />
            </div>
        )
    },
    borderExpanded: {
        type: 'custom', label: 'Border', labelIcon: <Square size={16} className="mr-1" />,
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <SegToggle value={value} onChange={onChange} options={expandOpts} />
            </div>
        )
    },
    borderWidth: { label: undefined, type: 'custom', render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<BorderAllIcon />} /> },
    borderTop: { visible: false, type: 'number' },
    borderBottom: { visible: false, type: 'number' },
    borderLeft: { visible: false, type: 'number' },
    borderRight: { visible: false, type: 'number' },
    borderColor: { type: 'custom', label: undefined, render: ({ onChange, value }) => <ColorPicker value={value} onChange={onChange} /> },
    borderType: { type: 'custom', label: undefined, render: ({ onChange, value }) => <StrSelect value={value} onChange={onChange} options={['solid', 'dashed', 'dotted']} /> },
    borderRadiusExpanded: {
        type: 'custom', label: 'Radius', labelIcon: <Square size={16} className="mr-1" />,
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <SegToggle value={value} onChange={onChange} options={expandOpts} />
            </div>
        )
    },
    borderRadius: { label: undefined, type: 'custom', render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<CornersIcon />} /> },
    borderRadiusTopLeft: { visible: false, type: 'number' },
    borderRadiusTopRight: { visible: false, type: 'number' },
    borderRadiusBottomLeft: { visible: false, type: 'number' },
    borderRadiusBottomRight: { visible: false, type: 'number' },
    positionType: {
        type: 'custom', label: 'Position', labelIcon: <LocateFixed size={16} className="mr-1" />,
        render: ({ onChange, value, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <SegToggle value={value} onChange={onChange} options={posOpts} />
            </div>
        )
    },
    top: { type: 'custom', label: 'Top', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> },
    bottom: { type: 'custom', label: 'Bottom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> },
    left: { type: 'custom', label: 'Left', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> },
    right: { type: 'custom', label: 'Right', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> },
    rotation: {
        type: 'custom', label: 'Rotation',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <NumInput value={value} onChange={onChange} icon={<DotIcon />} />
            </div>
        )
    },
    draggable: { type: 'number' },
    text: {
        type: 'custom', label: 'Text', labelIcon: <Type size={16} className="mr-1" />,
        render: ({ onChange, value, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <input className="col-span-3 h-6 border border-input rounded-md px-2 text-xs bg-background" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
            </div>
        )
    },
    fontFamily: {
        type: 'custom', label: 'Font Family', labelIcon: <FontFamilyIcon />,
        render: ({ onChange, value, id }) => {
            const { editorState }: { editorState: EditorConxtextProps } = useEditorContext()
            useEffect(() => { if (value) loadGoogleFont(value) }, [value])
            return (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">Font</p>
                    <div className="col-span-3">
                        <input
                            list={`font-list-btn-${id}`}
                            className="w-full h-6 border border-input rounded-md px-2 text-xs bg-background"
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
        type: 'custom', label: 'Font Weight', labelIcon: <Type size={16} className="mr-1" />,
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} step={100} icon={<FontBoldIcon />} />,
    },
    fontSize: {
        type: 'custom', label: 'Font Size (rem)', labelIcon: <FontSizeIcon />,
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<FontSizeIcon />} step={0.1} />
    },
    style: {
        type: 'custom',
        render: ({ value, onChange }) => <StyleToggle value={value ?? []} onChange={onChange} />
    },
    lineHeight: {
        type: 'custom', label: 'Line Height', labelIcon: <LineHeightIcon />,
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<LineHeightIcon />} step={0.1} />
    },
    letterSpacing: {
        type: 'custom', label: 'Letter Spacing', labelIcon: <LetterSpacingIcon />,
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<LetterSpacingIcon />} step={0.1} />
    },
    align: {
        type: 'custom', label: 'Align', labelIcon: <Type size={16} className="mr-1" />,
        render: ({ onChange, value, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <SegToggle value={value} onChange={onChange} options={[
                    { label: <TextAlignLeftIcon />, value: 'start' },
                    { label: <TextAlignCenterIcon />, value: 'center' },
                    { label: <TextAlignRightIcon />, value: 'end' },
                    { label: <TextAlignJustifyIcon />, value: 'justify' },
                ]} />
            </div>
        )
    },
    color: {
        type: 'custom', label: 'Text Color', labelIcon: <PaintBucket size={16} className="mr-1" />,
        render: ({ onChange, value, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <ColorPicker value={value} onChange={onChange} />
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
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <StrSelect value={value} onChange={onChange} options={['REDIRECT']} className="w-full" />
                </div>
            )
        },
        variant: {
            type: 'custom', label: 'Variant',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'space-between', 'space-evenly', 'space-around']} className="w-full" />
                </div>
            )
        },
        link: {
            visible: true, type: 'custom', label: 'Link',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <input className="col-span-3 col-start-2 h-6 border border-input rounded-md px-2 text-xs bg-background" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
                </div>
            )
        },
        ...(sharedLayoutFields(data) as any),
        mobileWidth: {
            type: 'custom',
            label: 'Width on mobile',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                    <select
                        value={value ?? 'full'}
                        onChange={(e) => onChange(e.target.value)}
                        className="col-span-2 col-start-3 h-6 border border-input rounded-md px-2 text-xs bg-background"
                    >
                        {MOBILE_WIDTH_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            )
        },
    }

    if (data.props.borderExpanded === 'true') {
        fields.borderWidth = { visible: false, type: 'text' }
        fields.borderTop = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<BorderTopIcon />} className="w-full" /> }
        fields.borderBottom = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<BorderBottomIcon />} className="w-full" /> }
        fields.borderLeft = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<BorderLeftIcon />} className="w-full" /> }
        fields.borderRight = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<BorderRightIcon />} className="w-full" /> }
    }
    if (data.props.borderRadiusExpanded === 'true') {
        fields.borderRadius = { visible: false, type: 'text' }
        fields.borderRadiusTopLeft = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<CornerTopLeftIcon />} className="w-full" /> }
        fields.borderRadiusBottomLeft = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<CornerBottomLeftIcon />} className="w-full" /> }
        fields.borderRadiusBottomRight = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<CornerBottomRightIcon />} className="w-full" /> }
        fields.borderRadiusTopRight = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<CornerTopRightIcon />} className="w-full" /> }
    }
    if (data.props.paddingExpanded === 'true') {
        fields.padding = { type: 'custom', label: 'Padding', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<PaddingIcon />} className="w-full" /> }
        fields.paddingTop = { type: 'custom', label: 'Top', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> }
        fields.paddingBottom = { type: 'custom', label: 'Bottom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> }
        fields.paddingLeft = { type: 'custom', label: 'Left', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> }
        fields.paddingRight = { type: 'custom', label: 'Right', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> }
    }
    if (data.props.marginExpanded === 'true') {
        fields.margin = { type: 'custom', label: 'Margin', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<PaddingIcon />} className="w-full" /> }
        fields.marginTop = { type: 'custom', label: 'Top', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> }
        fields.marginBottom = { type: 'custom', label: 'Bottom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> }
        fields.marginLeft = { type: 'custom', label: 'Left', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> }
        fields.marginRight = { type: 'custom', label: 'Right', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> }
    }
    return fields
}
