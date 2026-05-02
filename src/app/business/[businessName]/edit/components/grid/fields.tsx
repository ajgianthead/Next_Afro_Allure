import { Fields } from "@puckeditor/core"
import { GridLayout } from "../types"
import { NumInput, StrSelect } from "../fieldPrimitives"
import { ColumnsIcon, ColumnSpacingIcon, RowsIcon, RowSpacingIcon } from "@radix-ui/react-icons"

export const resolvedGridData = async ({ props }: any) => {
    const { numberOfRows = 1, numberOfColumns = 1, cells = [] } = props;
    const totalCells = numberOfRows * numberOfColumns;
    let nextCells = [...cells];
    if (nextCells.length < totalCells) {
        nextCells.push(...Array.from({ length: totalCells - nextCells.length }, () => ({ cell: [] })));
    }
    if (nextCells.length > totalCells) {
        nextCells.length = totalCells;
    }
    return { props: { ...props, cells: nextCells } };
};

export const gridLayoutFields: Fields<GridLayout, {}> = {
    cells: {
        type: 'array',
        visible: false,
        arrayFields: { cell: { type: 'slot' } },
        defaultItemProps: { cell: [] }
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
    gapX: {
        type: 'custom',
        label: 'Spacing X',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <NumInput value={value} onChange={onChange} icon={<ColumnSpacingIcon />} />
            </div>
        )
    },
    gapY: {
        type: 'custom',
        label: 'Spacing Y',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <NumInput value={value} onChange={onChange} icon={<RowSpacingIcon />} />
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
    firstCellRowSpan: {
        type: 'custom',
        label: 'Cell 1 Row Span',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <NumInput value={value} onChange={onChange} className="col-span-2" />
            </div>
        )
    },
}
