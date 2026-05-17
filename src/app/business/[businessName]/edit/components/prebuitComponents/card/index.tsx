'use client'


import { ComponentConfig, Fields, SlotComponent } from "@puckeditor/core"
import { resolveCardFields, defaultCardfields } from "./fields"
import { Card } from "../../types"
import { useRouter, usePathname } from "next/navigation"


export const CardComponent: ComponentConfig<Card> = {
    resolveFields: resolveCardFields,
    fields: defaultCardfields as Fields<Card, {}>,
    render: (({ cardContent: Content, variant, cardCover, imageSource, videoSource, linkToService, service }) => {
        const router = useRouter()
        const pathname = usePathname()
        const businessName = pathname?.split('/')[1] ?? ''
        return (
            <div className={`w-full${linkToService ? ' cursor-pointer' : ''}`} onClick={() => {
                if (linkToService) {
                    router.push(`/${businessName}/book?service=${service}`)
                }
            }}>
                {variant === 'basic' ? (
                    <div className="w-full">
                        <Content />
                    </div>
                ) : (
                    <div className="min-w-[300px] flex-grow rounded-md overflow-hidden relative">
                        {cardCover === 'image' ? (
                            <img
                                src={imageSource!}
                                srcSet={`${imageSource} 2x`}
                                loading="lazy"
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <video
                                autoPlay
                                loop
                                muted
                                poster="https://assets.codepen.io/6093409/river.jpg"
                                className="absolute inset-0 w-full h-full object-cover"
                            >
                                <source src={videoSource} type="video/mp4" />
                            </video>
                        )}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    'linear-gradient(to top, rgba(0, 0, 0, 0.705), rgba(0,0,0,0) 200px), linear-gradient(to top, rgba(0, 0, 0, 0.459), rgba(0,0,0,0) 300px)',
                            }}
                        />
                        <div className="relative z-10 p-4">
                            <Content />
                        </div>
                    </div>
                )}
            </div>

        )
    }),
    defaultProps: {
        cardContent: [{
            type: 'Container',
            props: {
                flexDirection: 'flex-col',
                mainAxisLayout: 'start',
                altAxisLayout: 'start',
                gapX: 0,
                gapY: 2,
                padding: 0,
                paddingExpanded: 'false',
                marginExpanded: 'false',
                margin: 0,
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                backgroundColor: 'transparent',
                borderColor: '#000000',
                borderRadius: 0,
                borderWidth: 0,
                borderBottom: 0,
                borderExpanded: 'false',
                borderLeft: 0,
                borderRight: 0,
                borderTop: 0,
                borderType: 'solid',
                borderRadiusExpanded: 'false',
                borderRadiusTopLeft: 0,
                borderRadiusTopRight: 0,
                borderRadiusBottomLeft: 0,
                borderRadiusBottomRight: 0,
                positionType: 'relative',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                grow: true,
                draggable: true,
                responsive: true,
                content: [
                    {
                        type: 'HeadingTwo',
                        props: {
                            text: 'Service Name',
                            color: '#1A1818',
                            fontFamily: 'Roboto',
                            letterSpacing: 0,
                            lineHeight: 1.2,
                            align: 'start',
                            style: [],
                            isLink: false,
                            linkType: 'external',
                            url: '',
                            sections: '',
                            textTransform: 'none',
                            size: 'md',
                        }
                    },
                    {
                        type: 'BodyMedium',
                        props: {
                            text: 'A short description of this service.',
                            color: '#6F6863',
                            fontFamily: 'Roboto',
                            letterSpacing: 0,
                            lineHeight: 1.5,
                            align: 'start',
                            style: [],
                            isLink: false,
                            linkType: 'external',
                            url: '',
                            sections: '',
                            textTransform: 'none',
                            size: 'md',
                        }
                    },
                ]
            }
        }],
        variant: 'basic',
        cardCover: 'image',
        imageSource: "https://jappbqntqogmnoluifzx.supabase.co/storage/v1/object/public/editor-media-pool/placeholder_photo.jpg",
        videoSource: "https://assets.codepen.io/6093409/river.mp4",
        linkToService: false,
        service: ""
    }
}
