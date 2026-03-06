'use client'


import { SlotComponent } from "@puckeditor/core";
import { gridLayoutFields, resolvedGridData } from "./fields";
import { gridProps } from "../defaultStyles";

export const GridLayoutComponent: any = {
    fields: gridLayoutFields,
    resolveData: resolvedGridData,
    defaultProps: gridProps,
    inline: true,
    render: (({ gapY, justifyItems, gapX, alignItems, cells, puck, numberOfColumns, numberOfRows }: {
        gapX: number, numberOfRows: number, gapY: number, numberOfColumns: number, cells: { cell: SlotComponent }[], alignItems: string, justifyItems: string, puck: any
    }) => {


        return (
            <div style={{ display: "grid", gridTemplateRows: `repeat(${numberOfRows}, minmax(0, 1fr))`, columnGap: gapX, rowGap: gapY, gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`, alignItems, justifyItems }} ref={puck.dragRef} className="w-full">
                {cells.map(({ cell: Cell }, index: number) => (
                    <div key={index} className="w-full h-full">
                        <Cell />
                    </div>
                ))}
            </div>
        )
    })
}
