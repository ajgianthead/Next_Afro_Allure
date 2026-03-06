import { Fields } from "@puckeditor/core"
import { GridLayout } from "../types"
import { NumberInput, Select } from "@mantine/core"
import { ColumnsIcon, ColumnSpacingIcon, RowsIcon, RowSpacingIcon } from "@radix-ui/react-icons"

export const resolvedGridData = async ({ props }: any) => {
    const {
        numberOfRows = 1,
        numberOfColumns = 1,
        cells = []
    } = props;

    const totalCells = numberOfRows * numberOfColumns;

    let nextCells = [...cells];

    // Add missing cells (MATCH FIELD SHAPE)
    if (nextCells.length < totalCells) {
        nextCells.push(
            ...Array.from(
                { length: totalCells - nextCells.length },
                () => ({
                    cell: []
                })
            )
        );
    }

    // Remove extra cells
    if (nextCells.length > totalCells) {
        nextCells.length = totalCells;
    }

    return {
        props: {
            ...props,
            cells: nextCells
        }
    };
};


export const gridLayoutFields: Fields<GridLayout, {}> = {
    cells: {
        type: 'array',
        visible: false,
        arrayFields: {
            cell: {
                type: 'slot'
            }
        },
        defaultItemProps: {
            cell: []
        }
    },
    justifyItems: {
        label: 'Row Alignment',
        type: 'custom',
        render: (({ field, onChange, value }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className=" col-span-2 text-sm font-medium text-slate-400">{field.label}</p>
                    <Select
                        checkIconPosition="right"
                        onChange={(e: any) => { onChange(e) }}
                        className="col-span-2 col-start-3"
                        size="xs"
                        value={value}
                        radius={'md'}
                        data={['start', 'end', 'center', 'stretch']}
                    />
                </div>
            )
        })

    },
    alignItems: {
        label: 'Column Alignment',
        type: 'custom',
        render: (({ field, onChange, value }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className=" col-span-2 text-sm font-medium text-slate-400">{field.label}</p>
                    <Select
                        checkIconPosition="right"
                        onChange={(e: any) => { onChange(e) }}
                        className="col-span-2 col-start-3"
                        size="xs"
                        value={value}
                        radius={'md'}
                        data={['start', 'end', 'center', 'stretch']}
                    />
                </div>
            )
        })

    },
    numberOfColumns: {
        type: 'custom',
        label: 'Columns',
        render: (({ value, onChange, field }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <NumberInput
                        leftSection={<ColumnsIcon />}
                        className=" col-span-3"
                        size="xs"
                        radius="md"
                        value={value}
                        onChange={(e) => onChange(Number(e))}
                    />
                </div>
            )
        })
    },


    gapX: {
        type: 'custom',
        label: 'Spacing X',
        render: (({ value, onChange, field }) => {
            return <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-sm font-medium text-slate-400">{field.label}</p>
                <NumberInput
                    leftSection={<ColumnSpacingIcon />}
                    className=" col-span-3"
                    size="xs"
                    radius="md"
                    value={value}
                    onChange={(e) => onChange(Number(e))}
                />
            </div>
        })
    },
    gapY: {
        type: 'custom',
        label: 'Spacing Y',
        render: (({ value, onChange, field }) => {
            return <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-sm font-medium text-slate-400">{field.label}</p>
                <NumberInput
                    leftSection={<RowSpacingIcon />}
                    className=" col-span-3"
                    size="xs"
                    radius="md"
                    value={value}
                    onChange={(e) => onChange(Number(e))}
                />
            </div>
        })
    },
    numberOfRows: {
        type: 'custom',
        label: 'Rows',
        render: (({ value, onChange, field }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <NumberInput
                        leftSection={<RowsIcon />}
                        className=" col-span-3"
                        size="xs"
                        radius="md"
                        value={value}
                        onChange={(e) => onChange(Number(e))}
                    />
                </div>
            )
        })
    },
}
