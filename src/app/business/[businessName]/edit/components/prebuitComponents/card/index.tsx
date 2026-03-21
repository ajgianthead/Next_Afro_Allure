'use client'


import { ComponentConfig, SlotComponent } from "@puckeditor/core"
import { resolveCardFields, defaultCardfields } from "./fields"
import { Card as MUICard, CardContent, CardCover } from "@mui/joy"
import { Card } from "../../types"
import { useRouter } from "next/navigation"
import { useEditorContext } from "@utils/context/EditorContext"
import CryptoJS from "crypto-js";


export const CardComponent: ComponentConfig<Card> = {
    resolveFields: resolveCardFields,
    fields: defaultCardfields,
    render: (({ cardContent: Content, variant, cardCover, imageSource, videoSource, linkToService, service }) => {
        const router = useRouter()
        const { editorState } = useEditorContext()
        return (
            <div onClick={() => {
                if (linkToService) {
                    router.push(`/${editorState.businessName}/book?service=${CryptoJS.AES.encrypt(service, process.env.NEXT_PUBLIC_SECRET!).toString()}`)
                }
            }}>
                {variant === 'basic' ? <MUICard sx={{ minWidth: 300, flexGrow: 1 }}>
                    <CardContent>
                        <Content />
                    </CardContent>
                </MUICard> : <MUICard sx={{ minWidth: 300, flexGrow: 1 }}>
                    {cardCover === 'image' ? <CardCover >
                        <img
                            src={imageSource!}
                            srcSet={`${imageSource} 2x`}
                            loading="lazy"
                            alt=""
                        />
                    </CardCover> : <CardCover>
                        <video
                            autoPlay
                            loop
                            muted
                            poster="https://assets.codepen.io/6093409/river.jpg"
                        >
                            <source
                                src={videoSource}
                                type="video/mp4"
                            />
                        </video>
                    </CardCover>}

                    <CardCover
                        sx={{
                            background:
                                'linear-gradient(to top, rgba(0, 0, 0, 0.705), rgba(0,0,0,0) 200px), linear-gradient(to top, rgba(0, 0, 0, 0.459), rgba(0,0,0,0) 300px)',
                        }}
                    />
                    <CardContent>
                        <Content />
                    </CardContent>
                </MUICard>}
            </div>

        )
    }),
    defaultProps: {
        cardContent: [{
            type: 'Container',
            props: {
                gapX: 0,
                gapY: 3,
                draggable: true,
                padding: 0,
                borderRadiusExpanded: 'false',
                borderRadiusTopLeft: 0,
                borderRadiusTopRight: 0,
                borderRadiusBottomLeft: 0,
                borderRadiusBottomRight: 0,
                paddingExpanded: "false",
                marginExpanded: "false",
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                margin: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                backgroundColor: '#f0000006b',
                borderColor: '#eee',
                borderRadius: 8,
                borderWidth: 0,
                borderBottom: 0,
                borderExpanded: 'false',
                borderLeft: 0,
                borderRight: 0,
                borderTop: 0,
                numOfCols: 3,
                numOfRows: 3,
                borderType: 'solid',
                positionType: 'relative',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                responsive: true,
                flexDirection: 'flex-col',
                mainAxisLayout: 'start',
                altAxisLayout: 'start',
                content: [
                    {
                        type: 'HeadingOne',
                        props: {
                            color: '#fff',
                            fontFamily: 'Roboto',
                            letterSpacing: 1.2,
                            lineHeight: 1.5,
                            align: 'start',
                            style: [],
                            text: 'Heading'
                        }
                    },
                    {
                        type: 'TitleLarge',
                        props: {
                            color: '#fff',
                            fontFamily: 'Roboto',
                            letterSpacing: 1.2,
                            lineHeight: 1.5,
                            align: 'start',
                            style: [],
                            text: 'Title'
                        }
                    },
                    {
                        type: 'BodyMedium',
                        props: {
                            color: '#fff',
                            fontFamily: 'Roboto',
                            letterSpacing: 1.2,
                            lineHeight: 1.5,
                            align: 'start',
                            style: [],
                            text: 'Body'
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
