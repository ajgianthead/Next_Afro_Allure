import Image from "next/image"
import { imageResolvedFields } from "./fields"

export const ImageComponent: any = {
    resolveFields: imageResolvedFields,
    defaultProps: {
        url: 'https://jappbqntqogmnoluifzx.supabase.co/storage/v1/object/public/editor-media-pool/placeholder_photo.jpg',
        width: 100,
        borderColor: '#000000',
        borderRadius: 8,
        borderWidth: 1,
        borderType: 'solid',
        positionType: 'relative',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
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
    },
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
