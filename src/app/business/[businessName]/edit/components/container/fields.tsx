import { ArrowDown, ArrowLeft, ArrowRight, ArrowRightLeft, ArrowUp, ArrowUpDown, LocateFixed, Signpost, Square, SquareDashedBottom } from "lucide-react";
import type { Fields } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BorderAllIcon, BorderBottomIcon, BorderLeftIcon, BorderRightIcon, BorderTopIcon, ColumnSpacingIcon, CornerBottomLeftIcon, CornerBottomRightIcon, CornersIcon, CornerTopLeftIcon, CornerTopRightIcon, DotIcon, PaddingIcon, RowSpacingIcon, ViewHorizontalIcon, ViewVerticalIcon } from "@radix-ui/react-icons";
import { Container } from "../types";
import { NumInput, SegToggle, ColorPicker, StrSelect } from "../fieldPrimitives";
import { Input } from "@/components/ui/input";

const expandOpts = [{ label: 'All', value: 'false' }, { label: 'Various', value: 'true' }]
const posOpts = [{ label: 'Relative', value: 'relative' }, { label: 'Absolute', value: 'absolute' }]

export const defaultFields: Fields<Container, {}> = {
    content: { type: "slot" },
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
    gapX: {
        label: 'Gap X',
        visible: true,
        type: 'custom',
        render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<ColumnSpacingIcon />} />
    },
    gapY: {
        label: 'Gap Y',
        visible: true,
        type: 'custom',
        render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<RowSpacingIcon />} />
    },
    grow: {
        type: 'custom',
        label: 'Grow',
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
        type: 'custom',
        label: 'Padding',
        labelIcon: <SquareDashedBottom size={16} className="mr-1" />,
        render: ({ field, value, onChange }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <SegToggle value={value} onChange={onChange} options={expandOpts} />
            </div>
        )
    },
    padding: {
        type: 'custom',
        label: undefined,
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<PaddingIcon />} />,
    },
    paddingTop: { type: 'custom', label: 'Padding Top', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> },
    paddingBottom: { type: 'custom', label: 'Padding Bottom', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> },
    paddingRight: { type: 'custom', label: 'Padding Right', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> },
    paddingLeft: { type: 'custom', label: 'Padding Left', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> },
    marginExpanded: {
        type: 'custom',
        label: 'Margin',
        labelIcon: <Square size={16} className="mr-1" />,
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <SegToggle value={value} onChange={onChange} options={expandOpts} />
            </div>
        )
    },
    margin: {
        type: 'custom',
        label: undefined,
        render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<PaddingIcon />} />,
    },
    marginTop: { type: 'custom', label: 'Margin Top', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> },
    marginBottom: { type: 'custom', label: 'Margin Bottom', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> },
    marginRight: { type: 'custom', label: 'Margin Right', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> },
    marginLeft: { type: 'custom', label: 'Margin Left', visible: false, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> },
    backgroundColor: {
        type: 'custom',
        label: 'Color',
        render: ({ onChange, value, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <ColorPicker value={value} onChange={onChange} />
            </div>
        )
    },
    responsive: {
        type: 'custom',
        label: undefined,
        render: ({ value, onChange }) => (
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5" />
                <span className="text-xs text-muted-foreground">Responsive</span>
            </label>
        )
    },
    mainAxisLayout: {
        visible: true,
        type: 'custom',
        label: 'Main Axis Alignment',
        labelIcon: <ArrowRightLeft size={16} className="mr-1" />,
        render: ({ field, onChange, value }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'space-between', 'space-evenly', 'space-around']} className="col-span-2 col-start-3" />
            </div>
        )
    },
    altAxisLayout: {
        visible: true,
        label: 'Cross Axis Alignment',
        labelIcon: <ArrowUpDown size={16} className="mr-1" />,
        type: 'custom',
        render: ({ field, onChange, value }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'baseline', 'stretch']} className="col-span-2 col-start-3" />
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
    rotation: {
        type: 'custom',
        label: 'Rotation',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <NumInput value={value} onChange={onChange} icon={<DotIcon />} />
            </div>
        )
    },
    draggable: { type: 'number' },
    responsiveDirection: {
        type: 'custom',
        label: 'Responsive Dir',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['none', 'col-to-row', 'row-to-col']} className="col-span-2 col-start-3" />
            </div>
        )
    },
    hideBelow: {
        type: 'custom',
        label: 'Hide Below',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['none', 'sm', 'md', 'lg']} className="col-span-2 col-start-3" />
            </div>
        )
    },
    hideAbove: {
        type: 'custom',
        label: 'Hide Above',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['none', 'sm', 'md', 'lg']} className="col-span-2 col-start-3" />
            </div>
        )
    },
    overflow: {
        type: 'custom',
        label: 'Overflow',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['visible', 'hidden', 'scroll', 'auto']} className="col-span-2 col-start-3" />
            </div>
        )
    },
    aspectRatio: {
        type: 'custom',
        label: 'Aspect Ratio',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <Input className="col-span-2 h-6 text-xs" placeholder="e.g. 4/5, 16/9" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
            </div>
        )
    },
    minHeight: {
        type: 'custom',
        label: 'Min Height (rem)',
        render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} step={0.5} />
    },
    maxWidth: {
        type: 'custom',
        label: 'Max Width (rem)',
        render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} step={0.5} />
    },
    gridTemplateColumns: {
        visible: false,
        type: 'custom',
        label: 'Grid Columns',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <Input className="col-span-2 h-6 text-xs" placeholder="e.g. 1fr 1fr 1fr" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
            </div>
        )
    },
}

export const containerResolvedFields: (data: any) => {} = (data) => {
    const fields: Fields<Container, {}> = { ...defaultFields }

    // Position fields are always editable when resolveFields runs
    fields.top = { type: 'custom', label: 'Top', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> }
    fields.bottom = { type: 'custom', label: 'Bottom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> }
    fields.left = { type: 'custom', label: 'Left', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> }
    fields.right = { type: 'custom', label: 'Right', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> }

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
    if (data.props.flexDirection === 'grid') {
        fields.gridTemplateColumns = {
            type: 'custom',
            visible: true,
            label: 'Grid Columns',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                    <Input className="col-span-2 h-6 text-xs" placeholder="e.g. 1fr 1fr 1fr" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
                </div>
            )
        }
    }
    return fields
}
