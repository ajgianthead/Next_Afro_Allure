'use client'

import { imageResolvedFields } from "./fields"
import { imageProps } from "../defaultStyles"

const WIDTH_MAP: Record<string, string> = {
    full: '100%',
    'three-quarter': '75%',
    half: '50%',
    'one-third': '33.33%',
}

const HEIGHT_MAP: Record<string, string> = {
    auto: 'auto',
    sm: '200px',
    md: '320px',
    lg: '480px',
    vh: '100vh',
}

export const ImageComponent: any = {
    resolveFields: imageResolvedFields,
    defaultProps: imageProps,
    render: ({ url, alt, width, objectFit, height, aspectRatio, borderBottom, borderColor, borderExpanded, borderLeft, borderRadius, borderRadiusBottomLeft, borderRadiusBottomRight, borderRadiusExpanded, borderRadiusTopLeft, borderRadiusTopRight, borderRight, borderTop, borderType, borderWidth, bottom, positionType, right, left, top, mobileVisibility }: any) => {
        // Support legacy numeric width/height values from pre-migration saved data
        const containerWidth = typeof width === 'number'
            ? `${width}%`
            : (WIDTH_MAP[width] ?? '100%')

        const containerHeight = typeof height === 'number'
            ? (height > 0 ? `${height}px` : 'auto')
            : (HEIGHT_MAP[height] ?? 'auto')

        const isAutoHeight = containerHeight === 'auto'
        const resolvedObjectFit = objectFit && objectFit !== 'fill' ? objectFit : 'cover'

        return (
            <div
                className={mobileVisibility === 'hide' ? 'hidden md:block' : ''}
                style={{ position: positionType, top, bottom, left, right }}
            >
                <div
                    style={{
                        width: containerWidth,
                        height: containerHeight,
                        position: 'relative',
                        overflow: 'hidden',
                        lineHeight: 0,
                        borderStyle: borderType || undefined,
                        borderColor: borderColor || undefined,
                        borderTopWidth: borderExpanded === 'true' ? borderTop : borderWidth,
                        borderBottomWidth: borderExpanded === 'true' ? borderBottom : borderWidth,
                        borderLeftWidth: borderExpanded === 'true' ? borderLeft : borderWidth,
                        borderRightWidth: borderExpanded === 'true' ? borderRight : borderWidth,
                        borderTopLeftRadius: borderRadiusExpanded === 'true' ? borderRadiusTopLeft : borderRadius,
                        borderTopRightRadius: borderRadiusExpanded === 'true' ? borderRadiusTopRight : borderRadius,
                        borderBottomLeftRadius: borderRadiusExpanded === 'true' ? borderRadiusBottomLeft : borderRadius,
                        borderBottomRightRadius: borderRadiusExpanded === 'true' ? borderRadiusBottomRight : borderRadius,
                        aspectRatio: isAutoHeight ? (aspectRatio || undefined) : undefined,
                    }}
                >
                    <img
                        src={url ?? ''}
                        alt={alt || ''}
                        style={{
                            display: 'block',
                            width: '100%',
                            height: isAutoHeight ? 'auto' : '100%',
                            objectFit: isAutoHeight ? undefined : resolvedObjectFit,
                            ...(isAutoHeight ? {} : { position: 'absolute' as const, top: 0, left: 0 }),
                        }}
                    />
                </div>
            </div>
        )
    }
}
