import { Fields } from "@puckeditor/core";
import { ColumnLayout } from "../types";
import { NumInput, StrSelect } from "../fieldPrimitives";
import { ColumnsIcon, ColumnSpacingIcon } from "@radix-ui/react-icons";

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
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <NumInput value={value} onChange={onChange} icon={<ColumnSpacingIcon />} />
            </div>
        )
    },
    alignItems: {
        label: 'Column Alignment',
        type: 'custom',
        render: ({ field, onChange, value }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'stretch']} className="col-span-2 col-start-3" />
            </div>
        )
    },
    numberOfColumns: {
        type: 'custom',
        label: 'Columns',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <NumInput value={value} onChange={onChange} icon={<ColumnsIcon />} />
            </div>
        )
    },
    columns: {
        type: "array",
        visible: false,
        arrayFields: {
            column: { type: 'slot' }
        },
        defaultItemProps: { column: [] }
    },
}
