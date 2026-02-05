'use client'

import { containerDefaultProps } from "../defaultStyles"
import { Container } from "../types"
import { containerResolvedFields, defaultFields } from "./fields"





export const ContainerComponent: any = {
    root: true,
    resolveFields: containerResolvedFields,
    defaultProps: containerDefaultProps,
    fields: defaultFields,
    inline: true,
    render: ({ puck, content: Content, padding, margin, backgroundColor, flexDirection, mainAxisLayout, altAxisLayout, paddingTop, paddingBottom, paddingExpanded, paddingLeft, paddingRight, positionType, top, bottom, left, right, borderColor, borderRadius, borderType, borderWidth, gapX, gapY, responsive, numOfCols, numOfRows, marginExpanded, marginTop, marginBottom, marginLeft, marginRight, borderExpanded, borderBottom, borderLeft, borderRight, borderTop, borderRadiusExpanded, borderRadiusBottomLeft, borderRadiusBottomRight, borderRadiusTopLeft, borderRadiusTopRight, draggable, rotation, grow }: any) => {
        return (
            <div className={`${grow ? 'flex w-full' : 'max-w-max'}`} ref={puck.dragRef}>
                <Content className={`${flexDirection} ${grow ? 'flex' : 'max-w-max'}`} style={{
                    transform: `rotate(${rotation}deg)`,
                    padding: `${padding}rem`,
                    flexShrink: !grow ? 1 : 0,
                    paddingTop: paddingExpanded === 'true' ? `${paddingTop}rem` : `${padding}rem`,
                    paddingBottom: paddingExpanded === 'true' ? `${paddingBottom}rem` : `${padding}rem`,
                    paddingRight: paddingExpanded === 'true' ? `${paddingRight}rem` : `${padding}rem`,
                    paddingLeft: paddingExpanded === 'true' ? `${paddingLeft}rem` : `${padding}rem`,
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
                }} />
            </div>
        )
    }
}
