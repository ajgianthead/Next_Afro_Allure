import { Slot } from "@measured/puck"

export interface Text {
    text: string
    fontFamily?: string,
    color: string,
}

export interface PreBuiltComponents {
    content: Slot
}

export interface Navbar extends PreBuiltComponents {
    logo: Slot
    menu: {
        item: Slot
    }[]
    variants: string
}
export interface HeroSection {
    sectionOne: Slot
    sectionTwo: Slot
}
export interface About {
    sectionOne: Slot,
    sectionTwo: Slot
}
export interface Gallery {
    gallery: Slot
}
export interface Card {
    card: Slot
}
export interface Footer {
    footer: Slot
}
export interface CTA { }

export interface RegularText extends Text {
    color: string
    fontSize: number
    fontWeight: number
    lineHeight: number
    letterSpacing: number
    style?: string[]
    align: 'start' | 'center' | 'end' | 'justify'

}

export interface Container {
    gapX: number
    gapY: number
    draggable: boolean
    content: Slot
    padding?: number
    paddingExpanded?: string
    paddingTop?: number
    paddingBottom?: number
    paddingRight?: number
    paddingLeft?: number
    marginTop?: number
    marginBottom?: number
    marginRight?: number
    marginLeft?: number
    marginExpanded?: string
    margin?: number
    backgroundColor: string
    responsive: boolean
    borderExpanded: string
    borderTop: number
    borderBottom: number
    borderLeft: number
    borderRight: number
    borderWidth: number
    borderRadius: number
    borderColor: string
    borderType: string
    borderRadiusExpanded: string
    borderRadiusTopLeft: number
    borderRadiusTopRight: number
    borderRadiusBottomLeft: number
    borderRadiusBottomRight: number
    positionType: "absolute" | "relative"
    left: number
    right: number
    top: number
    bottom: number,
    flexDirection: 'flex-col' | 'flex-row' | 'grid'
    numOfCols: number
    numOfRows: number
    mainAxisLayout: 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    altAxisLayout: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
}

export interface ImageComponent {
    url: string | null
    width: number
    borderExpanded: string
    borderWidth: number
    borderRadius: number
    borderTop: number
    borderBottom: number
    borderLeft: number
    borderRight: number
    borderColor: string
    borderType: string
    borderRadiusExpanded: string
    positionType: "absolute" | "relative"
    left: number
    right: number
    top: number
    bottom: number
    borderRadiusTopLeft: number
    borderRadiusTopRight: number
    borderRadiusBottomLeft: number
    borderRadiusBottomRight: number
}

export interface VideoComponent extends ImageComponent {
    controls: boolean
    autoPlay: boolean
    speed: number
    loop: boolean
}

export interface HyperLink extends RegularText {
    url: string
    newTab: boolean
}

export interface ButtonContainer extends Omit<Container, 'content'>, RegularText {
    action: string
    link: string
    variant: string
}

export interface Components {
    Container: Container
    Navbar: Navbar
    HeroSection: HeroSection
    AboutBusiness: About
    Card: Card
    // Gallery: Gallery
    // CTA: CTA
    // Footer: Footer
    CustomizableText: RegularText
    HeadingOne: Text
    HeadingTwo: Text
    HeadingThree: Text
    HeadingFour: Text
    TitleLarge: Text
    TitleMedium: Text
    TitleSmall: Text
    BodyLarge: Text
    BodyMedium: Text
    BodySmall: Text
    BodyExtraSmall: Text
    Image: ImageComponent
    Video: VideoComponent
    Button: ButtonContainer
};
