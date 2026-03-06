// Regular Components

import { ButtonContainer, ColumnLayout, Container, GridLayout, HeroSection, ImageComponent, Navbar, RegularText, RowLayout, Section, VideoComponent } from "./types";

// Container
export const containerDefaultProps: Container = {
    rotation: 0,
    gapX: 0,
    grow: true,
    gapY: 0,
    draggable: true,
    padding: 2,
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
    paddingBottom: 2,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 2,
    backgroundColor: '#f7f7f7ff',
    content: [],
    borderColor: '#000000',
    borderRadius: 0,
    borderWidth: 0,
    borderBottom: 0,
    borderExpanded: 'false',
    borderLeft: 0,
    borderRight: 0,
    borderTop: 0,
    borderType: 'solid',
    positionType: 'relative',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    responsive: true,
    flexDirection: 'flex-row',
    mainAxisLayout: 'start',
    altAxisLayout: 'start'
}
// Column
export const columnProps: ColumnLayout = {
    columns: [{ column: [] }, { column: [] }],
    numberOfColumns: 2,
    gap: 10,
    alignItems: 'stretch'
}
// Row
export const rowProps: RowLayout = {
    rows: [{ row: [] }, { row: [] }],
    numberOfRows: 2,
    gap: 10,
    justifyItems: 'stretch'
}
// Grid
export const gridProps: GridLayout = {
    cells: [{ cell: [] }, { cell: [] }, { cell: [] }, { cell: [] }],
    numberOfRows: 2,
    numberOfColumns: 2,
    gapX: 10,
    gapY: 10,
    justifyItems: 'stretch',
    alignItems: 'stretch'
}
// Section
export const sectionProps: Section = {
    section: [],
    sectionName: null
}
// Image
export const imageProps: ImageComponent = {
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
}
// Video
export const videoProps: VideoComponent = {
    url: 'https://www.youtube.com/watch?v=gTgrHPax0hk&t=1025s&ab_channel=Dream',
    width: 450,
    height: 250,
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
    autoPlay: true,
    controls: true,
    speed: 1,
    loop: false
}
// CustomText
export const customTextProps: RegularText = {
    text: 'Type here...',
    fontSize: 1,
    fontWeight: 400,
    letterSpacing: 1.2,
    lineHeight: 1.5,
    align: 'start',
    style: [],
    color: '#000000',
    fontFamily: 'Roboto',
    isLink: false,
    linkType: 'external',
    sections: "",
    url: ""
}
// Button
export const buttonProps: ButtonContainer = {
    grow: false,
    rotation: 0,
    action: 'REDIRECT',
    draggable: true,
    text: 'Click me',
    link: "https://afroallure.co/",
    fontSize: 1.1,
    fontWeight: 400,
    letterSpacing: 1.8,
    lineHeight: 1.5,
    color: '#000000',
    style: [],
    fontFamily: 'Inter',
    align: 'start',
    gapX: 0,
    variant: 'solid',
    gapY: 0,
    padding: 2,
    borderRadiusExpanded: 'false',
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
    backgroundColor: '#d2d2d2',
    borderColor: '#000000',
    borderRadius: 8,
    borderWidth: 1,
    borderBottom: 0,
    borderExpanded: 'false',
    borderLeft: 0,
    borderRight: 0,
    borderTop: 0,
    borderType: 'solid',
    positionType: 'relative',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    responsive: true,
    flexDirection: 'flex-row',
    mainAxisLayout: 'start',
    altAxisLayout: 'start',
}


// Prebuilt Components

// Navbar
export const navbarProps: Navbar = {
    variants: 'default',
    logo: [{
        type: 'Container',
        props: {
            borderWidth: 0,
            backgroundColor: '#fff',
            padding: 0,
            content: [
                {
                    type: 'HeadingOne',
                    props: {
                        text: "LOGO",
                        color: '#000000',
                        fontFamily: 'Roboto',
                        letterSpacing: 1.2,
                        lineHeight: 1.5,
                        align: 'start',
                        style: [],
                        isLink: false,
                        sections: "",
                        url: "",
                        linkType: 'external'
                    }
                }
            ]
        }
    }],
    menu: [
        {
            item: [{
                type: 'Button',
                props: {
                    ...buttonProps,
                    action: 'REDIRECT',
                    text: 'About Business',
                    link: "https://beta.afroallure.co/",
                    padding: 0,
                    paddingExpanded: 'false',
                    backgroundColor: '#fff',
                    borderWidth: 0,
                    borderRadius: 0,
                    fontSize: 1,
                },
            }]
        },
        {
            item: [{

                type: 'Button',
                props: {
                    ...buttonProps,
                    action: 'REDIRECT',
                    text: 'Gallery',
                    link: "https://beta.afroallure.co/",
                    padding: 0,
                    paddingExpanded: 'false',
                    backgroundColor: '#fff',
                    borderWidth: 0,
                    borderRadius: 0,
                    fontSize: 1,
                },
            }]
        },
        {
            item: [{

                type: 'Button',
                props: {
                    ...buttonProps,
                    action: 'REDIRECT',
                    text: 'Services',
                    link: "https://beta.afroallure.co/",
                    padding: 0,
                    paddingExpanded: 'false',
                    backgroundColor: '#fff',
                    borderWidth: 0,
                    borderRadius: 0,
                    fontSize: 1,
                },
            }]
        },
        {
            item: [{

                type: 'Button',
                props: {
                    ...buttonProps,
                    action: 'REDIRECT',
                    text: 'Policies and Conditions',
                    link: "https://beta.afroallure.co/",
                    padding: 0,
                    paddingExpanded: 'false',
                    backgroundColor: '#fff',
                    borderWidth: 0,
                    borderRadius: 0,
                    fontSize: 1,

                },
            }]
        },
        {
            item: [{
                type: 'Button',
                props: {
                    ...buttonProps,
                    action: 'REDIRECT',
                    text: 'Contact',
                    link: "https://beta.afroallure.co/",
                    padding: 0,
                    paddingExpanded: 'false',
                    backgroundColor: '#fff',
                    borderWidth: 0,
                    borderRadius: 0,
                    fontSize: 1,

                },

            }
            ]
        },

    ],

    content: [
        {
            type: 'Container',
            props: {
                padding: 0,
                margin: 0,
                marginExpanded: false,
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                paddingExpanded: true,
                paddingRight: 2,
                paddingLeft: 2,
                paddingTop: 1.5,
                paddingBottom: 1.5,
                mainAxisLayout: 'space-between',
                altAxisLayout: 'center',
                borderWidth: 0,
                backgroundColor: '#fff',
                content: [

                    {
                        type: 'Container',
                        props: {

                            content: []
                        }
                    }
                ]
            }
        }
    ]
}
// Hero Section
export const heroSectionProps: HeroSection = {
    sectionOne: [{
        type: 'Container',
        props: {
            ...containerDefaultProps,
            padding: 2,
            margin: 0,
            marginExpanded: false,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            paddingExpanded: false,
            paddingRight: 2,
            paddingLeft: 2,
            paddingTop: 2,
            paddingBottom: 2,
            flexDirection: 'flex-col',
            mainAxisLayout: 'center',
            altAxisLayout: 'start',
            borderWidth: 0,
            gap: 10,
            backgroundColor: '#fff',
            content: [{
                type: 'HeadingOne',
                props: {
                    text: 'Title',

                }
            }, {
                type: 'BodyMedium',
                props: {
                    text: 'In ullamco cupidatat ea reprehenderit. Nisi esse commodo esse dolore veniam elit. Nisi elit eu proident ea pariatur est. Amet do amet sint aliquip eu aute velit esse mollit non. Ut quis dolor non adipisicing.'
                }
            },
            {
                type: 'Button',
                props: {
                    text: 'Call to Action'
                }
            }]
        }
    }],
    sectionTwo: []
}
// About Section
// Card
// Footer
