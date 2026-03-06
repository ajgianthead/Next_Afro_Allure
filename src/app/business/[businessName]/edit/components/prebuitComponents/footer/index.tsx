'use client'


import { SlotComponent } from "@puckeditor/core";
import { footerFields } from "./fields";

export const FooterComponent: any = {
    fields: footerFields,
    defaultProps: {
        footer: [{
            type: 'Container',
            props: {
                content: [
                    {
                        type: "Container",
                        props: {
                            content: [
                                {
                                    type: "Container",
                                    props: {
                                        content: [
                                            {
                                                type: "Image",
                                                props: {
                                                    url: "https://jappbqntqogmnoluifzx.supabase.co/storage/v1/object/public/editor-media-pool/placeholder_photo.jpg",
                                                    width: 200,
                                                    borderColor: "#000000",
                                                    borderRadius: 8,
                                                    borderWidth: 0,
                                                    borderType: "solid",
                                                    positionType: "relative",
                                                    left: 0,
                                                    right: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    borderRadiusTopLeft: 0,
                                                    borderRadiusTopRight: 0,
                                                    borderRadiusBottomLeft: 0,
                                                    borderRadiusBottomRight: 0,
                                                    borderBottom: 0,
                                                    borderExpanded: "false",
                                                    borderLeft: 0,
                                                    borderRadiusExpanded: "false",
                                                    borderRight: 0,
                                                    borderTop: 0
                                                }
                                            }
                                        ],
                                        rotation: 0,
                                        gapX: 0,
                                        grow: false,
                                        gapY: 0,
                                        draggable: true,
                                        padding: 2,
                                        borderRadiusExpanded: "false",
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
                                        paddingBottom: 2,
                                        paddingLeft: 2,
                                        paddingRight: 2,
                                        paddingTop: 2,
                                        backgroundColor: "#ffffff",
                                        borderColor: "#000000",
                                        borderRadius: 0,
                                        borderWidth: 0,
                                        borderBottom: 0,
                                        borderExpanded: "false",
                                        borderLeft: 0,
                                        borderRight: 0,
                                        borderTop: 0,
                                        borderType: "solid",
                                        positionType: "relative",
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        responsiv: true,
                                        flexDirectio: "flex-row",
                                        mainAxisLayou: "start",
                                        altAxisLayou: "start"
                                    }
                                },
                                {
                                    type: "Container",
                                    props: {
                                        content: [
                                            {
                                                type: "Column",
                                                props: {
                                                    columns: [
                                                        {
                                                            column: [
                                                                {
                                                                    type: "Row",
                                                                    props: {
                                                                        rows: [
                                                                            {
                                                                                row: [
                                                                                    {
                                                                                        type: "HeadingFour",
                                                                                        props: {
                                                                                            text: "Navigation",
                                                                                            color: "#000000",
                                                                                            fontFamily: "Roboto",
                                                                                            letterSpacing: 1.2,
                                                                                            lineHeight: 1.5,
                                                                                            align: "start",
                                                                                            style: []
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            },
                                                                            {
                                                                                row: [
                                                                                    {
                                                                                        type: "CustomizableText",
                                                                                        props: {
                                                                                            text: "About Stylist",
                                                                                            fontSize: 1,
                                                                                            fontWeight: 400,
                                                                                            letterSpacing: 1.2,
                                                                                            lineHeight: 1.5,
                                                                                            align: "start",
                                                                                            style: [],
                                                                                            color: "#000000",
                                                                                            fontFamily: "Roboto"
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            },
                                                                            {
                                                                                row: [
                                                                                    {
                                                                                        type: "CustomizableText",
                                                                                        props: {
                                                                                            text: "Terms and Conditions",
                                                                                            fontSize: 1,
                                                                                            fontWeight: 400,
                                                                                            letterSpacing: 1.2,
                                                                                            lineHeight: 1.5,
                                                                                            align: "start",
                                                                                            style: [],
                                                                                            color: "#000000",
                                                                                            fontFamily: "Roboto"
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            },
                                                                            {
                                                                                row: [
                                                                                    {
                                                                                        type: "CustomizableText",
                                                                                        props: {
                                                                                            text: "Services",
                                                                                            fontSize: 1,
                                                                                            fontWeight: 400,
                                                                                            letterSpacing: 1.2,
                                                                                            lineHeight: 1.5,
                                                                                            align: "start",
                                                                                            style: [],
                                                                                            color: "#000000",
                                                                                            fontFamily: "Roboto"
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ],
                                                                        numberOfRows: 4,
                                                                        gap: 10,
                                                                        justifyItems: "stretch"
                                                                    }
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            column: [
                                                                {
                                                                    type: "Row",
                                                                    props: {
                                                                        rows: [
                                                                            {
                                                                                row: [
                                                                                    {
                                                                                        type: "HeadingFour",
                                                                                        props: {
                                                                                            text: "Socials",
                                                                                            color: "#000000",
                                                                                            fontFamily: "Roboto",
                                                                                            letterSpacing: 1.2,
                                                                                            lineHeight: 1.5,
                                                                                            align: "start",
                                                                                            style: []
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            },
                                                                            {
                                                                                row: [
                                                                                    {
                                                                                        type: "CustomizableText",
                                                                                        props: {
                                                                                            text: "Instagram",
                                                                                            fontSize: 1,
                                                                                            fontWeight: 400,
                                                                                            letterSpacing: 1.2,
                                                                                            lineHeight: 1.5,
                                                                                            align: "start",
                                                                                            style: [],
                                                                                            color: "#000000",
                                                                                            fontFamily: "Roboto"
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            },
                                                                            {
                                                                                row: [
                                                                                    {
                                                                                        type: "CustomizableText",
                                                                                        props: {
                                                                                            text: "Facebook",
                                                                                            fontSize: 1,
                                                                                            fontWeight: 400,
                                                                                            letterSpacing: 1.2,
                                                                                            lineHeight: 1.5,
                                                                                            align: "start",
                                                                                            style: [],
                                                                                            color: "#000000",
                                                                                            fontFamily: "Roboto"
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ],
                                                                        numberOfRows: 3,
                                                                        gap: 10,
                                                                        justifyItems: "stretch"
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ],
                                                    numberOfColumns: 2,
                                                    gap: 100,
                                                    alignItems: "stretch"
                                                }
                                            }
                                        ],
                                        rotation: 0,
                                        gapX: 0,
                                        grow: false,
                                        gapY: 0,
                                        draggable: true,
                                        padding: 2,
                                        borderRadiusExpanded: "false",
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
                                        paddingBottom: 2,
                                        paddingLeft: 2,
                                        paddingRight: 2,
                                        paddingTop: 2,
                                        backgroundColor: "#ffffff",
                                        borderColor: "#000000",
                                        borderRadius: 0,
                                        borderWidth: 0,
                                        borderBottom: 0,
                                        borderExpanded: "false",
                                        borderLeft: 0,
                                        borderRight: 0,
                                        borderTop: 0,
                                        borderType: "solid",
                                        positionType: "relative",
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        responsive: true,
                                        flexDirection: "flex-row",
                                        mainAxisLayout: "start",
                                        altAxisLayout: "start"
                                    }
                                }
                            ],
                            rotation: 0,
                            gapX: 0,
                            grow: true,
                            gapY: 0,
                            draggable: true,
                            padding: 2,
                            borderRadiusExpanded: "false",
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
                            paddingBottom: 2,
                            paddingLeft: 2,
                            paddingRight: 2,
                            paddingTop: 2,
                            backgroundColor: "#ffffff",
                            borderColor: "#000000",
                            borderRadius: 0,
                            borderWidth: 0,
                            borderBottom: 0,
                            borderExpanded: "false",
                            borderLeft: 0,
                            borderRight: 0,
                            borderTop: 0,
                            borderType: "solid",
                            positionType: "relative",
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            responsive: true,
                            flexDirection: "flex-row",
                            mainAxisLayout: "space-evenly",
                            altAxisLayout: "center"
                        }
                    },
                    {
                        type: "Container",
                        props: {
                            content: [
                                {
                                    type: "CustomizableText",
                                    props: {
                                        text: "©Copyright 2026",
                                        fontSize: 1,
                                        fontWeight: 400,
                                        letterSpacing: 1.2,
                                        lineHeight: 1.5,
                                        align: "start",
                                        style: [],
                                        color: "#00000059",
                                        fontFamily: "Roboto"
                                    }
                                }
                            ],
                            rotation: 0,
                            gapX: 0,
                            grow: true,
                            gapY: 0,
                            draggable: true,
                            padding: 2,
                            borderRadiusExpanded: "false",
                            borderRadiusTopLeft: 0,
                            borderRadiusTopRight: 0,
                            borderRadiusBottomLeft: 0,
                            borderRadiusBottomRight: 0,
                            paddingExpanded: "true",
                            marginExpanded: "false",
                            marginBottom: 0,
                            marginLeft: 0,
                            marginRight: 0,
                            marginTop: 0,
                            margin: 0,
                            paddingBottom: 1,
                            paddingLeft: 2,
                            paddingRight: 2,
                            paddingTop: 1,
                            backgroundColor: "#ffffff",
                            borderColor: "#000000",
                            borderRadius: 0,
                            borderWidth: 0,
                            borderBottom: 0,
                            borderExpanded: "false",
                            borderLeft: 0,
                            borderRight: 0,
                            borderTop: 0,
                            borderType: "solid",
                            positionType: "relative",
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            responsive: true,
                            flexDirection: "flex-row",
                            mainAxisLayout: "center",
                            altAxisLayout: "start"
                        }
                    }
                ],
                rotation: 0,
                gapX: 0,
                gapY: 0,
                draggable: true,
                padding: 2,
                borderRadiusExpanded: "false",
                borderRadiusTopLeft: 0,
                borderRadiusTopRight: 0,
                borderRadiusBottomLeft: 0,
                borderRadiusBottomRight: 0,
                paddingExpanded: "true",
                marginExpanded: "true",
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                margin: 0,
                paddingBottom: 1,
                paddingLeft: 2,
                paddingRight: 2,
                paddingTop: 1,
                backgroundColor: "#ffffff",
                borderColor: "#000000",
                borderRadius: 0,
                borderWidth: 0,
                borderBottom: 0,
                borderExpanded: "false",
                borderLeft: 0,
                borderRight: 0,
                borderTop: 0,
                borderType: "solid",
                positionType: "relative",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                responsive: true,
                flexDirection: "flex-col",
                mainAxisLayout: "start",
                altAxisLayout: "start",
                grow: true
            }
        }]
    },
    render: (({ footer: Footer }: { footer: SlotComponent }) => {
        return <div>
            <Footer />
        </div>
    })
}
