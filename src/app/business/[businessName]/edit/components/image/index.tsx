'use client'


import Image from "next/image"
import { imageResolvedFields } from "./fields"
import { imageProps } from "../defaultStyles"

export const ImageComponent: any = {
    resolveFields: imageResolvedFields,
    defaultProps: imageProps,
    render: ({ url, width, borderBottom, borderColor, borderExpanded, borderLeft, borderRadius, borderRadiusBottomLeft, borderRadiusBottomRight, borderRadiusExpanded, borderRadiusTopLeft, borderRadiusTopRight, borderRight, borderTop, borderType, borderWidth, bottom, positionType, right, left, top }: any) => {
        return <div >
            <Image style={{
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
                position: positionType,
                bottom,
                top,
                right,
                left
            }} width={width} height={100} src={url!} alt="image" />
        </div>
    }
}
