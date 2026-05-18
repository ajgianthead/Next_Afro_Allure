'use client'

import { SlotComponent } from "@puckeditor/core"
import { heroSectionFields } from "./fields"
import { buttonProps, containerDefaultProps, customTextProps, imageProps } from "../../defaultStyles"

export const HeroSectionComponent: any = {
    fields: heroSectionFields,
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
                minHeight: 28,
                content: [
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
                            responsiveDirection: 'none',
                            content: [
                                {
                                    type: 'CustomizableText',
                                    props: {
                                        ...customTextProps,
                                        text: 'Your Story',
                                        fontSize: 0.7,
                                        fontWeight: 700,
                                        letterSpacing: 3,
                                        color: '#C9974A',
                                        textTransform: 'uppercase',
                                    }
                                },
                                {
                                    type: 'HeadingOne',
                                    props: {
                                        text: 'Crafted For You.',
                                        color: '#1A1818',
                                        fontFamily: 'Roboto',
                                        letterSpacing: 0,
                                        lineHeight: 1.1,
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
                                        text: 'Step into luxury. Every appointment is tailored to bring your vision to life.',
                                        color: '#6F6863',
                                        fontFamily: 'Roboto',
                                        letterSpacing: 0,
                                        lineHeight: 1.6,
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
                                    type: 'Container',
                                    props: {
                                        ...containerDefaultProps,
                                        flexDirection: 'flex-row',
                                        mainAxisLayout: 'start',
                                        altAxisLayout: 'center',
                                        gapX: 2,
                                        gapY: 0,
                                        padding: 0,
                                        paddingExpanded: 'false',
                                        backgroundColor: 'transparent',
                                        borderWidth: 0,
                                        grow: false,
                                        content: [
                                            {
                                                type: 'Button',
                                                props: {
                                                    ...buttonProps,
                                                    text: 'Book Now',
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
                                                }
                                            },
                                            {
                                                type: 'Button',
                                                props: {
                                                    ...buttonProps,
                                                    text: 'Learn More',
                                                    action: 'REDIRECT',
                                                    link: '/',
                                                    backgroundColor: 'transparent',
                                                    color: '#1A1818',
                                                    borderWidth: 1,
                                                    borderColor: '#1A1818',
                                                    borderRadius: 6,
                                                    padding: 0,
                                                    paddingExpanded: 'true',
                                                    paddingTop: 0.8,
                                                    paddingBottom: 0.8,
                                                    paddingLeft: 2,
                                                    paddingRight: 2,
                                                    fontSize: 0.95,
                                                    fontFamily: 'Roboto',
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        type: 'Container',
                        props: {
                            ...containerDefaultProps,
                            grow: true,
                            padding: 0,
                            paddingExpanded: 'false',
                            backgroundColor: '#F5F0EA',
                            borderWidth: 0,
                            minHeight: 28,
                            overflow: 'hidden',
                            content: [{
                                type: 'Image',
                                props: {
                                    ...imageProps,
                                    width: 'full',
                                    height: 'auto',
                                    objectFit: 'cover',
                                    aspectRatio: '4/5',
                                    borderWidth: 0,
                                }
                            }]
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
