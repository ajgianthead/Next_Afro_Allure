import { Fields } from "@puckeditor/core";
import { ColumnLayout } from "../types";
import { NumberInput, Select } from "@mantine/core";
import { ColumnsIcon, ColumnSpacingIcon } from "@radix-ui/react-icons";

export const resolvedColumnData: ({ props }: any) => {} = async ({ props }) => {
    let newArr = [...props.columns]
    if (props.numberOfColumns > props.columns.length) {
        console.log(props);
        newArr.push({ column: [] })
        return {
            props: {
                columns: newArr,
            }
        }
    } else if (props.numberOfColumns < props.columns.length) {
        console.log(props);
        newArr.pop()
        return {
            props: {
                columns: newArr
            }
        }
    }
    return props
}

export const columnLayoutFields: Fields<ColumnLayout, {}> = {
    gap: {
        type: 'custom',
        label: 'Spacing',
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
    columns: {
        type: "array",
        visible: false,
        arrayFields: {
            column: {
                type: 'slot'
            }
        },
        defaultItemProps: {
            column: []
        }
    },

}
