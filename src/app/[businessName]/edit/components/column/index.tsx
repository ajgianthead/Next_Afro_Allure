'use client'

import { Slot, SlotComponent } from "@puckeditor/core"
import { columnLayoutFields, resolvedColumnData } from "./fields"
import { columnProps } from "../defaultStyles"

export const ColumnLayoutComponent: any = {
    fields: columnLayoutFields,
    resolveData: resolvedColumnData,
    defaultProps: columnProps,
    inline: true,
    render: (({ columns, gap, alignItems, puck }: {
        columns: {
            column: SlotComponent
        }[], gap: number, numberOfColumns: number, alignItems: string, puck: any
    }) => {
        const gridTemplateColumns = columns.map(() => "1fr").join(" ");
        return (
            <div ref={puck.dragRef} style={{ display: "grid", gridTemplateColumns, gap: gap, alignItems }} className="w-full">
                {columns.map(({ column: Column }, index) => {
                    return (
                        <div key={index}>
                            <Column />
                        </div>
                    )
                })}
            </div>

        )
    }),
}
