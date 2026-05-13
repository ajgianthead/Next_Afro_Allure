'use client'


import { SlotComponent } from "@puckeditor/core";
import { gridLayoutFields, resolvedGridData } from "./fields";
import { gridProps } from "../defaultStyles";

export const GridLayoutComponent: any = {
    fields: gridLayoutFields,
    resolveData: resolvedGridData,
    defaultProps: gridProps,
    inline: true,
    render: (({ gapY, justifyItems, gapX, alignItems, cells, puck, numberOfColumns, numberOfRows, firstCellRowSpan, firstCellColumnSpan, mobileColumns = 1 }: {
        gapX: number, numberOfRows: number, gapY: number, numberOfColumns: number, mobileColumns: number, cells: { cell: SlotComponent }[], alignItems: string, justifyItems: string, puck: any, firstCellRowSpan: number, firstCellColumnSpan: number
    }) => {
        // Tailwind JIT needs complete literal class strings — no dynamic interpolation
        const mobileColMap: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6' }
        const desktopColMap: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' }
        const colClass = `${mobileColMap[mobileColumns] ?? 'grid-cols-1'} ${desktopColMap[numberOfColumns] ?? 'lg:grid-cols-3'}`
        return (
            <div className={`grid w-full ${colClass}`} style={{ gridTemplateRows: `repeat(${numberOfRows}, minmax(0, 1fr))`, columnGap: gapX, rowGap: gapY, alignItems, justifyItems }} ref={puck.dragRef}>
                {cells.map(({ cell: Cell }, index: number) => {
                    const s: Record<string, string> = {}
                    if (index === 0) {
                        if (firstCellRowSpan > 1) s.gridRow = `span ${firstCellRowSpan}`
                        if (firstCellColumnSpan > 1) s.gridColumn = `span ${firstCellColumnSpan}`
                    }
                    return (
                        <div key={index} className="w-full h-full" style={Object.keys(s).length ? s : undefined}>
                            <Cell />
                        </div>
                    )
                })}
            </div>
        )
    })
}
