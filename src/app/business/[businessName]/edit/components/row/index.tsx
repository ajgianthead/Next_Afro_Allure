'use client'


import { Slot, SlotComponent } from "@puckeditor/core"
import { rowLayoutFields, resolvedRowData } from "./fields"
import { rowProps } from "../defaultStyles"

export const RowLayoutComponent: any = {
    fields: rowLayoutFields,
    resolveData: resolvedRowData,
    defaultProps: rowProps,
    inline: true,
    render: (({ rows, gap, justifyItems, mobileLayout, opacity, puck }: {
        rows: { row: SlotComponent }[]
        gap: number
        numberOfRows: number
        justifyItems: string
        mobileLayout: string
        opacity?: number
        puck: any
    }) => {
        const opacityStyle = { opacity: opacity != null ? opacity / 100 : undefined }
        if (mobileLayout === 'row') {
            return (
                <div ref={puck.dragRef} className="flex flex-col md:flex-row w-full" style={{ gap, justifyContent: justifyItems, ...opacityStyle }}>
                    {rows.map(({ row: Row }, index) => (
                        <div key={index} className="flex-1"><Row /></div>
                    ))}
                </div>
            )
        }
        const gridTemplateRows = rows.map(() => "1fr").join(" ")
        return (
            <div ref={puck.dragRef} style={{ display: "grid", gridTemplateRows, gap, justifyItems, ...opacityStyle }} className="w-full">
                {rows.map(({ row: Row }, index) => (
                    <div key={index}><Row /></div>
                ))}
            </div>
        )
    }),
}
