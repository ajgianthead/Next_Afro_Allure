import { TypographySystem } from "@mui/joy";
import { Box, ImageIcon, Layers, MousePointerClick, Type, Video } from "lucide-react";
import type { Config, Slot } from "@measured/puck";
import "@measured/puck/puck.css";
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



// Create Puck component config
export const config: Config<Components> = {
    categories: {
        layout: {
            defaultExpanded: false,
            components: ['Container'],
        },
        prebuilt: {
            title: 'Pre-built Components',
            components: ['Navbar', 'HeroSection', 'AboutBusiness',
                'Card',
                // 'Gallery',
                // 'CTA', 'Footer'
            ]
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
        }

    },
    components: {
        Card: CardComponent,
        HeroSection: HeroSectionComponent,
        AboutBusiness: AboutBusinessComponent,
        Navbar: NavbarComponent,
        Button: ButtonComponent,
        Video: VideoComponent,
        Image: ImageComponent,
        CustomizableText: CustomizableTextComponent,
        Container: ContainerComponent,
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
        fontLevel: keyof TypographySystem | "inherit" | undefined;
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
        "Gallery",
        {
            icon: <Layers className="text-slate-300" />,
            fontLevel: "body-md",
            label: 'Gallery'
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
    [
        "HeadingOne",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "h1",
            label: 'Heading 1'
        },
    ],
    [
        "HeadingTwo",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "h2",
            label: 'Heading 2'
        },
    ],
    [
        "HeadingThree",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "h3",
            label: 'Heading 3'
        },
    ],
    [
        "HeadingFour",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "h4",
            label: 'Heading 4'
        },
    ],
    [
        "TitleLarge",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "title-lg",
            label: 'Title Large'
        },
    ],
    [
        "TitleMedium",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "title-md",
            label: 'Title Medium'
        },
    ],
    [
        "TitleSmall",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "title-sm",
            label: 'Title Small'
        },
    ],
    [
        "BodyLarge",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-lg",
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
            fontLevel: "body-sm",
            label: 'Body Small'
        },
    ],
    [
        "BodyExtraSmall",
        {
            icon: <Type className="text-slate-300" />,
            fontLevel: "body-xs",
            label: 'Body Extra Small'
        },
    ],
]);
