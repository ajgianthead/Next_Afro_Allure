import { Fields } from "@puckeditor/core"
import { GridLayout } from "../types"
import { NumInput, StrSelect } from "../fieldPrimitives"
import { ColumnsIcon, ColumnSpacingIcon, RowsIcon, RowSpacingIcon } from "@radix-ui/react-icons"

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

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
    mobileColumns: {
        type: 'custom',
        label: 'Mobile columns',
        render: ({ value, onChange, field }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                <NumInput value={value ?? 1} onChange={onChange} className="flex-1" />
            </div>
        )
    },
    justifyItems: {
        label: 'Row Alignment',
        type: 'custom',
        render: ({ field, onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'stretch']} className="flex-1" />
            </div>
        )
    },
    alignItems: {
        label: 'Column Alignment',
        type: 'custom',
        render: ({ field, onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                <StrSelect value={value} onChange={onChange} options={['start', 'end', 'center', 'stretch']} className="flex-1" />
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
    gapX: {
        type: 'custom',
        label: 'Spacing X',
        render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<ColumnSpacingIcon />} />,
    },
    gapY: {
        type: 'custom',
        label: 'Spacing Y',
        render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<RowSpacingIcon />} />,
    },
    numberOfRows: {
        type: 'custom',
        label: 'Rows',
        render: ({ value, onChange }) => (
            <NumInput value={value} onChange={onChange} icon={<RowsIcon />} />
        )
    },
    firstCellRowSpan: {
        type: 'custom',
        label: 'Cell 1 Row Span',
        render: ({ value, onChange, field }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                <NumInput value={value} onChange={onChange} className="flex-1" />
            </div>
        )
    },
    firstCellColumnSpan: {
        type: 'custom',
        label: 'Cell 1 Col Span',
        render: ({ value, onChange, field }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                <NumInput value={value} onChange={onChange} className="flex-1" />
            </div>
        )
    },
}
