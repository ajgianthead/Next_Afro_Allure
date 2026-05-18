import { Fields } from "@puckeditor/core";
import { RowLayout } from "../types";
import { NumInput, KVSelect } from "../fieldPrimitives";
import { RowsIcon, RowSpacingIcon } from "@radix-ui/react-icons";
import { MOBILE_LAYOUT_OPTIONS } from "@/features/editor/lib/responsive";

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

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
        render: ({ value, onChange }) => (
            <NumInput value={value} onChange={onChange} icon={<RowSpacingIcon />} />
        )
    },
    justifyItems: {
        label: 'Alignment',
        type: 'custom',
        render: ({ field, onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                <KVSelect value={value} onChange={onChange} options={[
                    { label: 'Start', value: 'start' },
                    { label: 'End', value: 'end' },
                    { label: 'Center', value: 'center' },
                    { label: 'Stretch', value: 'stretch' },
                ]} className="flex-1" />
            </div>
        )
    },
    numberOfRows: {
        type: 'custom',
        label: 'Rows',
        render: ({ value, onChange }) => (
            <NumInput value={value} onChange={onChange} icon={<RowsIcon />} />
        )
    },
    rows: {
        type: "array",
        visible: false,
        arrayFields: { row: { type: 'slot' } },
        defaultItemProps: { row: [] }
    },
    mobileLayout: {
        type: 'custom',
        label: 'Mobile',
        render: ({ value, onChange, field }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                <select
                    value={value ?? 'stack'}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                >
                    {MOBILE_LAYOUT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>
        )
    },
}
