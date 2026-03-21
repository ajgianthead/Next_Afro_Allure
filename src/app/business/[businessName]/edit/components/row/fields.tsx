import { Fields } from "@puckeditor/core";
import { ColumnLayout, RowLayout } from "../types";
import { NumberInput, Select } from "@mantine/core";
import { ColumnsIcon, ColumnSpacingIcon, RowsIcon, RowSpacingIcon } from "@radix-ui/react-icons";

export const resolvedRowData: ({ props }: any) => {} = async ({ props }) => {
    let newArr = [...props.rows]
    if (props.numberOfRows > props.rows.length) {
        newArr.push({ row: [] })
        return {
            props: {
                rows: newArr,
            }
        }
    } else if (props.numberOfRows < props.rows.length) {
        newArr.pop()
        return {
            props: {
                rows: newArr
            }
        }
    }
    return props
}

export const rowLayoutFields: Fields<RowLayout, {}> = {
    gap: {
        type: 'custom',
        label: 'Spacing',
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

    rows: {
        type: "array",
        visible: false,
        arrayFields: {
            row: {
                type: 'slot'
            }
        },
        defaultItemProps: {
            row: []
        }
    },

}
