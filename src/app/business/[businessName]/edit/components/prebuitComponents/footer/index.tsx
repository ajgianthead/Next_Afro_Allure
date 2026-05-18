'use client'

import { SlotComponent } from "@puckeditor/core";
import { footerFields } from "./fields";
import { buttonProps, containerDefaultProps, customTextProps } from "../../defaultStyles";

const footerBtnProps = {
    ...buttonProps,
    action: 'REDIRECT',
    link: '/',
    backgroundColor: 'transparent',
    color: '#ffffff',
    borderWidth: 0,
    borderRadius: 0,
    padding: 0,
    paddingExpanded: 'false',
    fontSize: 0.85,
    fontFamily: 'Roboto',
    grow: false,
}

export const FooterComponent: any = {
    fields: footerFields,
    defaultProps: {
        footer: [{
            type: 'Container',
            props: {
                ...containerDefaultProps,
                flexDirection: 'flex-col',
                mainAxisLayout: 'start',
                altAxisLayout: 'stretch',
                gapX: 0,
                gapY: 0,
                padding: 0,
                paddingExpanded: 'true',
                paddingTop: 4,
                paddingBottom: 3,
                paddingLeft: 5,
                paddingRight: 5,
                backgroundColor: '#1A1818',
                borderWidth: 0,
                grow: true,
                responsiveDirection: 'none',
                content: [
                    {
                        type: 'Container',
                        props: {
                            ...containerDefaultProps,
                            flexDirection: 'flex-row',
                            mainAxisLayout: 'space-between',
                            altAxisLayout: 'start',
                            gapX: 0,
                            gapY: 0,
                            padding: 0,
                            paddingExpanded: 'true',
                            paddingBottom: 4,
                            paddingTop: 0,
                            paddingLeft: 0,
                            paddingRight: 0,
                            backgroundColor: 'transparent',
                            borderWidth: 0,
                            grow: true,
                            content: [
                                {
                                    type: 'Container',
                                    props: {
                                        ...containerDefaultProps,
                                        flexDirection: 'flex-col',
                                        mainAxisLayout: 'start',
                                        altAxisLayout: 'start',
                                        gapX: 0,
                                        gapY: 1,
                                        padding: 0,
                                        paddingExpanded: 'false',
                                        backgroundColor: 'transparent',
                                        borderWidth: 0,
                                        grow: false,
                                        responsiveDirection: 'none',
                                        content: [
                                            {
                                                type: 'HeadingThree',
                                                props: {
                                                    text: 'BRAND',
                                                    color: '#ffffff',
                                                    fontFamily: 'Roboto',
                                                    letterSpacing: 3,
                                                    lineHeight: 1,
                                                    align: 'start',
                                                    style: [],
                                                    isLink: false,
                                                    linkType: 'external',
                                                    url: '',
                                                    sections: '',
                                                    textTransform: 'uppercase',
                                                    size: 'md',
                                                }
                                            },
                                            {
                                                type: 'BodySmall',
                                                props: {
                                                    text: 'Styled for you.',
                                                    color: 'rgba(255,255,255,0.45)',
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
                                            }
                                        ]
                                    }
                                },
                                {
                                    type: 'Container',
                                    props: {
                                        ...containerDefaultProps,
                                        flexDirection: 'flex-row',
                                        mainAxisLayout: 'start',
                                        altAxisLayout: 'start',
                                        gapX: 6,
                                        gapY: 0,
                                        padding: 0,
                                        paddingExpanded: 'false',
                                        backgroundColor: 'transparent',
                                        borderWidth: 0,
                                        grow: false,
                                        content: [
                                            {
                                                type: 'Container',
                                                props: {
                                                    ...containerDefaultProps,
                                                    flexDirection: 'flex-col',
                                                    mainAxisLayout: 'start',
                                                    altAxisLayout: 'start',
                                                    gapX: 0,
                                                    gapY: 1.5,
                                                    padding: 0,
                                                    paddingExpanded: 'false',
                                                    backgroundColor: 'transparent',
                                                    borderWidth: 0,
                                                    grow: false,
                                                    responsiveDirection: 'none',
                                                    content: [
                                                        {
                                                            type: 'CustomizableText',
                                                            props: {
                                                                ...customTextProps,
                                                                text: 'Navigate',
                                                                fontSize: 0.65,
                                                                fontWeight: 700,
                                                                letterSpacing: 2.5,
                                                                color: 'rgba(255,255,255,0.4)',
                                                                textTransform: 'uppercase',
                                                            }
                                                        },
                                                        { type: 'Button', props: { ...footerBtnProps, text: 'About' } },
                                                        { type: 'Button', props: { ...footerBtnProps, text: 'Services' } },
                                                        { type: 'Button', props: { ...footerBtnProps, text: 'Policies' } },
                                                    ]
                                                }
                                            },
                                            {
                                                type: 'Container',
                                                props: {
                                                    ...containerDefaultProps,
                                                    flexDirection: 'flex-col',
                                                    mainAxisLayout: 'start',
                                                    altAxisLayout: 'start',
                                                    gapX: 0,
                                                    gapY: 1.5,
                                                    padding: 0,
                                                    paddingExpanded: 'false',
                                                    backgroundColor: 'transparent',
                                                    borderWidth: 0,
                                                    grow: false,
                                                    responsiveDirection: 'none',
                                                    content: [
                                                        {
                                                            type: 'CustomizableText',
                                                            props: {
                                                                ...customTextProps,
                                                                text: 'Connect',
                                                                fontSize: 0.65,
                                                                fontWeight: 700,
                                                                letterSpacing: 2.5,
                                                                color: 'rgba(255,255,255,0.4)',
                                                                textTransform: 'uppercase',
                                                            }
                                                        },
                                                        { type: 'Button', props: { ...footerBtnProps, text: 'Instagram' } },
                                                        { type: 'Button', props: { ...footerBtnProps, text: 'Facebook' } },
                                                        { type: 'Button', props: { ...footerBtnProps, text: 'TikTok' } },
                                                    ]
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
                            flexDirection: 'flex-row',
                            mainAxisLayout: 'center',
                            altAxisLayout: 'center',
                            gapX: 0,
                            gapY: 0,
                            padding: 0,
                            paddingExpanded: 'true',
                            paddingTop: 3,
                            paddingBottom: 0,
                            paddingLeft: 0,
                            paddingRight: 0,
                            backgroundColor: 'transparent',
                            borderTop: 1,
                            borderExpanded: 'true',
                            borderBottom: 0,
                            borderLeft: 0,
                            borderRight: 0,
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderType: 'solid',
                            borderWidth: 0,
                            grow: true,
                            content: [{
                                type: 'CustomizableText',
                                props: {
                                    ...customTextProps,
                                    text: '© 2025 Your Brand. All rights reserved.',
                                    fontSize: 0.8,
                                    fontWeight: 400,
                                    letterSpacing: 0,
                                    color: 'rgba(255,255,255,0.3)',
                                    align: 'center',
                                }
                            }]
                        }
                    }
                ]
            }
        }]
    },
    render: ({ footer: Footer }: { footer: SlotComponent }) => {
        return (
            <div style={{ width: '100%' }}>
                <Footer />
            </div>
        )
    }
}
