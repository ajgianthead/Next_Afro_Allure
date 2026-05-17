import { Fields } from "@puckeditor/core";
import { ColumnLayout } from "../types";
import { NumInput, KVSelect } from "../fieldPrimitives";
import { ColumnsIcon, ColumnSpacingIcon } from "@radix-ui/react-icons";
import { MOBILE_LAYOUT_OPTIONS } from "@/features/editor/lib/responsive";

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

export const resolvedColumnData: ({ props }: any) => {} = async ({ props }) => {
    let newArr = [...props.columns]
    if (props.numberOfColumns > props.columns.length) {
        newArr.push({ column: [] })
        return { props: { columns: newArr } }
    } else if (props.numberOfColumns < props.columns.length) {
        newArr.pop()
        return { props: { columns: newArr } }
    }
    return props
}

export const columnLayoutFields: Fields<ColumnLayout, {}> = {
    gap: {
        type: 'custom',
        label: 'Spacing',
        render: ({ value, onChange }) => (
            <NumInput value={value} onChange={onChange} icon={<ColumnSpacingIcon />} />
        )
    },
    alignItems: {
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
    numberOfColumns: {
        type: 'custom',
        label: 'Columns',
        render: ({ value, onChange }) => (
            <NumInput value={value} onChange={onChange} icon={<ColumnsIcon />} />
        )
    },
    columns: {
        type: "array",
        visible: false,
        arrayFields: { column: { type: 'slot' } },
        defaultItemProps: { column: [] }
    },
    mobileLayout: {
        type: 'custom',
        label: 'Mobile',
        render: ({ value, onChange, field }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                {(value ?? 'stack') === 'row' && (
                    <p style={{ fontSize: 10, color: '#C9974A', paddingLeft: 4 }}>May look crowded on small phones</p>
                )}
            </div>
        )
    },
}
