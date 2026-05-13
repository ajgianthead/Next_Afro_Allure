'use client'

import { containerDefaultProps } from "../defaultStyles"
import { Container } from "../types"
import { containerResolvedFields, defaultFields } from "./fields"
import { SPACING_MAP } from "@/features/editor/lib/responsive"



export const ContainerComponent: any = {
    root: true,
    resolveFields: containerResolvedFields,
    defaultProps: containerDefaultProps,
    fields: defaultFields,
    inline: true,
    render: ({ puck, content: Content, padding, margin, backgroundColor, flexDirection, mainAxisLayout, altAxisLayout, paddingTop, paddingBottom, paddingExpanded, paddingLeft, paddingRight, positionType, top, bottom, left, right, borderColor, borderRadius, borderType, borderWidth, gapX, gapY, responsive, marginExpanded, marginTop, marginBottom, marginLeft, marginRight, borderExpanded, borderBottom, borderLeft, borderRight, borderTop, borderRadiusExpanded, borderRadiusBottomLeft, borderRadiusBottomRight, borderRadiusTopLeft, borderRadiusTopRight, draggable, rotation, grow, responsiveDirection, hideBelow, hideAbove, aspectRatio, overflow, minHeight, maxWidth: containerMaxWidth, gridTemplateColumns, zIndex, spacing }: any) => {
        const isGrid = flexDirection === 'grid'

        let outerClass: string
        if (hideBelow === 'lg') {
            outerClass = grow ? 'hidden lg:flex lg:w-full' : 'hidden lg:flex'
        } else if (hideAbove === 'lg') {
            outerClass = grow ? 'flex w-full lg:hidden' : 'lg:hidden'
        } else {
            outerClass = grow ? 'flex w-full' : 'max-w-max'
        }

        let dirClass: string
        if (responsiveDirection === 'col-to-row') {
            dirClass = 'flex-col md:flex-row'
        } else if (responsiveDirection === 'row-to-col') {
            dirClass = 'flex-row md:flex-col'
        } else if (isGrid) {
            dirClass = ''
        } else {
            dirClass = flexDirection
        }
        const sizeClass = grow ? 'w-full' : 'max-w-max'
        const spacingClass = spacing && spacing !== 'none' ? SPACING_MAP[spacing] ?? '' : ''

        const inlinePadding = spacingClass ? {} : {
            padding: `${padding}rem`,
            paddingTop: paddingExpanded === 'true' ? `${paddingTop}rem` : `${padding}rem`,
            paddingBottom: paddingExpanded === 'true' ? `${paddingBottom}rem` : `${padding}rem`,
            paddingRight: paddingExpanded === 'true' ? `${paddingRight}rem` : `${padding}rem`,
            paddingLeft: paddingExpanded === 'true' ? `${paddingLeft}rem` : `${padding}rem`,
        }

        return (
            <div className={outerClass} ref={puck.dragRef}>
                <Content className={`${dirClass} ${sizeClass} ${spacingClass}`} style={{
                    display: isGrid ? 'grid' : 'flex',
                    transform: `rotate(${rotation}deg)`,
                    ...inlinePadding,
                    flexShrink: !grow ? 1 : 0,
                    margin: `${margin}rem`,
                    marginTop: marginExpanded === 'true' ? `${marginTop}rem` : `${margin}rem`,
                    marginBottom: marginExpanded === 'true' ? `${marginBottom}rem` : `${margin}rem`,
                    marginRight: marginExpanded === 'true' ? `${marginRight}rem` : `${margin}rem`,
                    marginLeft: marginExpanded === 'true' ? `${marginLeft}rem` : `${margin}rem`,
                    backgroundColor,
                    position: positionType,
                    top,
                    bottom,
                    left,
                    right,
                    justifyContent: mainAxisLayout,
                    alignItems: altAxisLayout,
                    borderRadius,
                    borderTopLeftRadius: borderRadiusExpanded === 'true' ? borderRadiusTopLeft : borderRadius,
                    borderTopRightRadius: borderRadiusExpanded === 'true' ? borderRadiusTopRight : borderRadius,
                    borderBottomLeftRadius: borderRadiusExpanded === 'true' ? borderRadiusBottomLeft : borderRadius,
                    borderBottomRightRadius: borderRadiusExpanded === 'true' ? borderRadiusBottomRight : borderRadius,
                    borderStyle: borderType,
                    borderColor,
                    borderWidth,
                    borderTop: borderExpanded === 'true' ? `${borderTop}` : `${borderWidth}`,
                    borderBottom: borderExpanded === 'true' ? `${borderBottom}` : `${borderWidth}`,
                    borderRight: borderExpanded === 'true' ? `${borderRight}` : `${borderWidth}`,
                    borderLeft: borderExpanded === 'true' ? `${borderLeft}` : `${borderWidth}`,
                    columnGap: gapX,
                    rowGap: gapY,
                    flex: grow ? '1 1 0%' : 'none',
                    gridTemplateColumns: isGrid && gridTemplateColumns ? gridTemplateColumns : undefined,
                    aspectRatio: aspectRatio || undefined,
                    overflow: overflow && overflow !== 'visible' ? overflow : undefined,
                    minHeight: minHeight > 0 ? `${minHeight}rem` : undefined,
                    maxWidth: containerMaxWidth > 0 ? `${containerMaxWidth}rem` : undefined,
                    zIndex: zIndex > 0 ? zIndex : undefined,
                }} />
            </div>
        )
    }
}
