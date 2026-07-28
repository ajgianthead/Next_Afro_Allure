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
    render: ({ puck, content: Content, padding, margin, backgroundColor, flexDirection, mainAxisLayout, altAxisLayout, paddingTop, paddingBottom, paddingExpanded, paddingLeft, paddingRight, positionType, top, bottom, left, right, borderColor, borderRadius, borderType, borderWidth, gapX, gapY, responsive, marginExpanded, marginTop, marginBottom, marginLeft, marginRight, borderExpanded, borderBottom, borderLeft, borderRight, borderTop, borderRadiusExpanded, borderRadiusBottomLeft, borderRadiusBottomRight, borderRadiusTopLeft, borderRadiusTopRight, draggable, rotation, grow, responsiveDirection, hideBelow, hideAbove, aspectRatio, overflow, minHeight, maxWidth: containerMaxWidth, gridTemplateColumns, zIndex, spacing, backgroundImageUrl, backgroundObjectFit, backgroundPosition, opacity, width, widthUnit, height, heightUnit }: any) => {
        const isGrid = flexDirection === 'grid'
        const isGradient = typeof backgroundColor === 'string' &&
            (backgroundColor.startsWith('linear-gradient') || backgroundColor.startsWith('radial-gradient'))

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

        const inlinePadding = {
            padding: `${padding}rem`,
            paddingTop: paddingExpanded === 'true' ? `${paddingTop}rem` : `${padding}rem`,
            paddingBottom: paddingExpanded === 'true' ? `${paddingBottom}rem` : `${padding}rem`,
            paddingRight: paddingExpanded === 'true' ? `${paddingRight}rem` : `${padding}rem`,
            paddingLeft: paddingExpanded === 'true' ? `${paddingLeft}rem` : `${padding}rem`,
        }

        const brTL = borderRadiusExpanded === 'true' ? borderRadiusTopLeft : borderRadius
        const brTR = borderRadiusExpanded === 'true' ? borderRadiusTopRight : borderRadius
        const brBL = borderRadiusExpanded === 'true' ? borderRadiusBottomLeft : borderRadius
        const brBR = borderRadiusExpanded === 'true' ? borderRadiusBottomRight : borderRadius

        return (
            <div className={`relative ${outerClass}`} ref={puck.dragRef}>
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        pointerEvents: 'none',
                        borderRadius,
                        borderTopLeftRadius: brTL,
                        borderTopRightRadius: brTR,
                        borderBottomLeftRadius: brBL,
                        borderBottomRightRadius: brBR,
                        backgroundColor: isGradient ? undefined : backgroundColor,
                        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : isGradient ? backgroundColor : undefined,
                        backgroundSize: backgroundImageUrl ? (backgroundObjectFit ?? 'cover') : undefined,
                        backgroundPosition: backgroundImageUrl ? (backgroundPosition ?? 'center') : undefined,
                        backgroundRepeat: backgroundImageUrl ? 'no-repeat' : undefined,
                        opacity: opacity != null ? opacity / 100 : undefined,
                    }}
                />
                <Content className={`${dirClass} ${sizeClass} ${spacingClass}`} style={{
                    position: positionType,
                    display: 'flex',
                    transform: `rotate(${rotation}deg)`,
                    ...inlinePadding,
                    flexShrink: !grow ? 1 : 0,
                    margin: `${margin}rem`,
                    marginTop: marginExpanded === 'true' ? `${marginTop}rem` : `${margin}rem`,
                    marginBottom: marginExpanded === 'true' ? `${marginBottom}rem` : `${margin}rem`,
                    marginRight: marginExpanded === 'true' ? `${marginRight}rem` : `${margin}rem`,
                    marginLeft: marginExpanded === 'true' ? `${marginLeft}rem` : `${margin}rem`,
                    top,
                    bottom,
                    left,
                    right,
                    justifyContent: mainAxisLayout,
                    alignItems: altAxisLayout,
                    borderRadius,
                    borderTopLeftRadius: brTL,
                    borderTopRightRadius: brTR,
                    borderBottomLeftRadius: brBL,
                    borderBottomRightRadius: brBR,
                    borderStyle: borderType,
                    borderColor,
                    borderTopWidth: borderExpanded === 'true' ? borderTop : borderWidth,
                    borderBottomWidth: borderExpanded === 'true' ? borderBottom : borderWidth,
                    borderRightWidth: borderExpanded === 'true' ? borderRight : borderWidth,
                    borderLeftWidth: borderExpanded === 'true' ? borderLeft : borderWidth,
                    columnGap: gapX,
                    rowGap: gapY,
                    flex: grow ? '1 1 0%' : 'none',
                    gridTemplateColumns: isGrid && gridTemplateColumns ? gridTemplateColumns : undefined,
                    aspectRatio: aspectRatio || undefined,
                    overflow: overflow && overflow !== 'visible' ? overflow : undefined,
                    minHeight: minHeight > 0 ? `${minHeight}rem` : undefined,
                    maxWidth: containerMaxWidth > 0 ? `${containerMaxWidth}rem` : undefined,
                    width: width > 0 ? `${width}${widthUnit ?? 'px'}` : undefined,
                    height: height > 0 ? `${height}${heightUnit ?? 'px'}` : undefined,
                    zIndex: zIndex > 0 ? zIndex : undefined,
                }} />
            </div>
        )
    }
}
