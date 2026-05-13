import { Fields } from "@puckeditor/core"
import { VideoComponent } from "../types"
import { LocateFixed, Square } from "lucide-react"
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BorderAllIcon, BorderBottomIcon, BorderLeftIcon, BorderRightIcon, BorderTopIcon, CornerBottomLeftIcon, CornerBottomRightIcon, CornersIcon, CornerTopLeftIcon, CornerTopRightIcon } from "@radix-ui/react-icons"
import { NumInput, SegToggle, ColorPicker, StrSelect } from "../fieldPrimitives"

const expandOpts = [{ label: 'All', value: 'false' }, { label: 'Various', value: 'true' }]
const posOpts = [{ label: 'Relative', value: 'relative' }, { label: 'Absolute', value: 'absolute' }]

export const videoResolvedFields: (data: any, params: any) => {} = (data, params) => {
    let fields: Fields<VideoComponent, {}> = {
        objectFit: { visible: false, type: 'text' },
        aspectRatio: { visible: false, type: 'text' },
        mobileVisibility: { visible: false, type: 'text' },
        url: {
            type: 'custom',
            label: 'URL',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <input className="col-span-3 h-6 border border-input rounded-md px-2 text-xs bg-background" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
                </div>
            )
        },
        loop: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">Loop Video</span>
                </label>
            )
        },
        controls: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">Show Controls</span>
                </label>
            )
        },
        autoPlay: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">Automatically Play</span>
                </label>
            )
        },
        speed: {
            type: 'custom',
            label: 'Speed',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <NumInput value={value} onChange={onChange} />
                </div>
            )
        },
        width: {
            type: 'custom',
            label: 'Width',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <NumInput value={value} onChange={onChange} />
                </div>
            )
        },
        height: {
            type: 'custom',
            label: 'Height',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <NumInput value={value} onChange={onChange} />
                </div>
            )
        },
        borderExpanded: {
            type: 'custom',
            label: 'Border',
            labelIcon: <Square size={16} className="mr-1" />,
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <SegToggle value={value} onChange={onChange} options={expandOpts} />
                </div>
            )
        },
        borderWidth: {
            label: undefined,
            type: 'custom',
            render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<BorderAllIcon />} />,
        },
        borderTop: { visible: false, type: 'number' },
        borderBottom: { visible: false, type: 'number' },
        borderLeft: { visible: false, type: 'number' },
        borderRight: { visible: false, type: 'number' },
        borderColor: {
            type: 'custom',
            label: undefined,
            render: ({ onChange, value }) => <ColorPicker value={value} onChange={onChange} />,
        },
        borderType: {
            type: 'custom',
            label: undefined,
            render: ({ onChange, value }) => <StrSelect value={value} onChange={onChange} options={['solid', 'dashed', 'dotted']} />,
        },
        borderRadiusExpanded: {
            type: 'custom',
            label: 'Radius',
            labelIcon: <Square size={16} className="mr-1" />,
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <SegToggle value={value} onChange={onChange} options={expandOpts} />
                </div>
            )
        },
        borderRadius: {
            label: undefined,
            type: 'custom',
            render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<CornersIcon />} />,
        },
        borderRadiusTopLeft: { visible: false, type: 'number' },
        borderRadiusTopRight: { visible: false, type: 'number' },
        borderRadiusBottomLeft: { visible: false, type: 'number' },
        borderRadiusBottomRight: { visible: false, type: 'number' },
        positionType: {
            type: 'custom',
            label: 'Position',
            labelIcon: <LocateFixed size={16} className="mr-1" />,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <SegToggle value={value} onChange={onChange} options={posOpts} />
                </div>
            )
        },
        top: { type: 'number', visible: false },
        bottom: { type: 'number', visible: false },
        left: { type: 'number', visible: false },
        right: { type: 'number', visible: false },
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
    if (data.props.positionType === 'absolute') {
        fields.top = { type: 'custom', label: 'Top', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> }
        fields.bottom = { type: 'custom', label: 'Bottom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> }
        fields.left = { type: 'custom', label: 'Left', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> }
        fields.right = { type: 'custom', label: 'Right', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> }
    }
    return fields
}
