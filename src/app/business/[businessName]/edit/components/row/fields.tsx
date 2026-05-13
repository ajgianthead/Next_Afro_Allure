import { Fields } from "@puckeditor/core";
import { RowLayout } from "../types";
import { NumInput, StrSelect } from "../fieldPrimitives";
import { RowsIcon, RowSpacingIcon } from "@radix-ui/react-icons";
import { MOBILE_LAYOUT_OPTIONS } from "@/features/editor/lib/responsive";

export const resolvedRowData: ({ props }: any) => {} = async ({ props }) => {
    let newArr = [...props.rows]
    if (props.numberOfRows > props.rows.length) {
        newArr.push({ row: [] })
        return { props: { rows: newArr } }
    } else if (props.numberOfRows < props.rows.length) {
        newArr.pop()
        return { props: { rows: newArr } }
    }
    return props
}

export const rowLayoutFields: Fields<RowLayout, {}> = {
    gap: {
        type: 'custom',
        label: 'Spacing',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <NumInput value={value} onChange={onChange} icon={<RowSpacingIcon />} />
            </div>
        )
    },
    justifyItems: {
        label: 'Row Alignment',
        type: 'custom',
        render: ({ field, onChange, value }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'stretch']} className="col-span-2 col-start-3" />
            </div>
        )
    },
    numberOfRows: {
        type: 'custom',
        label: 'Rows',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <NumInput value={value} onChange={onChange} icon={<RowsIcon />} />
            </div>
        )
    },
    rows: {
        type: "array",
        visible: false,
        arrayFields: {
            row: { type: 'slot' }
        },
        defaultItemProps: { row: [] }
    },
    mobileLayout: {
        type: 'custom',
        label: 'On mobile, rows should:',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <select
                    value={value ?? 'stack'}
                    onChange={(e) => onChange(e.target.value)}
                    className="col-span-2 col-start-3 h-6 border border-input rounded-md px-2 text-xs bg-background"
                >
                    {MOBILE_LAYOUT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>
        )
    },
}
