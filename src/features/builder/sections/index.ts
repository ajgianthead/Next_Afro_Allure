// Every section the builder offers, in the order the section picker shows them.

import type { SectionType } from '../types'
import type { SectionDefinition } from './types'
import { AboutSection } from './about'
import { BookNowSection } from './booknow'
import { ContactSection } from './contact'
import { FaqSection } from './faq'
import { FooterSection } from './footer'
import { GallerySection } from './gallery'
import { HeroSection } from './hero'
import { HoursSection } from './hours'
import { NavbarSection } from './navbar'
import { OffersSection } from './offers'
import { PoliciesSection } from './policies'
import { ReviewsSection } from './reviews'
import { ServicesSection } from './services'
import { SpacerSection } from './spacer'

export const SECTIONS: SectionDefinition[] = [
    NavbarSection,
    HeroSection,
    AboutSection,
    ServicesSection,
    GallerySection,
    ReviewsSection,
    OffersSection,
    HoursSection,
    BookNowSection,
    PoliciesSection,
    ContactSection,
    FaqSection,
    FooterSection,
    SpacerSection,
]

export const SECTION_BY_TYPE = Object.fromEntries(SECTIONS.map(s => [s.type, s])) as Partial<Record<SectionType, SectionDefinition>>
