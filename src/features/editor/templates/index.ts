import type { Data } from '@puckeditor/core'

export type Template = {
    id: string
    name: string
    description: string
    category: 'luxury' | 'modern' | 'minimal'
    data: Data
}

// ─── MaisonTresse design tokens ────────────────────────────────────────────────
const INK = '#1a1410'
const CREAM = '#f4ede2'
const MUTED = 'rgba(26,20,16,.55)'
const BORDER = 'rgba(26,20,16,.14)'
const SERIF = '"Fraunces", "Times New Roman", serif'
const SANS = '"Inter", system-ui, sans-serif'
const PH_IMG =
    'https://jappbqntqogmnoluifzx.supabase.co/storage/v1/object/public/editor-media-pool/placeholder_photo.jpg'

// ─── Component factory helpers ─────────────────────────────────────────────────

const ct = (text: string, ov: Record<string, any> = {}) => ({
    type: 'CustomizableText' as const,
    props: {
        text,
        color: INK,
        fontFamily: SANS,
        fontSize: 0.9375,
        fontWeight: 400,
        letterSpacing: 0,
        lineHeight: 1.5,
        align: 'start',
        style: [] as string[],
        isLink: false,
        linkType: 'external',
        sections: '',
        url: '',
        textTransform: 'none',
        maxWidth: 0,
        ...ov,
    },
})

const box = (ov: Record<string, any> = {}) => ({
    type: 'Container' as const,
    props: {
        backgroundColor: 'transparent',
        padding: 0,
        paddingExpanded: 'false',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        grow: true,
        flexDirection: 'flex-col',
        mainAxisLayout: 'start',
        altAxisLayout: 'start',
        gapX: 0,
        gapY: 0,
        borderWidth: 0,
        borderColor: '#000000',
        borderType: 'solid',
        borderExpanded: 'false',
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 0,
        borderRight: 0,
        borderRadius: 0,
        borderRadiusExpanded: 'false',
        borderRadiusTopLeft: 0,
        borderRadiusTopRight: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        margin: 0,
        marginExpanded: 'false',
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        positionType: 'relative',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        rotation: 0,
        draggable: true,
        responsive: true,
        content: [] as any[],
        aspectRatio: '',
        overflow: 'visible',
        minHeight: 0,
        maxWidth: 0,
        gridTemplateColumns: '',
        responsiveDirection: 'none',
        hideBelow: 'none',
        hideAbove: 'none',
        ...ov,
    },
})

const btn = (text: string, ov: Record<string, any> = {}) => ({
    type: 'Button' as const,
    props: {
        text,
        backgroundColor: INK,
        color: CREAM,
        fontFamily: SANS,
        fontSize: 0.8125,
        fontWeight: 600,
        letterSpacing: 2,
        lineHeight: 1,
        style: [] as string[],
        align: 'center',
        textTransform: 'uppercase',
        maxWidth: 0,
        action: 'REDIRECT',
        link: '/',
        grow: false,
        paddingExpanded: 'true',
        paddingTop: 1.125,
        paddingBottom: 1.125,
        paddingLeft: 2,
        paddingRight: 2,
        padding: 0,
        borderRadius: 0,
        borderWidth: 0,
        borderColor: INK,
        borderType: 'solid',
        borderExpanded: 'false',
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 0,
        borderRight: 0,
        borderRadiusExpanded: 'false',
        borderRadiusTopLeft: 0,
        borderRadiusTopRight: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        margin: 0,
        marginExpanded: 'false',
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        gapX: 0,
        gapY: 0,
        positionType: 'relative',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        rotation: 0,
        draggable: true,
        responsive: true,
        flexDirection: 'flex-row',
        mainAxisLayout: 'center',
        altAxisLayout: 'center',
        variant: 'solid',
        aspectRatio: '',
        overflow: 'visible',
        minHeight: 0,
        gridTemplateColumns: '',
        responsiveDirection: 'none',
        hideBelow: 'none',
        hideAbove: 'none',
        ...ov,
    },
})

const img = (ov: Record<string, any> = {}) => ({
    type: 'Image' as const,
    props: {
        url: PH_IMG,
        width: 100,
        objectFit: 'cover',
        height: 100,
        aspectRatio: '',
        borderWidth: 0,
        borderRadius: 0,
        borderColor: '#000000',
        borderType: 'solid',
        borderExpanded: 'false',
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 0,
        borderRight: 0,
        borderRadiusExpanded: 'false',
        borderRadiusTopLeft: 0,
        borderRadiusTopRight: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        positionType: 'relative',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        ...ov,
    },
})

// ─── Template data ─────────────────────────────────────────────────────────────

const serviceRow = (num: string, name: string, duration: string, price: string, id: string) =>
    box({
        id: `mt-svc-${id}`,
        flexDirection: 'flex-row',
        mainAxisLayout: 'start',
        altAxisLayout: 'center',
        gapX: 16,
        borderExpanded: 'true',
        borderTop: 1,
        borderWidth: 0,
        borderColor: BORDER,
        borderType: 'solid',
        paddingExpanded: 'true',
        paddingTop: 1.25,
        paddingBottom: 1.25,
        content: [
            box({
                id: `mt-svc-${id}-num`,
                grow: false,
                content: [ct(num, { id: `mt-svc-${id}-n`, fontFamily: SERIF, fontSize: 0.875, lineHeight: 1, style: ['italic'], color: MUTED })],
            }),
            box({
                id: `mt-svc-${id}-name`,
                grow: true,
                content: [ct(name, { id: `mt-svc-${id}-nm`, fontFamily: SERIF, fontSize: 1.625, lineHeight: 1.1 })],
            }),
            box({
                id: `mt-svc-${id}-price`,
                grow: false,
                flexDirection: 'flex-row',
                gapX: 8,
                altAxisLayout: 'center',
                content: [
                    ct(price, { id: `mt-svc-${id}-p`, fontFamily: SERIF, fontSize: 1.125, lineHeight: 1, style: ['italic'] }),
                    ct('›', { id: `mt-svc-${id}-arr`, fontSize: 1, lineHeight: 1 }),
                ],
            }),
        ],
    })

const reviewCard = (stars: string, quote: string, name: string, id: string) =>
    box({
        id: `mt-rv-${id}`,
        grow: false,
        gapY: 14,
        borderExpanded: 'true',
        borderTop: 1,
        borderWidth: 0,
        borderColor: 'rgba(244,237,226,.2)',
        borderType: 'solid',
        paddingExpanded: 'true',
        paddingTop: 1.25,
        content: [
            ct(stars, { id: `mt-rv-${id}-s`, color: CREAM, fontSize: 0.6875, lineHeight: 1 }),
            ct(quote, { id: `mt-rv-${id}-q`, fontFamily: SERIF, fontSize: 1.125, lineHeight: 1.35, style: ['italic'], color: CREAM }),
            ct(name, { id: `mt-rv-${id}-n`, textTransform: 'uppercase', fontSize: 0.6875, lineHeight: 1, color: 'rgba(244,237,226,.6)' }),
        ],
    })

const maisonTresseData: Data = {
    content: [

        // ── 1. NAV ─────────────────────────────────────────────────────────────────
        box({
            id: 'mt-nav',
            flexDirection: 'flex-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'center',
            paddingExpanded: 'true',
            paddingTop: 1.25,
            paddingBottom: 1.25,
            paddingLeft: 3.75,
            paddingRight: 3.75,
            backgroundColor: CREAM,
            borderExpanded: 'true',
            borderBottom: 1,
            borderWidth: 0,
            borderColor: BORDER,
            borderType: 'solid',
            content: [
                ct('Maison Tresse', {
                    id: 'mt-nav-brand',
                    fontFamily: SERIF,
                    fontSize: 1.25,
                    letterSpacing: -0.5,
                    lineHeight: 1,
                }),
                box({
                    id: 'mt-nav-links',
                    grow: false,
                    flexDirection: 'flex-row',
                    gapX: 40,
                    hideBelow: 'lg',
                    content: [
                        ct('Atelier', { id: 'mt-nl1', fontSize: 0.75, lineHeight: 1, letterSpacing: 1.5, textTransform: 'uppercase' }),
                        ct('Services', { id: 'mt-nl2', fontSize: 0.75, lineHeight: 1, letterSpacing: 1.5, textTransform: 'uppercase' }),
                        ct('Portfolio', { id: 'mt-nl3', fontSize: 0.75, lineHeight: 1, letterSpacing: 1.5, textTransform: 'uppercase' }),
                        ct('Contact', { id: 'mt-nl4', fontSize: 0.75, lineHeight: 1, letterSpacing: 1.5, textTransform: 'uppercase' }),
                    ],
                }),
                btn('BOOK A SITTING', { id: 'mt-nav-cta' }),
            ],
        }),

        // ── 2. HERO ────────────────────────────────────────────────────────────────
        box({
            id: 'mt-hero',
            responsiveDirection: 'col-to-row',
            altAxisLayout: 'stretch',
            paddingExpanded: 'true',
            paddingTop: 7,
            paddingBottom: 7,
            paddingLeft: 3.75,
            paddingRight: 3.75,
            gapX: 64,
            backgroundColor: CREAM,
            content: [
                // Left: text column
                box({
                    id: 'mt-hero-left',
                    grow: true,
                    flexDirection: 'flex-col',
                    mainAxisLayout: 'center',
                    gapY: 20,
                    content: [
                        ct('Est. 2014 · By appointment', {
                            id: 'mt-hero-ew',
                            fontSize: 0.6875,
                            letterSpacing: 2,
                            lineHeight: 1,
                            fontWeight: 500,
                            color: MUTED,
                            textTransform: 'uppercase',
                        }),
                        ct('The art of', {
                            id: 'mt-hero-h1',
                            fontFamily: SERIF,
                            fontSize: 5.5,
                            letterSpacing: -2,
                            lineHeight: 1.05,
                        }),
                        ct('quiet', {
                            id: 'mt-hero-h2',
                            fontFamily: SERIF,
                            fontSize: 5.5,
                            letterSpacing: -2,
                            lineHeight: 1.05,
                            style: ['italic'],
                        }),
                        ct('luxury', {
                            id: 'mt-hero-h3',
                            fontFamily: SERIF,
                            fontSize: 5.5,
                            letterSpacing: -2,
                            lineHeight: 1.05,
                            style: ['underline'],
                        }),
                        ct('braiding.', {
                            id: 'mt-hero-h4',
                            fontFamily: SERIF,
                            fontSize: 5.5,
                            letterSpacing: -2,
                            lineHeight: 1.05,
                        }),
                        ct(
                            'Amani Okonkwo accepts a single client per day. Every braid is hand-installed in a private studio in Portland, OR, with no rush and no overlap.',
                            {
                                id: 'mt-hero-body',
                                fontSize: 0.9375,
                                lineHeight: 1.55,
                                color: MUTED,
                                maxWidth: 27.5,
                            },
                        ),
                        // CTA buttons row
                        box({
                            id: 'mt-hero-btns',
                            grow: false,
                            flexDirection: 'flex-row',
                            gapX: 12,
                            content: [
                                btn('BOOK A SITTING', { id: 'mt-hero-btn1' }),
                                btn('VIEW PORTFOLIO', {
                                    id: 'mt-hero-btn2',
                                    backgroundColor: 'transparent',
                                    color: INK,
                                    borderExpanded: 'false',
                                    borderWidth: 1,
                                    borderColor: INK,
                                }),
                            ],
                        }),
                        // Stats strip
                        box({
                            id: 'mt-hero-stats',
                            grow: false,
                            flexDirection: 'flex-row',
                            gapX: 40,
                            altAxisLayout: 'start',
                            borderExpanded: 'true',
                            borderTop: 1,
                            borderWidth: 0,
                            borderColor: BORDER,
                            borderType: 'solid',
                            paddingExpanded: 'true',
                            paddingTop: 2,
                            content: [
                                box({
                                    id: 'mt-stat1',
                                    grow: false,
                                    gapY: 4,
                                    content: [
                                        ct('12 yrs', { id: 'mt-s1v', fontFamily: SERIF, fontSize: 1.375, lineHeight: 1 }),
                                        ct('Atelier practice', { id: 'mt-s1l', fontSize: 0.625, lineHeight: 1, color: MUTED, textTransform: 'uppercase', letterSpacing: 1 }),
                                    ],
                                }),
                                box({
                                    id: 'mt-stat2',
                                    grow: false,
                                    gapY: 4,
                                    content: [
                                        ct('4.9/5', { id: 'mt-s2v', fontFamily: SERIF, fontSize: 1.375, lineHeight: 1 }),
                                        ct('480+ clients', { id: 'mt-s2l', fontSize: 0.625, lineHeight: 1, color: MUTED, textTransform: 'uppercase', letterSpacing: 1 }),
                                    ],
                                }),
                                box({
                                    id: 'mt-stat3',
                                    grow: false,
                                    gapY: 4,
                                    content: [
                                        ct('By referral', { id: 'mt-s3v', fontFamily: SERIF, fontSize: 1.375, lineHeight: 1 }),
                                        ct('New & returning', { id: 'mt-s3l', fontSize: 0.625, lineHeight: 1, color: MUTED, textTransform: 'uppercase', letterSpacing: 1 }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                // Right: image with press quote overlay
                box({
                    id: 'mt-hero-right',
                    grow: true,
                    aspectRatio: '4/5',
                    overflow: 'hidden',
                    positionType: 'relative',
                    content: [
                        img({ id: 'mt-hero-img' }),
                        box({
                            id: 'mt-hero-quote',
                            positionType: 'absolute',
                            bottom: 0,
                            right: 0,
                            grow: false,
                            backgroundColor: CREAM,
                            paddingExpanded: 'true',
                            paddingTop: 1.25,
                            paddingBottom: 1.25,
                            paddingLeft: 1.5,
                            paddingRight: 1.5,
                            borderExpanded: 'true',
                            borderTop: 1,
                            borderLeft: 1,
                            borderWidth: 0,
                            borderColor: BORDER,
                            borderType: 'solid',
                            content: [
                                ct('"She braids like she\'s drawing." — Vogue, \'24', {
                                    id: 'mt-hero-quote-text',
                                    fontFamily: SERIF,
                                    fontSize: 0.8125,
                                    lineHeight: 1.4,
                                    style: ['italic'],
                                    maxWidth: 18,
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        }),

        // ── 3. SERVICES ────────────────────────────────────────────────────────────
        box({
            id: 'mt-services',
            flexDirection: 'flex-col',
            paddingExpanded: 'true',
            paddingTop: 5.5,
            paddingBottom: 5.5,
            paddingLeft: 3.75,
            paddingRight: 3.75,
            backgroundColor: CREAM,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: BORDER,
            borderType: 'solid',
            content: [
                // Header row
                box({
                    id: 'mt-svc-header',
                    flexDirection: 'flex-row',
                    mainAxisLayout: 'space-between',
                    altAxisLayout: 'end',
                    gapX: 16,
                    paddingExpanded: 'true',
                    paddingBottom: 2.5,
                    content: [
                        box({
                            id: 'mt-svc-hd-left',
                            grow: false,
                            gapY: 18,
                            content: [
                                ct('I · Services', {
                                    id: 'mt-svc-ew',
                                    fontSize: 0.6875,
                                    letterSpacing: 2,
                                    lineHeight: 1,
                                    fontWeight: 500,
                                    color: MUTED,
                                    textTransform: 'uppercase',
                                }),
                                ct('The menu.', { id: 'mt-svc-h', fontFamily: SERIF, fontSize: 4, letterSpacing: -1, lineHeight: 1.05 }),
                            ],
                        }),
                        ct(
                            'Pricing reflects a single-client day, premium hair, and aftercare kit. Tax included.',
                            { id: 'mt-svc-note', fontSize: 0.75, color: MUTED, lineHeight: 1.5, maxWidth: 16 },
                        ),
                    ],
                }),
                // Service rows
                box({
                    id: 'mt-svc-list',
                    flexDirection: 'flex-col',
                    content: [
                        serviceRow('01', 'Knotless Box Braids', '5–7 hr', '$320', 'r1'),
                        serviceRow('02', 'Feed-In Cornrows', '2–3 hr', '$180', 'r2'),
                        serviceRow('03', 'Goddess Locs', '6–8 hr', '$380', 'r3'),
                        serviceRow('04', 'Fulani Braids', '4–5 hr', '$240', 'r4'),
                        serviceRow('05', 'Style Consultation', '30 min', '$40', 'r5'),
                    ],
                }),
            ],
        }),

        // ── 4. PORTFOLIO GALLERY ───────────────────────────────────────────────────
        box({
            id: 'mt-portfolio',
            flexDirection: 'flex-col',
            paddingExpanded: 'true',
            paddingTop: 5.5,
            paddingBottom: 5.5,
            paddingLeft: 3.75,
            paddingRight: 3.75,
            backgroundColor: '#ebe2d3',
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: BORDER,
            borderType: 'solid',
            gapY: 40,
            content: [
                // Header
                box({
                    id: 'mt-port-hdr',
                    flexDirection: 'flex-col',
                    gapY: 4,
                    content: [
                        ct('II · Portfolio', {
                            id: 'mt-port-ew',
                            fontSize: 0.6875,
                            letterSpacing: 2,
                            lineHeight: 1,
                            fontWeight: 500,
                            color: MUTED,
                            textTransform: 'uppercase',
                        }),
                        box({
                            id: 'mt-port-hd-row',
                            flexDirection: 'flex-row',
                            mainAxisLayout: 'space-between',
                            altAxisLayout: 'end',
                            content: [
                                box({
                                    id: 'mt-port-title',
                                    grow: false,
                                    flexDirection: 'flex-row',
                                    gapX: 8,
                                    content: [
                                        ct('Selected', { id: 'mt-ph1', fontFamily: SERIF, fontSize: 4, letterSpacing: -1, lineHeight: 1.05 }),
                                        ct('sittings', { id: 'mt-ph2', fontFamily: SERIF, fontSize: 4, letterSpacing: -1, lineHeight: 1.05, style: ['italic'] }),
                                        ct(", '23–'25.", { id: 'mt-ph3', fontFamily: SERIF, fontSize: 4, letterSpacing: -1, lineHeight: 1.05 }),
                                    ],
                                }),
                                ct('FULL ARCHIVE →', {
                                    id: 'mt-port-link',
                                    fontSize: 0.75,
                                    lineHeight: 1,
                                    textTransform: 'uppercase',
                                    style: ['underline'],
                                    letterSpacing: 1,
                                }),
                            ],
                        }),
                    ],
                }),
                // Gallery grid
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'mt-port-grid',
                        numberOfColumns: 3,
                        numberOfRows: 2,
                        gapX: 16,
                        gapY: 16,
                        justifyItems: 'stretch',
                        alignItems: 'stretch',
                        firstCellRowSpan: 2,
                        cells: [
                            { cell: [box({ id: 'mt-pg1', aspectRatio: '4/5', overflow: 'hidden', padding: 0, content: [img({ id: 'mt-pg1-img' })] })] },
                            { cell: [box({ id: 'mt-pg2', aspectRatio: '3/4', overflow: 'hidden', padding: 0, content: [img({ id: 'mt-pg2-img' })] })] },
                            { cell: [box({ id: 'mt-pg3', aspectRatio: '3/4', overflow: 'hidden', padding: 0, content: [img({ id: 'mt-pg3-img' })] })] },
                            { cell: [box({ id: 'mt-pg4', aspectRatio: '3/4', overflow: 'hidden', padding: 0, content: [img({ id: 'mt-pg4-img' })] })] },
                            { cell: [box({ id: 'mt-pg5', aspectRatio: '3/4', overflow: 'hidden', padding: 0, content: [img({ id: 'mt-pg5-img' })] })] },
                            { cell: [box({ id: 'mt-pg6', aspectRatio: '3/4', overflow: 'hidden', padding: 0, content: [img({ id: 'mt-pg6-img' })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── 5. ABOUT ───────────────────────────────────────────────────────────────
        box({
            id: 'mt-about',
            responsiveDirection: 'col-to-row',
            altAxisLayout: 'center',
            paddingExpanded: 'true',
            paddingTop: 7,
            paddingBottom: 7,
            paddingLeft: 3.75,
            paddingRight: 3.75,
            gapX: 48,
            backgroundColor: CREAM,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: BORDER,
            borderType: 'solid',
            content: [
                // Portrait image (left)
                box({
                    id: 'mt-about-img-wrap',
                    grow: true,
                    aspectRatio: '4/5',
                    overflow: 'hidden',
                    content: [img({ id: 'mt-about-img' })],
                }),
                // Text side (right)
                box({
                    id: 'mt-about-text',
                    grow: true,
                    flexDirection: 'flex-col',
                    gapY: 16,
                    content: [
                        ct('III · About', {
                            id: 'mt-about-ew',
                            fontSize: 0.6875,
                            color: MUTED,
                            letterSpacing: 2,
                            lineHeight: 1,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                        }),
                        ct('Twelve years.', { id: 'mt-about-h1', fontFamily: SERIF, fontSize: 3.5, letterSpacing: -1, lineHeight: 1.05 }),
                        ct('Four hundred', { id: 'mt-about-h2', fontFamily: SERIF, fontSize: 3.5, letterSpacing: -1, lineHeight: 1.05 }),
                        ct('eighty', { id: 'mt-about-h3', fontFamily: SERIF, fontSize: 3.5, letterSpacing: -1, lineHeight: 1.05, style: ['italic'] }),
                        ct('sittings.', { id: 'mt-about-h4', fontFamily: SERIF, fontSize: 3.5, letterSpacing: -1, lineHeight: 1.05 }),
                        ct(
                            'Trained in Lagos and Paris, Amani has spent twelve years perfecting the architecture of the braid — from feather-light micros to sculptural goddess locs. Each appointment is private, single-booking, and treated as a sitting.',
                            { id: 'mt-about-bio', fontSize: 0.875, lineHeight: 1.65, color: MUTED, maxWidth: 30 },
                        ),
                        box({
                            id: 'mt-about-c1-row',
                            grow: false,
                            flexDirection: 'flex-row',
                            gapX: 14,
                            altAxisLayout: 'baseline',
                            content: [
                                ct('—', { id: 'mt-about-dash1', fontFamily: SERIF, fontSize: 0.875, style: ['italic'], color: MUTED }),
                                ct('Trained — Lagos, then Paris (École Atelier)', { id: 'mt-about-c1', fontSize: 0.875, color: MUTED }),
                            ],
                        }),
                        box({
                            id: 'mt-about-c2-row',
                            grow: false,
                            flexDirection: 'flex-row',
                            gapX: 14,
                            altAxisLayout: 'baseline',
                            content: [
                                ct('—', { id: 'mt-about-dash2', fontFamily: SERIF, fontSize: 0.875, style: ['italic'], color: MUTED }),
                                ct('Featured — Vogue, Essence, hair stories', { id: 'mt-about-c2', fontSize: 0.875, color: MUTED }),
                            ],
                        }),
                        box({
                            id: 'mt-about-c3-row',
                            grow: false,
                            flexDirection: 'flex-row',
                            gapX: 14,
                            altAxisLayout: 'baseline',
                            content: [
                                ct('—', { id: 'mt-about-dash3', fontFamily: SERIF, fontSize: 0.875, style: ['italic'], color: MUTED }),
                                ct('Studio — Private, single-booking, in NW Portland', { id: 'mt-about-c3', fontSize: 0.875, color: MUTED }),
                            ],
                        }),
                    ],
                }),
            ],
        }),

        // ── 6. REVIEWS ─────────────────────────────────────────────────────────────
        box({
            id: 'mt-reviews',
            flexDirection: 'flex-col',
            paddingExpanded: 'true',
            paddingTop: 5.5,
            paddingBottom: 5.5,
            paddingLeft: 3.75,
            paddingRight: 3.75,
            gapY: 40,
            backgroundColor: INK,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: 'rgba(244,237,226,.1)',
            borderType: 'solid',
            content: [
                ct('IV · Words', {
                    id: 'mt-rv-ew',
                    fontSize: 0.6875,
                    letterSpacing: 2,
                    lineHeight: 1,
                    fontWeight: 500,
                    color: 'rgba(244,237,226,.6)',
                    textTransform: 'uppercase',
                }),
                ct("From those who've sat.", {
                    id: 'mt-rv-h',
                    fontFamily: SERIF,
                    fontSize: 4,
                    letterSpacing: -1,
                    lineHeight: 1.05,
                    color: CREAM,
                    maxWidth: 37.5,
                }),
                // Review grid (3 columns)
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'mt-rv-grid',
                        numberOfColumns: 3,
                        numberOfRows: 1,
                        gapX: 32,
                        gapY: 0,
                        justifyItems: 'stretch',
                        alignItems: 'start',
                        firstCellRowSpan: 1,
                        cells: [
                            { cell: [reviewCard('★★★★★', '"Amani didn\'t just braid my hair — she sculpted it. The room smelled like tea and rosewood. I felt seen in a way salons rarely do."', '— Imani T.', '1')] },
                            { cell: [reviewCard('★★★★★', '"Worth every dollar. She booked me for the full day, no overlap. My braids were still flawless eight weeks in."', '— Kemi A.', '2')] },
                            { cell: [reviewCard('★★★★★', '"I drove three hours and would do it again. Quiet, focused, breathtaking work."', '— Sade B.', '3')] },
                        ],
                    },
                },
            ],
        }),

        // ── 7. BOOKING CTA ─────────────────────────────────────────────────────────
        box({
            id: 'mt-cta',
            flexDirection: 'flex-col',
            mainAxisLayout: 'center',
            altAxisLayout: 'center',
            paddingExpanded: 'true',
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 3.75,
            paddingRight: 3.75,
            gapY: 16,
            backgroundColor: CREAM,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: BORDER,
            borderType: 'solid',
            content: [
                ct('V · Book', {
                    id: 'mt-cta-ew',
                    fontSize: 0.6875,
                    color: MUTED,
                    letterSpacing: 3,
                    lineHeight: 1,
                    fontWeight: 500,
                    align: 'center',
                    textTransform: 'uppercase',
                }),
                ct('The chair', { id: 'mt-cta-h1', fontFamily: SERIF, fontSize: 5.5, letterSpacing: -2, lineHeight: 1.05, align: 'center' }),
                ct('is yours.', { id: 'mt-cta-h2', fontFamily: SERIF, fontSize: 5.5, letterSpacing: -2, lineHeight: 1.05, align: 'center', style: ['italic'] }),
                ct(
                    'One client per day. Booking opens six weeks out and tends to fill within forty-eight hours.',
                    { id: 'mt-cta-body', fontSize: 0.9375, color: MUTED, lineHeight: 1.5, align: 'center', maxWidth: 32 },
                ),
                btn('RESERVE YOUR SITTING', { id: 'mt-cta-btn' }),
            ],
        }),

        // ── 8. FOOTER ──────────────────────────────────────────────────────────────
        box({
            id: 'mt-footer',
            flexDirection: 'flex-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'start',
            paddingExpanded: 'true',
            paddingTop: 3,
            paddingBottom: 3,
            paddingLeft: 3.75,
            paddingRight: 3.75,
            backgroundColor: CREAM,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: BORDER,
            borderType: 'solid',
            content: [
                // Brand + address block
                box({
                    id: 'mt-footer-brand',
                    grow: false,
                    gapY: 6,
                    content: [
                        ct('Maison Tresse', { id: 'mt-ft-name', fontFamily: SERIF, fontSize: 1.375, lineHeight: 1 }),
                        ct('2104 NW Lovejoy St', { id: 'mt-ft-a1', fontSize: 0.75, color: MUTED, lineHeight: 1.7 }),
                        ct('Portland, OR 97210', { id: 'mt-ft-a2', fontSize: 0.75, color: MUTED, lineHeight: 1.7 }),
                        ct('By appointment only', { id: 'mt-ft-a3', fontSize: 0.75, color: MUTED, lineHeight: 1.7 }),
                    ],
                }),
                // Three link columns
                box({
                    id: 'mt-footer-cols',
                    grow: false,
                    flexDirection: 'flex-row',
                    gapX: 56,
                    content: [
                        box({
                            id: 'mt-fc1',
                            grow: false,
                            gapY: 6,
                            content: [
                                ct('Studio', { id: 'mt-fc1-h', fontSize: 0.6875, color: MUTED, letterSpacing: 2, lineHeight: 1, fontWeight: 500, textTransform: 'uppercase' }),
                                ct('amani@maisontresse.co', { id: 'mt-fc1-1', fontSize: 0.8125, lineHeight: 1.5 }),
                                ct('+1 503 555 0142', { id: 'mt-fc1-2', fontSize: 0.8125, lineHeight: 1.5 }),
                            ],
                        }),
                        box({
                            id: 'mt-fc2',
                            grow: false,
                            gapY: 6,
                            content: [
                                ct('Hours', { id: 'mt-fc2-h', fontSize: 0.6875, color: MUTED, letterSpacing: 2, lineHeight: 1, fontWeight: 500, textTransform: 'uppercase' }),
                                ct('Tue–Sat by booking', { id: 'mt-fc2-1', fontSize: 0.8125, lineHeight: 1.5 }),
                                ct('Sun & Mon: closed', { id: 'mt-fc2-2', fontSize: 0.8125, lineHeight: 1.5 }),
                            ],
                        }),
                        box({
                            id: 'mt-fc3',
                            grow: false,
                            gapY: 6,
                            content: [
                                ct('Follow', { id: 'mt-fc3-h', fontSize: 0.6875, color: MUTED, letterSpacing: 2, lineHeight: 1, fontWeight: 500, textTransform: 'uppercase' }),
                                ct('Instagram', { id: 'mt-fc3-1', fontSize: 0.8125, lineHeight: 1.5 }),
                                ct('TikTok', { id: 'mt-fc3-2', fontSize: 0.8125, lineHeight: 1.5 }),
                            ],
                        }),
                    ],
                }),
            ],
        }),
    ],
    root: { props: {} },
    zones: {},
}

export const templates: Template[] = [
    {
        id: 'maison-tresse',
        name: 'Maison Tresse',
        description: 'Editorial luxury braider — cream, ink, gold. Fraunces serif headlines.',
        category: 'luxury',
        data: maisonTresseData,
    },
]
