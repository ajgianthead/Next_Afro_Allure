'use client'

import { Slot, SlotComponent } from "@puckeditor/core"
import { columnLayoutFields, resolvedColumnData } from "./fields"
import { columnProps } from "../defaultStyles"

export const ColumnLayoutComponent: any = {
    fields: columnLayoutFields,
    resolveData: resolvedColumnData,
    defaultProps: columnProps,
    inline: true,
    render: (({ columns, gap, alignItems, mobileLayout, puck }: {
        columns: { column: SlotComponent }[]
        gap: number
        numberOfColumns: number
        alignItems: string
        mobileLayout: string
        puck: any
    }) => {
        if (mobileLayout === 'stack') {
            return (
                <div ref={puck.dragRef} className="flex flex-col md:flex-row w-full" style={{ gap, alignItems }}>
                    {columns.map(({ column: Column }, index) => (
                        <div key={index} className="flex-1"><Column /></div>
                    ))}
                </div>
            )
        }
        const gridTemplateColumns = columns.map(() => "1fr").join(" ")
        return (
            <div ref={puck.dragRef} style={{ display: "grid", gridTemplateColumns, gap, alignItems }} className="w-full">
                {columns.map(({ column: Column }, index) => (
                    <div key={index}><Column /></div>
                ))}
            </div>
        )
    }),
}
