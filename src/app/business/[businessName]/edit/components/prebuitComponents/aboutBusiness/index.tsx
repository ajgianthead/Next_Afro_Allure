'use client'

import { SlotComponent } from "@puckeditor/core"
import { aboutSectionFields } from "./fields"
import { buttonProps, containerDefaultProps, customTextProps, imageProps } from "../../defaultStyles"

export const AboutBusinessComponent: any = {
    fields: aboutSectionFields,
    defaultProps: {
        content: [{
            type: 'Container',
            props: {
                ...containerDefaultProps,
                flexDirection: 'flex-row',
                mainAxisLayout: 'start',
                altAxisLayout: 'stretch',
                gapX: 0,
                gapY: 0,
                padding: 0,
                paddingExpanded: 'false',
                backgroundColor: '#ffffff',
                borderWidth: 0,
                grow: true,
                content: [
                    {
                        type: 'Container',
                        props: {
                            ...containerDefaultProps,
                            grow: true,
                            padding: 0,
                            paddingExpanded: 'false',
                            backgroundColor: '#F5F0EA',
                            borderWidth: 0,
                            minHeight: 24,
                            overflow: 'hidden',
                            content: [{
                                type: 'Image',
                                props: {
                                    ...imageProps,
                                    width: 'full',
                                    height: 'auto',
                                    objectFit: 'cover',
                                    aspectRatio: '3/4',
                                    borderWidth: 0,
                                }
                            }]
                        }
                    },
                    {
                        type: 'Container',
                        props: {
                            ...containerDefaultProps,
                            flexDirection: 'flex-col',
                            mainAxisLayout: 'center',
                            altAxisLayout: 'start',
                            gapX: 0,
                            gapY: 3,
                            padding: 0,
                            paddingExpanded: 'true',
                            paddingTop: 6,
                            paddingBottom: 6,
                            paddingLeft: 4,
                            paddingRight: 4,
                            backgroundColor: '#ffffff',
                            borderWidth: 0,
                            grow: true,
                            content: [
                                {
                                    type: 'CustomizableText',
                                    props: {
                                        ...customTextProps,
                                        text: 'About the Artist',
                                        fontSize: 0.7,
                                        fontWeight: 700,
                                        letterSpacing: 3,
                                        color: '#C9974A',
                                        textTransform: 'uppercase',
                                    }
                                },
                                {
                                    type: 'HeadingTwo',
                                    props: {
                                        text: 'Hello, I\'m Your Stylist',
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
                                        text: 'With years of experience in natural hair care and styling, I bring artistry and intention to every appointment. My studio is a space where you can relax, express yourself, and leave feeling your best.',
                                        color: '#6F6863',
                                        fontFamily: 'Roboto',
                                        letterSpacing: 0,
                                        lineHeight: 1.7,
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
                                    type: 'Button',
                                    props: {
                                        ...buttonProps,
                                        text: 'Book a Session',
                                        action: 'REDIRECT',
                                        link: '/',
                                        backgroundColor: '#1A1818',
                                        color: '#ffffff',
                                        borderWidth: 0,
                                        borderRadius: 6,
                                        padding: 0,
                                        paddingExpanded: 'true',
                                        paddingTop: 0.8,
                                        paddingBottom: 0.8,
                                        paddingLeft: 2,
                                        paddingRight: 2,
                                        fontSize: 0.95,
                                        fontFamily: 'Roboto',
                                        grow: false,
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }]
    },
    render: ({ content: Content }: { content: SlotComponent }) => {
        return (
            <div style={{ width: '100%' }}>
                <Content />
            </div>
        )
    }
}
