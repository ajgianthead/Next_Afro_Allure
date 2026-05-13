'use client'

import { FieldLabel, registerOverlayPortal } from "@puckeditor/core";
import React, { useEffect, useRef } from 'react';
import type { Fields } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { buttonResolvedFields } from "./fields";
import { buttonProps } from "../defaultStyles";


export const ButtonComponent: any = {
    resolveFields: buttonResolvedFields,
    defaultProps: buttonProps,
    render: ({ text, link, action, padding, margin, backgroundColor, flexDirection, mainAxisLayout, altAxisLayout, paddingTop, paddingBottom, paddingExpanded, paddingLeft, paddingRight, positionType, top, bottom, left, right, borderColor, borderRadius, borderType, borderWidth, gapX, gapY, numOfCols, numOfRows, marginExpanded, marginTop, marginBottom, marginLeft, marginRight, borderExpanded, borderBottom, borderLeft, borderRight, borderTop, borderRadiusExpanded, borderRadiusBottomLeft, borderRadiusBottomRight, borderRadiusTopLeft, borderRadiusTopRight, fontSize, fontWeight, fontFamily, color, letterSpacing, lineHeight, style, id, align, mobileWidth }: any) => {
        const isFull = mobileWidth === 'full'
        return <a href={link} target="_blank" className={isFull ? 'block w-full md:inline-block md:w-auto' : 'inline-block'}>
            <button style={{
                padding: `${padding}rem`,
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
                display: flexDirection === 'grid' ? 'grid' : 'flex',
                textWrap: 'wrap',
                fontSize: `${fontSize}rem`,
                fontFamily,
                fontWeight: style?.includes('bold') ? 'bold' : fontWeight,
                color,
                letterSpacing,
                lineHeight,
                textAlign: align,
                textDecoration: style?.includes('underline') ? 'underline' : "none",
                fontStyle: style?.includes('italic') ? 'italic' : 'normal',
                width: isFull ? '100%' : undefined,
            }} className={`apply-font-${id.split('-')[1]} ${isFull ? 'w-full md:w-auto' : 'max-w-max'}`}>
                {text}
            </button>
        </a>
    }
}
