'use client'


import { useEffect, useRef, useState } from "react"
import { videoProps } from "../defaultStyles"
import { videoResolvedFields } from "./fields"
import ReactPlayer from 'react-player'
import { ReactPlayerProps } from "react-player/types"


export const VideoComponent: any = {
    resolveFields: videoResolvedFields,
    inline: true,

    defaultProps: videoProps,
    render: ({ url, width, height, borderBottom, borderColor, borderExpanded, borderLeft, borderRadius, borderRadiusBottomLeft, borderRadiusBottomRight, borderRadiusExpanded, borderRadiusTopLeft, borderRadiusTopRight, borderRight, borderTop, borderType, borderWidth, bottom, positionType, right, left, top, autoPlay, speed, controls, loop, puck }: any) => {
        const playerRef = useRef<HTMLVideoElement | null>(null)
        const [isReady, setIsReady] = useState(false)
        const [playing, setPlaying] = useState<boolean | undefined>(undefined)
        useEffect(() => {
            // after first paint, we take control
            if (isReady) {
                setPlaying(autoPlay)
            }
        }, [autoPlay])
        return <div ref={puck.dragRef} style={{
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
            {!isReady && (
                <div className="flex justify-center items-center text-xl font-medium text-black h-full">
                    Loading video...
                </div>
            )}
            <ReactPlayer onReady={() => setIsReady(true)}
                onError={(e) => console.error("Video error", e)} ref={playerRef} playing={playing}
                muted={autoPlay} style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
                loop={loop} playbackRate={speed} controls={controls} src={url} />            </div>

    }
}
