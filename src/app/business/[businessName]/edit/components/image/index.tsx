'use client'

import { imageResolvedFields } from "./fields"
import { imageProps } from "../defaultStyles"

export const ImageComponent: any = {
    resolveFields: imageResolvedFields,
    defaultProps: imageProps,
    render: ({ url, width, objectFit, height: cssHeight, aspectRatio: imgAspectRatio, borderBottom, borderColor, borderExpanded, borderLeft, borderRadius, borderRadiusBottomLeft, borderRadiusBottomRight, borderRadiusExpanded, borderRadiusTopLeft, borderRadiusTopRight, borderRight, borderTop, borderType, borderWidth, bottom, positionType, right, left, top, mobileVisibility }: any) => {
        return (
            <div className={mobileVisibility === 'hide' ? 'hidden md:block' : ''}>
            <div style={{ display: 'block', width: `${width}%`, lineHeight: 0 }}>
                <img
                    src={url ?? ''}
                    alt=""
                    style={{
                        display: 'block',
                        width: '100%',
                        height: cssHeight > 0 ? `${cssHeight}%` : 'auto',
                        objectFit: objectFit && objectFit !== 'fill' ? objectFit : undefined,
                        aspectRatio: imgAspectRatio || undefined,
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
                        left,
                    }}
                />
            </div>
            </div>
        )
    }
}
