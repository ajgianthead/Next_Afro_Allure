// Every section the builder offers, in the order the section picker shows them.

import type { SectionType } from '../types'
import type { SectionDefinition } from './types'
import { AboutSection } from './about'
import { FooterSection } from './footer'
import { GallerySection } from './gallery'
import { HeroSection } from './hero'
import { NavbarSection } from './navbar'
import { ServicesSection } from './services'

export const SECTIONS: SectionDefinition[] = [
    NavbarSection,
    HeroSection,
    AboutSection,
    ServicesSection,
    GallerySection,
    FooterSection,
]

export const SECTION_BY_TYPE = Object.fromEntries(SECTIONS.map(s => [s.type, s])) as Partial<Record<SectionType, SectionDefinition>>
