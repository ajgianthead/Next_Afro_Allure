import { Slot, SlotComponent } from "@puckeditor/core"

export interface Text {
    text: string
    fontFamily: string,
    color: string,
    lineHeight: number
    letterSpacing: number
    style?: string[]
    align: string,
    isLink: boolean
    linkType: string
    url: string
    sections: string
    textTransform: string
    size: string
}

export interface PreBuiltComponents {
    content: Slot
}

export interface Navbar {
    logo: Slot
    menu: {
        item: Slot
    }[]
}
export interface HeroSection {
    content: Slot
}
export interface About {
    content: Slot
}
export interface Gallery {
    gallery: Slot
}
export interface Card {
    variant: string
    cardCover: string
    cardContent: Slot
    imageSource: string | null
    videoSource: string
    linkToService: boolean,
    service: string
}
export interface Footer {
    footer: Slot
}
export interface CTA { }

export interface RegularText extends Text {
    fontSize: number
    fontWeight: number
    maxWidth: number
}

export interface ColumnLayout {
    columns: {
        column: Slot
    }[]
    alignItems: string
    numberOfColumns: number
    gap: number
    mobileLayout: string
}
export interface RowLayout {
    rows: {
        row: Slot
    }[]
    justifyItems: string
    numberOfRows: number
    gap: number
    mobileLayout: string
}
export interface GridLayout {
    alignItems: string // Aligns along the column
    justifyItems: string // Aligns along the row

    cells: {
        cell: Slot
    }[]

    numberOfRows: number
    numberOfColumns: number
    gapX: number
    gapY: number
    firstCellRowSpan: number
    firstCellColumnSpan: number
    mobileColumns: number
}

export interface Section {
    section: Slot
    sectionName: string | null
}
export interface Container {
    rotation: number
    grow: boolean
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
    mainAxisLayout: 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    altAxisLayout: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
    aspectRatio: string
    overflow: string
    minHeight: number
    maxWidth: number
    gridTemplateColumns: string
    responsiveDirection: string
    hideBelow: string
    hideAbove: string
    zIndex: number
    spacing: string
}

export interface ImageComponent {
    url: string | null
    alt: string
    width: string
    objectFit: string
    height: string
    aspectRatio: string
    mobileVisibility: string
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

export interface VideoComponent extends Omit<ImageComponent, 'width' | 'height' | 'alt'> {
    controls: boolean
    autoPlay: boolean
    speed: number
    loop: boolean
    width: number
    height: number
}

export interface HyperLink extends RegularText {
    url: string
    newTab: boolean
}

export interface ButtonContainer extends Omit<Container, 'content'>, Omit<RegularText, 'isLink' | 'sections' | 'url' | 'linkType'> {
    action: string
    link: string
    variant: string
    mobileWidth: string
}

export interface LuxuryNavProps {
    brandName: string
    ctaText: string
    nav1: string; nav2: string; nav3: string; nav4: string
    bgColor: string; textColor: string; borderColor: string
}

export interface LuxuryHeroProps {
    eyebrow: string
    headingLine1: string; headingLine2Italic: string; headingLine3Underline: string; headingLine4: string
    bodyText: string
    cta1Text: string; cta2Text: string
    heroImageUrl: string
    pressQuote: string
    stat1Value: string; stat1Label: string
    stat2Value: string; stat2Label: string
    stat3Value: string; stat3Label: string
    bgColor: string; textColor: string; mutedColor: string; borderColor: string
}

export interface ServiceMenuProps {
    eyebrow: string; heading: string; pricingNote: string
    services: { name: string; duration: string; price: number; desc: string }[]
    bgColor: string; textColor: string; mutedColor: string; borderColor: string
}

export interface PortfolioGalleryProps {
    eyebrow: string
    headingMain: string; headingItalic: string; headingSuffix: string
    archiveLinkText: string
    gallery: { imageUrl: string; tone: string; label: string }[]
    bgColor: string; textColor: string; mutedColor: string
}

export interface AboutStylistProps {
    eyebrow: string
    headingLine1: string; headingLine2: string; headingLine3Italic: string; headingLine3Suffix: string
    bio: string
    credential1: string; credential2: string; credential3: string
    portraitImageUrl: string
    bgColor: string; textColor: string; mutedColor: string; borderColor: string
}

export interface ReviewsSectionProps {
    eyebrow: string; heading: string
    reviews: { name: string; stars: number; body: string }[]
    bgColor: string; textColor: string; mutedTextColor: string; dividerColor: string
}

export interface BookingCTAProps {
    eyebrow: string
    headingLine1: string; headingLine2Italic: string
    bodyText: string; ctaText: string
    bgColor: string; textColor: string; mutedColor: string; borderColor: string
}

export interface LuxuryFooterProps {
    brandName: string
    addressLine1: string; addressLine2: string; addressLine3: string
    col1Heading: string; col1Items: { text: string }[]
    col2Heading: string; col2Items: { text: string }[]
    col3Heading: string; col3Items: { text: string }[]
    bgColor: string; textColor: string; mutedColor: string; borderColor: string
}

export interface Components {
    Column: ColumnLayout
    Row: RowLayout
    Grid: GridLayout
    Container: Container
    Section: Section
    Navbar: Navbar
    HeroSection: HeroSection
    AboutBusiness: About
    Card: Card
    Footer: Footer
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
    LuxuryNav: LuxuryNavProps
    LuxuryHero: LuxuryHeroProps
    ServiceMenu: ServiceMenuProps
    PortfolioGallery: PortfolioGalleryProps
    AboutStylist: AboutStylistProps
    ReviewsSection: ReviewsSectionProps
    BookingCTA: BookingCTAProps
    LuxuryFooter: LuxuryFooterProps
};
