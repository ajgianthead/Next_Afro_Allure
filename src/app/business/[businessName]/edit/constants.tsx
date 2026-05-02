import { Box, Columns, Grid2X2, Heading, ImageIcon, Layers, MousePointerClick, Rows, Type, Video } from "lucide-react";
import type { Config, Slot } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { CardComponent } from "./components/prebuitComponents/card";
import { HeroSectionComponent } from "./components/prebuitComponents/heroSection";
import { AboutBusinessComponent } from "./components/prebuitComponents/aboutBusiness/index";
import { NavbarComponent } from "./components/prebuitComponents/navbar";
import { ButtonComponent } from "./components/button";
import { VideoComponent } from "./components/video";
import { ImageComponent } from "./components/image";
import { CustomizableTextComponent } from "./components/customizableText";
import { ContainerComponent } from "./components/container";
import { textPresetsComponents } from "./components/textPresets";
import { Components } from "./components/types";
import { ColumnLayoutComponent } from "./components/column";
import { RowLayoutComponent } from "./components/row";
import { GridLayoutComponent } from "./components/grid";
import { FooterComponent } from "./components/prebuitComponents/footer";
import { SectionComponent } from "./components/section";
import { LuxuryNavComponent } from "./components/templateSections/luxuryNav";
import { LuxuryHeroComponent } from "./components/templateSections/luxuryHero";
import { ServiceMenuComponent } from "./components/templateSections/serviceMenu";
import { PortfolioGalleryComponent } from "./components/templateSections/portfolioGallery";
import { AboutStylistComponent } from "./components/templateSections/aboutStylist";
import { ReviewsSectionComponent } from "./components/templateSections/reviewsSection";
import { BookingCTAComponent } from "./components/templateSections/bookingCta";
import { LuxuryFooterComponent } from "./components/templateSections/luxuryFooter";



// Create Puck component config
export const config: Config<Components> = {
    categories: {
        layout: {
            defaultExpanded: false,
            components: ['Container', 'Column', 'Row', 'Grid', 'Section'],
        },
        prebuilt: {
            title: 'Pre-built Components',
            components: ['Navbar', 'HeroSection', 'AboutBusiness', 'Card', 'Footer']
        },
        media: {
            defaultExpanded: false,
            components: ['Image', 'Video']
        },
        typography: {
            defaultExpanded: false,
            components: ['CustomizableText', 'HeadingOne', 'HeadingTwo', 'HeadingThree', 'HeadingFour', 'TitleLarge', 'TitleMedium', 'TitleSmall', 'BodyLarge', 'BodyMedium', 'BodySmall', 'BodyExtraSmall']
        },
        other: {
            title: 'Other',
            components: ['Button']
        },
        templates: {
            title: 'Template Sections',
            defaultExpanded: false,
            components: ['LuxuryNav', 'LuxuryHero', 'ServiceMenu', 'PortfolioGallery', 'AboutStylist', 'ReviewsSection', 'BookingCTA', 'LuxuryFooter']
        },
    },
    components: {
        Card: CardComponent,
        Column: ColumnLayoutComponent,
        Row: RowLayoutComponent,
        Grid: GridLayoutComponent,
        Section: SectionComponent,
        HeroSection: HeroSectionComponent,
        AboutBusiness: AboutBusinessComponent,
        Navbar: NavbarComponent,
        Footer: FooterComponent,
        Button: ButtonComponent,
        Video: VideoComponent,
        Image: ImageComponent,
        CustomizableText: CustomizableTextComponent,
        Container: ContainerComponent,
        LuxuryNav: LuxuryNavComponent,
        LuxuryHero: LuxuryHeroComponent,
        ServiceMenu: ServiceMenuComponent,
        PortfolioGallery: PortfolioGalleryComponent,
        AboutStylist: AboutStylistComponent,
        ReviewsSection: ReviewsSectionComponent,
        BookingCTA: BookingCTAComponent,
        LuxuryFooter: LuxuryFooterComponent,
        HeadingOne: textPresetsComponents.HeadingOne,
        HeadingTwo: textPresetsComponents.HeadingTwo,
        HeadingThree: textPresetsComponents.HeadingThree,
        HeadingFour: textPresetsComponents.HeadingFour,
        TitleLarge: textPresetsComponents.TitleLarge,
        TitleMedium: textPresetsComponents.TitleMedium,
        TitleSmall: textPresetsComponents.TitleSmall,
        BodyLarge: textPresetsComponents.BodyLarge,
        BodyMedium: textPresetsComponents.BodyMedium,
        BodySmall: textPresetsComponents.BodySmall,
        BodyExtraSmall: textPresetsComponents.BodyExtraSmall,
    },
};


export const drawerItemStyleProps = new Map<
    string,
    {
        icon: React.JSX.Element;
        fontLevel: string | undefined;
        label: string
    }
>([
    [
        "Navbar",
        {
            icon: <Layers className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Navbar'
        },
    ],
    [
        "HeroSection",
        {
            icon: <Layers className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Hero Section'
        },
    ],
    [
        "AboutBusiness",
        {
            icon: <Layers className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'About Section'
        },
    ],
    [
        "Footer",
        {
            icon: <Layers className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Footer'
        },
    ],
    [
        "Card",
        {
            icon: <Layers className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Card'
        },
    ],

    [
        "CustomizableText",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Customizable Text'
        },
    ],
    [
        "Button",
        {
            icon: <MousePointerClick className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Button'
        }
    ],
    [
        "Container",
        {
            icon: <Box className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Container'
        },
    ],
    [
        "Column",
        {
            icon: <Columns className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Column'
        },
    ],
    [
        "Row",
        {
            icon: <Rows className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Row'
        },
    ],
    [
        "Grid",
        {
            icon: <Grid2X2 className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Grid'
        },
    ],
    [
        "Section",
        {
            icon: <Grid2X2 className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Section'
        },
    ],
    [
        'Image',
        {
            icon: <ImageIcon className="text-slate-300" />,
            fontLevel: 'body-md',
            label: 'Image'
        }
    ],
    [
        'Video',
        {
            icon: <Video className="text-slate-300" />,
            fontLevel: 'body-md',
            label: 'Video'
        }
    ],
    ['LuxuryNav', { icon: <Layers className="text-slate-300" />, fontLevel: 'body-md', label: 'Luxury Nav' }],
    ['LuxuryHero', { icon: <Layers className="text-slate-300" />, fontLevel: 'body-md', label: 'Luxury Hero' }],
    ['ServiceMenu', { icon: <Layers className="text-slate-300" />, fontLevel: 'body-md', label: 'Service Menu' }],
    ['PortfolioGallery', { icon: <Layers className="text-slate-300" />, fontLevel: 'body-md', label: 'Portfolio Gallery' }],
    ['AboutStylist', { icon: <Layers className="text-slate-300" />, fontLevel: 'body-md', label: 'About Stylist' }],
    ['ReviewsSection', { icon: <Layers className="text-slate-300" />, fontLevel: 'body-md', label: 'Reviews Section' }],
    ['BookingCTA', { icon: <Layers className="text-slate-300" />, fontLevel: 'body-md', label: 'Booking CTA' }],
    ['LuxuryFooter', { icon: <Layers className="text-slate-300" />, fontLevel: 'body-md', label: 'Luxury Footer' }],
    [
        "HeadingOne",
        {
            icon: <Heading className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Heading 1'
        },
    ],
    [
        "HeadingTwo",
        {
            icon: <Heading className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Heading 2'
        },
    ],
    [
        "HeadingThree",
        {
            icon: <Heading className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Heading 3'
        },
    ],
    [
        "HeadingFour",
        {
            icon: <Heading className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Heading 4'
        },
    ],
    [
        "TitleLarge",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Title Large'
        },
    ],
    [
        "TitleMedium",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Title Medium'
        },
    ],
    [
        "TitleSmall",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Title Small'
        },
    ],
    [
        "BodyLarge",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Body Large'
        },
    ],
    [
        "BodyMedium",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Body Medium'
        },
    ],
    [
        "BodySmall",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Body Small'
        },
    ],
    [
        "BodyExtraSmall",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Body Extra Small'
        },
    ],
]);
