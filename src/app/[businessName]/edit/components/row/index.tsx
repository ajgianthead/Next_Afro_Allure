'use client'


import { Slot, SlotComponent } from "@puckeditor/core"
import { rowLayoutFields, resolvedRowData } from "./fields"
import { rowProps } from "../defaultStyles"

export const RowLayoutComponent: any = {
    fields: rowLayoutFields,
    resolveData: resolvedRowData,
    defaultProps: rowProps,
    inline: true,
    render: (({ rows, gap, justifyItems, puck }: {
        rows: {
            row: SlotComponent
        }[], gap: number, numberOfRows: number, justifyItems: string, puck: any
    }) => {
        const gridTemplateRows = rows.map(() => "1fr").join(" ");
        return (
            <div ref={puck.dragRef} style={{ display: "grid", gridTemplateRows, gap: gap, justifyItems }} className="w-full">
                {rows.map(({ row: Row }, index) => {
                    return (
                        <div key={index}>
                            <Row />
                        </div>
                    )
                })}
            </div>

        )
    }),
}
