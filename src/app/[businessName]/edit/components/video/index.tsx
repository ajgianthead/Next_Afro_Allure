import { videoResolvedFields } from "./fields"

export const VideoComponent: any = {
    resolveFields: videoResolvedFields,

    defaultProps: {
        url: 'https://www.youtube.com/watch?v=gTgrHPax0hk&t=1025s&ab_channel=Dream',
        width: 300,
        borderColor: '#000000',
        borderRadius: 8,
        borderWidth: 1,
        borderType: 'solid',
        positionType: 'relative',
        left: 0,
        right: 0,
        borderRadiusTopLeft: 0,
        borderRadiusTopRight: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        borderBottom: 0,
        borderExpanded: 'false',
        borderLeft: 0,
        borderRadiusExpanded: 'false',
        borderRight: 0,
        borderTop: 0,
        top: 0,
        bottom: 0,
        autoPlay: false,
        controls: true,
        speed: 1,
        loop: false
    },
    render: ({ url, width, borderBottom, borderColor, borderExpanded, borderLeft, borderRadius, borderRadiusBottomLeft, borderRadiusBottomRight, borderRadiusExpanded, borderRadiusTopLeft, borderRadiusTopRight, borderRight, borderTop, borderType, borderWidth, bottom, positionType, right, left, top, autoPlay, speed, controls, loop }: any) => {
        return <div style={{ padding: 100, position: 'relative', background: '#000' }}>
            <div style={{
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
                width,
                color: 'white'
            }}>
                Video preview unavailable in editor
            </div>
        </div>

    }
}
