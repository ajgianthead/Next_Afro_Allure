import { ct, box, btn, img } from '@/features/editor/templates'
import type { Container, Section } from './types'

// A preset is a named starting point, not a lock-in — applying one just
// pre-fills props on the component that was just dropped; every value stays
// as editable afterward as if the stylist had set it by hand.

export interface ContainerPreset {
    id: string
    name: string
    preview: { bg: string; accent?: string }
    patch: Partial<Container>
}

// Container presets — flat prop patches applied on top of the component's
// existing defaults. Note: Container has no box-shadow or "margin: auto"
// centering prop yet (shadow is listed as future work), so "Floating Card"
// and "Clean Card" approximate depth/centering with what's available today
// (radius + maxWidth) rather than a real shadow — worth adding once a
// shadow field exists on Container.
export const CONTAINER_PRESETS: ContainerPreset[] = [
    {
        id: 'clean-card',
        name: 'Clean Card',
        preview: { bg: '#FFFFFF' },
        patch: {
            backgroundColor: '#FFFFFF',
            paddingExpanded: 'false', padding: 1.5,
            borderRadiusExpanded: 'false', borderRadius: 12,
            borderExpanded: 'false', borderWidth: 0,
        },
    },
    {
        id: 'colored-section',
        name: 'Colored Section',
        preview: { bg: '#FC6161' },
        patch: {
            backgroundColor: '#FC6161',
            paddingExpanded: 'true', paddingTop: 3, paddingBottom: 3, paddingLeft: 1.5, paddingRight: 1.5,
            borderRadiusExpanded: 'false', borderRadius: 0,
        },
    },
    {
        id: 'dark-banner',
        name: 'Dark Banner',
        preview: { bg: '#0F0E0E' },
        patch: {
            backgroundColor: '#0F0E0E',
            paddingExpanded: 'true', paddingTop: 3, paddingBottom: 3, paddingLeft: 1.5, paddingRight: 1.5,
            borderRadiusExpanded: 'false', borderRadius: 0,
        },
    },
    {
        id: 'soft-container',
        name: 'Soft Container',
        preview: { bg: '#FAF7F2' },
        patch: {
            backgroundColor: '#FAF7F2',
            paddingExpanded: 'false', padding: 2,
            borderRadiusExpanded: 'false', borderRadius: 16,
            borderExpanded: 'false', borderWidth: 1, borderColor: '#E8E2D6', borderType: 'solid',
        },
    },
    {
        id: 'full-width-strip',
        name: 'Full Width Strip',
        preview: { bg: '#FFFFFF' },
        patch: {
            backgroundColor: '#FFFFFF',
            paddingExpanded: 'true', paddingTop: 4, paddingBottom: 4, paddingLeft: 1.5, paddingRight: 1.5,
            borderRadiusExpanded: 'false', borderRadius: 0,
            width: 100, widthUnit: '%',
            borderExpanded: 'true', borderTop: 1, borderBottom: 1, borderColor: '#E8E2D6', borderType: 'solid',
        },
    },
    {
        id: 'floating-card',
        name: 'Floating Card',
        preview: { bg: '#FFFFFF' },
        patch: {
            backgroundColor: '#FFFFFF',
            paddingExpanded: 'false', padding: 2,
            borderRadiusExpanded: 'false', borderRadius: 16,
            maxWidth: 40,
        },
    },
]

export interface SectionPreset {
    id: string
    name: string
    preview: { bg: string }
    /** Full replacement for the Section's own slot content + name. */
    build: () => { sectionName: string; section: any[] }
}

const HERO_ID = () => `preset-hero-${Math.random().toString(36).slice(2, 8)}`

export const SECTION_PRESETS: SectionPreset[] = [
    {
        id: 'hero-section',
        name: 'Hero Section',
        preview: { bg: '#0F0E0E' },
        build: () => ({
            sectionName: 'hero',
            section: [box({
                id: HERO_ID(), backgroundColor: '#0F0E0E', minHeight: 26,
                flexDirection: 'flex-col', mainAxisLayout: 'center', altAxisLayout: 'center',
                paddingExpanded: 'true', paddingTop: 4, paddingBottom: 4, paddingLeft: 1.5, paddingRight: 1.5,
                gapY: 20,
                content: [
                    ct('Your headline goes here', { id: HERO_ID(), fontSize: 2.5, lineHeight: 1.15, color: '#FFFFFF', align: 'center', maxWidth: 30 }),
                    ct('A short line about what you offer.', { id: HERO_ID(), fontSize: 1.0625, lineHeight: 1.6, color: 'rgba(255,255,255,.7)', align: 'center', maxWidth: 26 }),
                    btn('Book now', { id: HERO_ID(), backgroundColor: '#FC6161', color: '#ffffff', borderRadius: 999 }),
                ],
            })],
        }),
    },
    {
        id: 'services-grid',
        name: 'Services Grid',
        preview: { bg: '#FFFFFF' },
        build: () => ({
            sectionName: 'services',
            section: [box({
                id: HERO_ID(), backgroundColor: '#FFFFFF', paddingExpanded: 'true', paddingTop: 4, paddingBottom: 4, paddingLeft: 1.5, paddingRight: 1.5,
                gapY: 20,
                content: [
                    ct('Services', { id: HERO_ID(), fontSize: 2, lineHeight: 1.15, color: '#1A1818' }),
                    {
                        type: 'Grid' as const,
                        props: {
                            id: HERO_ID(), numberOfColumns: 3, numberOfRows: 1, gapX: 16, gapY: 16,
                            justifyItems: 'stretch', alignItems: 'stretch', firstCellRowSpan: 1, firstCellColumnSpan: 1,
                            cells: [1, 2, 3].map(() => ({
                                cell: [box({
                                    id: HERO_ID(), backgroundColor: '#FAF7F2', borderRadius: 12,
                                    paddingExpanded: 'true', paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 1.5, paddingRight: 1.5, gapY: 6,
                                    content: [
                                        ct('Service name', { id: HERO_ID(), fontSize: 1.125, lineHeight: 1.2, color: '#1A1818' }),
                                        ct('Short description', { id: HERO_ID(), fontSize: 0.875, lineHeight: 1.5, color: '#6F6863' }),
                                    ],
                                })],
                            })),
                        },
                    },
                ],
            })],
        }),
    },
    {
        id: 'about-strip',
        name: 'About Strip',
        preview: { bg: '#FAF7F2' },
        build: () => ({
            sectionName: 'about',
            section: [box({
                id: HERO_ID(), backgroundColor: '#FAF7F2', responsiveDirection: 'col-to-row',
                altAxisLayout: 'center', paddingExpanded: 'true', paddingTop: 3, paddingBottom: 3, paddingLeft: 1.5, paddingRight: 1.5, gapX: 32, gapY: 24,
                content: [
                    box({ id: HERO_ID(), grow: false, aspectRatio: '1/1', overflow: 'hidden', borderRadius: 16, maxWidth: 22, padding: 0, content: [img({ id: HERO_ID() })] }),
                    box({
                        id: HERO_ID(), grow: true, gapY: 12,
                        content: [
                            ct('About you', { id: HERO_ID(), fontSize: 1.875, lineHeight: 1.15, color: '#1A1818' }),
                            ct('A few sentences about your background, experience, and what makes your work special.', { id: HERO_ID(), fontSize: 1, lineHeight: 1.6, color: '#6F6863', maxWidth: 32 }),
                        ],
                    }),
                ],
            })],
        }),
    },
    {
        id: 'testimonials',
        name: 'Testimonials',
        preview: { bg: '#FAF7F2' },
        build: () => ({
            sectionName: 'testimonials',
            section: [box({
                id: HERO_ID(), backgroundColor: '#FAF7F2', altAxisLayout: 'center',
                paddingExpanded: 'true', paddingTop: 4, paddingBottom: 4, paddingLeft: 1.5, paddingRight: 1.5, gapY: 20,
                content: [
                    ct('What clients say', { id: HERO_ID(), fontSize: 2, lineHeight: 1.15, color: '#1A1818', align: 'center' }),
                    {
                        type: 'Grid' as const,
                        props: {
                            id: HERO_ID(), numberOfColumns: 3, numberOfRows: 1, gapX: 16, gapY: 16,
                            justifyItems: 'stretch', alignItems: 'start', firstCellRowSpan: 1, firstCellColumnSpan: 1,
                            cells: [1, 2, 3].map(() => ({
                                cell: [box({
                                    id: HERO_ID(), backgroundColor: '#FFFFFF', borderRadius: 12,
                                    paddingExpanded: 'true', paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 1.5, paddingRight: 1.5, gapY: 8,
                                    content: [
                                        ct('★★★★★', { id: HERO_ID(), fontSize: 0.8125, color: '#FC6161', lineHeight: 1 }),
                                        ct('"Quote from a happy client goes here."', { id: HERO_ID(), fontSize: 0.9375, lineHeight: 1.55, color: '#1A1818' }),
                                        ct('— Client name', { id: HERO_ID(), fontSize: 0.8125, color: '#6F6863', lineHeight: 1 }),
                                    ],
                                })],
                            })),
                        },
                    },
                ],
            })],
        }),
    },
    {
        id: 'cta-banner',
        name: 'CTA Banner',
        preview: { bg: '#FC6161' },
        build: () => ({
            sectionName: 'cta',
            section: [box({
                id: HERO_ID(), backgroundColor: '#FC6161', flexDirection: 'flex-col', altAxisLayout: 'center',
                paddingExpanded: 'true', paddingTop: 3, paddingBottom: 3, paddingLeft: 1.5, paddingRight: 1.5, gapY: 14,
                content: [
                    ct('Ready to book?', { id: HERO_ID(), fontSize: 2, lineHeight: 1.15, color: '#FFFFFF', align: 'center' }),
                    btn('Book now →', { id: HERO_ID(), backgroundColor: '#0F0E0E', color: '#ffffff', borderRadius: 999 }),
                ],
            })],
        }),
    },
]
