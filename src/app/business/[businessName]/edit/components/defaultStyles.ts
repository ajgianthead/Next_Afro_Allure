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
    altAxisLayout: 'start',
    aspectRatio: '',
    overflow: 'visible',
    minHeight: 0,
    maxWidth: 0,
    gridTemplateColumns: '',
    responsiveDirection: 'col-to-row',
    hideBelow: 'none',
    hideAbove: 'none',
    zIndex: 0,
    spacing: 'normal',
}
// Column
export const columnProps: ColumnLayout = {
    columns: [{ column: [] }, { column: [] }],
    numberOfColumns: 2,
    gap: 10,
    alignItems: 'stretch',
    mobileLayout: 'stack',
}
// Row
export const rowProps: RowLayout = {
    rows: [{ row: [] }, { row: [] }],
    numberOfRows: 2,
    gap: 10,
    justifyItems: 'stretch',
    mobileLayout: 'stack',
}
// Grid
export const gridProps: GridLayout = {
    cells: [{ cell: [] }, { cell: [] }, { cell: [] }, { cell: [] }],
    numberOfRows: 2,
    numberOfColumns: 2,
    gapX: 10,
    gapY: 10,
    justifyItems: 'stretch',
    alignItems: 'stretch',
    firstCellRowSpan: 1,
    firstCellColumnSpan: 1,
    mobileColumns: 1,
}
// Section
export const sectionProps: Section = {
    section: [],
    sectionName: null
}
// Image
export const imageProps: ImageComponent = {
    url: 'https://jappbqntqogmnoluifzx.supabase.co/storage/v1/object/public/editor-media-pool/placeholder_photo.jpg',
    alt: '',
    width: 'full',
    objectFit: 'cover',
    height: 'auto',
    aspectRatio: '',
    mobileVisibility: 'show',
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
    objectFit: 'fill',
    aspectRatio: '',
    mobileVisibility: 'show',
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
    loop: false,
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
    url: "",
    textTransform: 'none',
    maxWidth: 0,
    size: 'md',
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
    textTransform: 'none',
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
    aspectRatio: '',
    overflow: 'visible',
    minHeight: 0,
    maxWidth: 0,
    gridTemplateColumns: '',
    responsiveDirection: 'none',
    hideBelow: 'none',
    hideAbove: 'none',
    zIndex: 0,
    spacing: 'none',
    mobileWidth: 'full',
    size: 'md',
}


// Prebuilt Components

// Navbar
export const navbarProps: Navbar = {
    logo: [{
        type: 'Container',
        props: {
            ...containerDefaultProps,
            grow: false,
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            paddingExpanded: 'false',
            paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0,
            flexDirection: 'flex-row',
            altAxisLayout: 'center',
            content: [{
                type: 'HeadingThree',
                props: {
                    text: 'BRAND',
                    color: '#1A1818',
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
            }]
        }
    }],
    menu: [
        {
            item: [{
                type: 'Button',
                props: {
                    ...buttonProps,
                    action: 'REDIRECT',
                    text: 'Home',
                    link: '/',
                    backgroundColor: 'transparent',
                    color: '#1A1818',
                    borderWidth: 0,
                    borderRadius: 0,
                    padding: 0,
                    paddingExpanded: 'false',
                    fontSize: 0.9,
                    fontFamily: 'Roboto',
                }
            }]
        },
        {
            item: [{
                type: 'Button',
                props: {
                    ...buttonProps,
                    action: 'REDIRECT',
                    text: 'Services',
                    link: '/',
                    backgroundColor: 'transparent',
                    color: '#1A1818',
                    borderWidth: 0,
                    borderRadius: 0,
                    padding: 0,
                    paddingExpanded: 'false',
                    fontSize: 0.9,
                    fontFamily: 'Roboto',
                }
            }]
        },
        {
            item: [{
                type: 'Button',
                props: {
                    ...buttonProps,
                    action: 'REDIRECT',
                    text: 'Book Now',
                    link: '/',
                    backgroundColor: '#1A1818',
                    color: '#ffffff',
                    borderWidth: 0,
                    borderRadius: 6,
                    padding: 0,
                    paddingExpanded: 'true',
                    paddingTop: 0.6,
                    paddingBottom: 0.6,
                    paddingLeft: 1.5,
                    paddingRight: 1.5,
                    fontSize: 0.9,
                    fontFamily: 'Roboto',
                }
            }]
        },
    ],
}
// Hero Section
export const heroSectionProps: HeroSection = {
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
}
// About Section
// Card
// Footer
