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
        spacing: 'none',
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

const wrapInCard = (content: ReturnType<typeof box>, cardId: string) => ({
    type: 'Card' as const,
    props: {
        id: cardId,
        cardContent: [content],
        variant: 'basic',
        cardCover: 'image',
        imageSource: PH_IMG,
        videoSource: '',
        linkToService: true,
        service: '',
    },
})

const serviceRow = (num: string, name: string, duration: string, price: string, id: string) =>
    wrapInCard(box({
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
    }), `mt-card-${id}`)

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
            spacing: 'tight',
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
            spacing: 'spacious',
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
                            responsiveDirection: 'col-to-row',
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
                            responsiveDirection: 'col-to-row',
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
            spacing: 'normal',
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
                    responsiveDirection: 'col-to-row',
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
            spacing: 'normal',
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
                            responsiveDirection: 'col-to-row',
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
            spacing: 'spacious',
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
            spacing: 'normal',
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
            spacing: 'spacious',
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
            spacing: 'tight',
            responsiveDirection: 'col-to-row',
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

// ─── FadeHouse tokens ──────────────────────────────────────────────────────────
const FH_BG = '#0e0e0e'
const FH_FG = '#ebe8e3'
const FH_ACCENT = '#c4361f'
const FH_MUTED = 'rgba(235,232,227,.55)'
const FH_BORDER = 'rgba(235,232,227,.14)'
const FH_DISPLAY = '"Anton", "Oswald", Impact, sans-serif'
const FH_BODY = '"Inter", system-ui, sans-serif'

const fhSvcRow = (num: string, name: string, price: string, id: string) =>
    wrapInCard(box({
        id: `fh-svc-${id}`,
        flexDirection: 'flex-row',
        mainAxisLayout: 'space-between',
        altAxisLayout: 'center',
        gapX: 16,
        borderExpanded: 'true',
        borderTop: 1,
        borderWidth: 0,
        borderColor: FH_BORDER,
        borderType: 'solid',
        paddingExpanded: 'true',
        paddingTop: 1.5,
        paddingBottom: 1.5,
        content: [
            ct(num, { id: `fh-svc-${id}-n`, fontFamily: FH_DISPLAY, fontSize: 2.25, lineHeight: 1, color: FH_ACCENT }),
            box({ id: `fh-svc-${id}-nm`, grow: true, content: [ct(name, { id: `fh-svc-${id}-t`, fontFamily: FH_DISPLAY, fontSize: 2.25, lineHeight: 1, color: FH_FG })] }),
            ct(price, { id: `fh-svc-${id}-p`, fontFamily: FH_DISPLAY, fontSize: 2.25, lineHeight: 1, color: FH_FG }),
        ],
    }), `fh-card-${id}`)

const fadeHouseData: Data = {
    content: [
        // ── NAV ───────────────────────────────────────────────────────────────────
        box({
            id: 'fh-nav',
            flexDirection: 'flex-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'center',
            spacing: 'tight',
            backgroundColor: FH_BG,
            borderExpanded: 'true',
            borderBottom: 1,
            borderWidth: 0,
            borderColor: FH_BORDER,
            borderType: 'solid',
            content: [
                box({
                    id: 'fh-nav-logo',
                    grow: false,
                    flexDirection: 'flex-row',
                    gapX: 10,
                    altAxisLayout: 'center',
                    content: [
                        ct('FADE HOUSE', { id: 'fh-nav-name', fontFamily: FH_DISPLAY, fontSize: 1.375, letterSpacing: 1, lineHeight: 1, color: FH_FG, textTransform: 'uppercase' }),
                    ],
                }),
                box({
                    id: 'fh-nav-links',
                    grow: false,
                    flexDirection: 'flex-row',
                    gapX: 28,
                    hideBelow: 'lg',
                    altAxisLayout: 'center',
                    content: [
                        ct('Cuts', { id: 'fh-nl1', fontSize: 0.75, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, color: FH_FG }),
                        ct('Work', { id: 'fh-nl2', fontSize: 0.75, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, color: FH_FG }),
                        ct('Crew', { id: 'fh-nl3', fontSize: 0.75, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, color: FH_FG }),
                        ct('Shop', { id: 'fh-nl4', fontSize: 0.75, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, color: FH_FG }),
                    ],
                }),
                btn('Book a chair', { id: 'fh-nav-cta', backgroundColor: FH_ACCENT, color: FH_FG, fontFamily: FH_DISPLAY, borderRadius: 0 }),
            ],
        }),

        // ── HERO ──────────────────────────────────────────────────────────────────
        box({
            id: 'fh-hero',
            flexDirection: 'flex-col',
            spacing: 'spacious',
            gapY: 32,
            backgroundColor: FH_BG,
            borderExpanded: 'true',
            borderLeft: 6,
            borderWidth: 0,
            borderColor: FH_ACCENT,
            borderType: 'solid',
            content: [
                ct('EST. 2017 · COLUMBUS, OH', { id: 'fh-hero-ew', fontSize: 0.6875, letterSpacing: 3, textTransform: 'uppercase', color: FH_ACCENT, fontWeight: 600, lineHeight: 1 }),
                ct('IN. OUT.', { id: 'fh-h1', fontFamily: FH_DISPLAY, fontSize: 6, lineHeight: 0.92, textTransform: 'uppercase', color: FH_FG, letterSpacing: 0 }),
                ct('FRESH.', { id: 'fh-h2', fontFamily: FH_DISPLAY, fontSize: 6, lineHeight: 0.92, textTransform: 'uppercase', color: FH_ACCENT, letterSpacing: 0 }),
                ct('Master barber Marcus Reed. Single-chair shop. No double-booking. Walk in clean — leave cleaner.', {
                    id: 'fh-hero-body', fontSize: 1.125, lineHeight: 1.5, color: FH_MUTED, maxWidth: 28,
                }),
                box({
                    id: 'fh-hero-btns',
                    grow: false,
                    flexDirection: 'flex-row',
                    responsiveDirection: 'col-to-row',
                    gapX: 12,
                    content: [
                        btn('Book my cut →', { id: 'fh-hero-cta', backgroundColor: FH_ACCENT, color: FH_FG, fontFamily: FH_DISPLAY, borderRadius: 0, fontSize: 1.125 }),
                        btn('Or text 614-555-0188', { id: 'fh-hero-txt', backgroundColor: 'transparent', color: FH_MUTED, fontFamily: FH_BODY, fontSize: 0.75, letterSpacing: 1.5, borderWidth: 0 }),
                    ],
                }),
                // Stats row
                box({
                    id: 'fh-stats',
                    grow: false,
                    flexDirection: 'flex-row',
                    responsiveDirection: 'col-to-row',
                    gapX: 40,
                    altAxisLayout: 'end',
                    borderExpanded: 'true',
                    borderTop: 1,
                    borderWidth: 0,
                    borderColor: FH_BORDER,
                    borderType: 'solid',
                    paddingExpanded: 'true',
                    paddingTop: 1.5,
                    content: [
                        box({ id: 'fh-st1', grow: false, gapY: 4, content: [ct('8', { id: 'fh-st1v', fontFamily: FH_DISPLAY, fontSize: 3.5, lineHeight: 1, color: FH_FG }), ct('Years cutting', { id: 'fh-st1l', fontSize: 0.625, textTransform: 'uppercase', letterSpacing: 2, color: FH_MUTED, lineHeight: 1 })] }),
                        box({ id: 'fh-st2', grow: false, gapY: 4, content: [ct('4.2K+', { id: 'fh-st2v', fontFamily: FH_DISPLAY, fontSize: 3.5, lineHeight: 1, color: FH_FG }), ct('Cuts in the books', { id: 'fh-st2l', fontSize: 0.625, textTransform: 'uppercase', letterSpacing: 2, color: FH_MUTED, lineHeight: 1 })] }),
                        box({ id: 'fh-st3', grow: false, gapY: 4, content: [ct('4.9', { id: 'fh-st3v', fontFamily: FH_DISPLAY, fontSize: 3.5, lineHeight: 1, color: FH_FG }), ct('Avg. rating', { id: 'fh-st3l', fontSize: 0.625, textTransform: 'uppercase', letterSpacing: 2, color: FH_MUTED, lineHeight: 1 })] }),
                    ],
                }),
            ],
        }),

        // ── SERVICES ──────────────────────────────────────────────────────────────
        box({
            id: 'fh-services',
            flexDirection: 'flex-col',
            spacing: 'normal',
            backgroundColor: FH_BG,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: FH_BORDER,
            borderType: 'solid',
            content: [
                box({
                    id: 'fh-svc-hd',
                    flexDirection: 'flex-row',
                    responsiveDirection: 'col-to-row',
                    mainAxisLayout: 'space-between',
                    altAxisLayout: 'end',
                    gapX: 16,
                    paddingExpanded: 'true',
                    paddingBottom: 2.5,
                    content: [
                        box({ id: 'fh-svc-hdl', grow: false, gapY: 16, content: [
                            ct('THE MENU', { id: 'fh-svc-ew', fontSize: 0.6875, letterSpacing: 3, textTransform: 'uppercase', color: FH_ACCENT, fontWeight: 600, lineHeight: 1 }),
                            ct('Cuts & Prices.', { id: 'fh-svc-h', fontFamily: FH_DISPLAY, fontSize: 4, lineHeight: 0.95, textTransform: 'uppercase', color: FH_FG }),
                        ] }),
                        ct('All cuts include lineup, eyebrow detail & a hot towel finish.', { id: 'fh-svc-note', fontSize: 0.75, color: FH_MUTED, lineHeight: 1.5, maxWidth: 15 }),
                    ],
                }),
                box({
                    id: 'fh-svc-list',
                    flexDirection: 'flex-col',
                    content: [
                        fhSvcRow('01', 'The Cut', '$45', 'r1'),
                        fhSvcRow('02', 'Cut + Beard', '$65', 'r2'),
                        fhSvcRow('03', 'The Full Service', '$90', 'r3'),
                        fhSvcRow('04', "Kid's Cut", '$30', 'r4'),
                        fhSvcRow('05', 'Beard Only', '$30', 'r5'),
                    ],
                }),
            ],
        }),

        // ── PORTFOLIO ─────────────────────────────────────────────────────────────
        box({
            id: 'fh-port',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 32,
            backgroundColor: '#070707',
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: FH_BORDER,
            borderType: 'solid',
            content: [
                ct('THE WORK', { id: 'fh-port-ew', fontSize: 0.6875, letterSpacing: 3, textTransform: 'uppercase', color: FH_ACCENT, fontWeight: 600, lineHeight: 1 }),
                ct('FRESH OFF THE CHAIR.', { id: 'fh-port-h', fontFamily: FH_DISPLAY, fontSize: 4, lineHeight: 0.95, textTransform: 'uppercase', color: FH_FG }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'fh-port-grid',
                        numberOfColumns: 3,
                        numberOfRows: 2,
                        gapX: 14,
                        gapY: 14,
                        justifyItems: 'stretch',
                        alignItems: 'stretch',
                        firstCellRowSpan: 1,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [box({ id: 'fh-pg1', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'fh-pg1-i' })] })] },
                            { cell: [box({ id: 'fh-pg2', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'fh-pg2-i' })] })] },
                            { cell: [box({ id: 'fh-pg3', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'fh-pg3-i' })] })] },
                            { cell: [box({ id: 'fh-pg4', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'fh-pg4-i' })] })] },
                            { cell: [box({ id: 'fh-pg5', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'fh-pg5-i' })] })] },
                            { cell: [box({ id: 'fh-pg6', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'fh-pg6-i' })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── ABOUT ─────────────────────────────────────────────────────────────────
        box({
            id: 'fh-about',
            responsiveDirection: 'col-to-row',
            altAxisLayout: 'start',
            spacing: 'spacious',
            gapX: 60,
            backgroundColor: FH_BG,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: FH_BORDER,
            borderType: 'solid',
            content: [
                box({
                    id: 'fh-about-text',
                    grow: true,
                    flexDirection: 'flex-col',
                    gapY: 24,
                    content: [
                        ct('THE BARBER', { id: 'fh-ab-ew', fontSize: 0.6875, letterSpacing: 3, textTransform: 'uppercase', color: FH_ACCENT, fontWeight: 600, lineHeight: 1 }),
                        ct('MARCUS BUILT THIS.', { id: 'fh-ab-h', fontFamily: FH_DISPLAY, fontSize: 4, lineHeight: 0.95, textTransform: 'uppercase', color: FH_FG }),
                        ct('Eight years in the chair. Trained in Detroit, sharpened in Atlanta, posted up in Columbus. Crisp lineups, low-fade specialist, beard sculpting that actually fits your face.', {
                            id: 'fh-ab-bio', fontSize: 1.0625, lineHeight: 1.55, color: FH_MUTED, maxWidth: 30,
                        }),
                    ],
                }),
                box({
                    id: 'fh-about-img-wrap',
                    grow: true,
                    aspectRatio: '4/5',
                    overflow: 'hidden',
                    positionType: 'relative',
                    content: [
                        img({ id: 'fh-ab-img' }),
                        box({
                            id: 'fh-ab-badge',
                            positionType: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            grow: false,
                            backgroundColor: FH_ACCENT,
                            paddingExpanded: 'true',
                            paddingTop: 0.875,
                            paddingBottom: 0.875,
                            paddingLeft: 1,
                            paddingRight: 1,
                            content: [
                                ct('"BARBER OF THE YEAR"', { id: 'fh-ab-award', fontFamily: FH_DISPLAY, fontSize: 1.5, lineHeight: 1, color: FH_FG }),
                                ct('Columbus Magazine, 2024', { id: 'fh-ab-src', fontSize: 0.6875, letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.5, color: FH_FG }),
                            ],
                        }),
                    ],
                }),
            ],
        }),

        // ── REVIEWS ───────────────────────────────────────────────────────────────
        box({
            id: 'fh-reviews',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 40,
            backgroundColor: FH_ACCENT,
            content: [
                ct('WORD ON THE STREET', { id: 'fh-rv-ew', fontSize: 0.6875, letterSpacing: 3, textTransform: 'uppercase', color: FH_FG, fontWeight: 600, lineHeight: 1 }),
                ct('4.9 / 5. FROM 320+ REVIEWS.', { id: 'fh-rv-h', fontFamily: FH_DISPLAY, fontSize: 4, lineHeight: 0.95, textTransform: 'uppercase', color: FH_FG }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'fh-rv-grid',
                        numberOfColumns: 3,
                        numberOfRows: 1,
                        gapX: 24,
                        gapY: 24,
                        justifyItems: 'stretch',
                        alignItems: 'start',
                        firstCellRowSpan: 1,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [box({ id: 'fh-rv1', backgroundColor: FH_BG, paddingExpanded: 'true', paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 1.5, paddingRight: 1.5, gapY: 12, content: [ct('★★★★★', { id: 'fh-rv1-s', color: FH_ACCENT, fontSize: 0.75, lineHeight: 1 }), ct('"Marcus is the only one in Columbus who gets a 4-blade fade right."', { id: 'fh-rv1-q', fontSize: 0.9375, lineHeight: 1.5, color: FH_FG }), ct('— D. Wallace', { id: 'fh-rv1-n', fontSize: 0.75, textTransform: 'uppercase', letterSpacing: 1.5, color: FH_MUTED, lineHeight: 1 })] })] },
                            { cell: [box({ id: 'fh-rv2', backgroundColor: FH_BG, paddingExpanded: 'true', paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 1.5, paddingRight: 1.5, gapY: 12, content: [ct('★★★★★', { id: 'fh-rv2-s', color: FH_ACCENT, fontSize: 0.75, lineHeight: 1 }), ct('"Fast, clean, no BS. In and out in 30 with the freshest cut."', { id: 'fh-rv2-q', fontSize: 0.9375, lineHeight: 1.5, color: FH_FG }), ct('— Jamal R.', { id: 'fh-rv2-n', fontSize: 0.75, textTransform: 'uppercase', letterSpacing: 1.5, color: FH_MUTED, lineHeight: 1 })] })] },
                            { cell: [box({ id: 'fh-rv3', backgroundColor: FH_BG, paddingExpanded: 'true', paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 1.5, paddingRight: 1.5, gapY: 12, content: [ct('★★★★★', { id: 'fh-rv3-s', color: FH_ACCENT, fontSize: 0.75, lineHeight: 1 }), ct('"Brought my 8-year-old in scared, left him in love with the chair."', { id: 'fh-rv3-q', fontSize: 0.9375, lineHeight: 1.5, color: FH_FG }), ct('— Tony C.', { id: 'fh-rv3-n', fontSize: 0.75, textTransform: 'uppercase', letterSpacing: 1.5, color: FH_MUTED, lineHeight: 1 })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── BOOKING CTA ───────────────────────────────────────────────────────────
        box({
            id: 'fh-cta',
            flexDirection: 'flex-col',
            spacing: 'spacious',
            gapY: 24,
            altAxisLayout: 'center',
            backgroundColor: FH_BG,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: FH_BORDER,
            borderType: 'solid',
            content: [
                ct('BOOK', { id: 'fh-cta-h1', fontFamily: FH_DISPLAY, fontSize: 8, lineHeight: 0.9, textTransform: 'uppercase', color: FH_FG, align: 'center' }),
                ct('THE CHAIR.', { id: 'fh-cta-h2', fontFamily: FH_DISPLAY, fontSize: 8, lineHeight: 0.9, textTransform: 'uppercase', color: FH_ACCENT, align: 'center' }),
                ct('Slots open Sunday night for the week. Get in early — the 5pm Fridays go fast.', { id: 'fh-cta-body', fontSize: 1.0625, lineHeight: 1.55, color: FH_MUTED, maxWidth: 26, align: 'center' }),
                btn('Reserve a chair →', { id: 'fh-cta-btn', backgroundColor: FH_ACCENT, color: FH_FG, fontFamily: FH_DISPLAY, borderRadius: 0, fontSize: 1.125 }),
            ],
        }),

        // ── FOOTER ────────────────────────────────────────────────────────────────
        box({
            id: 'fh-footer',
            responsiveDirection: 'col-to-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'start',
            spacing: 'tight',
            gapX: 40,
            gapY: 24,
            backgroundColor: FH_BG,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: FH_BORDER,
            borderType: 'solid',
            content: [
                box({ id: 'fh-ft-brand', grow: false, gapY: 8, content: [
                    ct('FADE HOUSE', { id: 'fh-ft-name', fontFamily: FH_DISPLAY, fontSize: 1.75, lineHeight: 1, color: FH_FG }),
                    ct('418 N High Street\nColumbus, OH 43215\n614 · 555 · 0188', { id: 'fh-ft-addr', fontSize: 0.8125, lineHeight: 1.7, color: FH_MUTED }),
                ] }),
                box({ id: 'fh-ft-cols', grow: false, flexDirection: 'flex-row', gapX: 40, content: [
                    box({ id: 'fh-ft-c1', grow: false, gapY: 6, content: [
                        ct('Hours', { id: 'fh-fc1h', fontSize: 0.625, textTransform: 'uppercase', letterSpacing: 2, color: FH_MUTED, fontWeight: 600, lineHeight: 1 }),
                        ct('Tue–Fri 9–7', { id: 'fh-fc1a', fontSize: 0.8125, lineHeight: 1.5, color: FH_FG }),
                        ct('Sat 8–6', { id: 'fh-fc1b', fontSize: 0.8125, lineHeight: 1.5, color: FH_FG }),
                        ct('Sun & Mon: closed', { id: 'fh-fc1c', fontSize: 0.8125, lineHeight: 1.5, color: FH_FG }),
                    ] }),
                    box({ id: 'fh-ft-c2', grow: false, gapY: 6, content: [
                        ct('Follow', { id: 'fh-fc2h', fontSize: 0.625, textTransform: 'uppercase', letterSpacing: 2, color: FH_MUTED, fontWeight: 600, lineHeight: 1 }),
                        ct('Instagram @fadehouse', { id: 'fh-fc2a', fontSize: 0.8125, lineHeight: 1.5, color: FH_FG }),
                        ct('TikTok @fadehouse', { id: 'fh-fc2b', fontSize: 0.8125, lineHeight: 1.5, color: FH_FG }),
                    ] }),
                ] }),
            ],
        }),
    ],
    root: { props: {} },
    zones: {},
}

// ─── AtelierClair tokens ───────────────────────────────────────────────────────
const AC_BG = '#faf8f4'
const AC_FG = '#2c2826'
const AC_ACCENT = '#a89bb8'
const AC_MUTED = 'rgba(44,40,38,.55)'
const AC_BORDER = 'rgba(44,40,38,.12)'
const AC_FONT = '"Manrope", "Inter", system-ui, sans-serif'
const AC_FIELD = 'rgba(44,40,38,.05)'

const acSvcCard = (name: string, duration: string, price: string, id: string) =>
    wrapInCard(box({
        id: `ac-svc-${id}`,
        flexDirection: 'flex-row',
        mainAxisLayout: 'space-between',
        altAxisLayout: 'center',
        paddingExpanded: 'true',
        paddingTop: 1.5,
        paddingBottom: 1.5,
        paddingLeft: 1.5,
        paddingRight: 1.5,
        backgroundColor: AC_FIELD,
        borderRadius: 16,
        content: [
            box({ id: `ac-svc-${id}-l`, grow: true, gapY: 4, content: [
                ct(name, { id: `ac-svc-${id}-n`, fontFamily: AC_FONT, fontSize: 1.375, fontWeight: 500, lineHeight: 1.1, color: AC_FG }),
                ct(duration, { id: `ac-svc-${id}-d`, fontSize: 0.8125, color: AC_MUTED, lineHeight: 1 }),
            ] }),
            box({ id: `ac-svc-${id}-r`, grow: false, flexDirection: 'flex-row', gapX: 16, altAxisLayout: 'center', content: [
                ct(price, { id: `ac-svc-${id}-p`, fontSize: 1.125, fontWeight: 600, color: AC_FG, lineHeight: 1 }),
                ct('→', { id: `ac-svc-${id}-arr`, fontSize: 1.125, lineHeight: 1, color: AC_FG }),
            ] }),
        ],
    }), `ac-card-${id}`)

const atelierClairData: Data = {
    content: [
        // ── NAV ───────────────────────────────────────────────────────────────────
        box({
            id: 'ac-nav',
            flexDirection: 'flex-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'center',
            spacing: 'tight',
            backgroundColor: AC_BG,
            borderExpanded: 'true',
            borderBottom: 1,
            borderWidth: 0,
            borderColor: AC_BORDER,
            borderType: 'solid',
            content: [
                ct('atelier clair', { id: 'ac-nav-logo', fontFamily: AC_FONT, fontSize: 1.125, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1, color: AC_FG }),
                box({
                    id: 'ac-nav-links',
                    grow: false,
                    flexDirection: 'flex-row',
                    gapX: 32,
                    hideBelow: 'lg',
                    altAxisLayout: 'center',
                    content: [
                        ct('Services', { id: 'ac-nl1', fontFamily: AC_FONT, fontSize: 0.8125, color: AC_FG }),
                        ct('Work', { id: 'ac-nl2', fontFamily: AC_FONT, fontSize: 0.8125, color: AC_FG }),
                        ct('About', { id: 'ac-nl3', fontFamily: AC_FONT, fontSize: 0.8125, color: AC_FG }),
                        ct('Visit', { id: 'ac-nl4', fontFamily: AC_FONT, fontSize: 0.8125, color: AC_FG }),
                    ],
                }),
                btn('Book', { id: 'ac-nav-cta', backgroundColor: AC_FG, color: AC_BG, fontFamily: AC_FONT, borderRadius: 999, fontSize: 0.8125, fontWeight: 600 }),
            ],
        }),

        // ── HERO ──────────────────────────────────────────────────────────────────
        box({
            id: 'ac-hero',
            responsiveDirection: 'col-to-row',
            altAxisLayout: 'center',
            spacing: 'spacious',
            gapX: 60,
            gapY: 32,
            backgroundColor: AC_BG,
            content: [
                box({
                    id: 'ac-hero-text',
                    grow: true,
                    flexDirection: 'flex-col',
                    gapY: 20,
                    content: [
                        ct('Now booking · Spring \'26', { id: 'ac-hero-ew', fontFamily: AC_FONT, fontSize: 0.6875, fontWeight: 600, lineHeight: 1, color: AC_FG, backgroundColor: AC_ACCENT, paddingExpanded: 'true', paddingTop: 0.375, paddingBottom: 0.375, paddingLeft: 0.75, paddingRight: 0.75, borderRadius: 999 }),
                        ct('A quieter kind of salon.', { id: 'ac-hero-h', fontFamily: AC_FONT, fontSize: 4.75, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.1, color: AC_FG }),
                        ct('Two clients a day. Lavender tea on arrival. Naomi works across textures with a focus on healthy color and low-manipulation styling.', {
                            id: 'ac-hero-body', fontFamily: AC_FONT, fontSize: 1.0625, lineHeight: 1.55, color: AC_MUTED, maxWidth: 27.5,
                        }),
                        box({
                            id: 'ac-hero-btns',
                            grow: false,
                            flexDirection: 'flex-row',
                            responsiveDirection: 'col-to-row',
                            gapX: 10,
                            content: [
                                btn('Book a chair →', { id: 'ac-hero-cta', backgroundColor: AC_FG, color: AC_BG, fontFamily: AC_FONT, borderRadius: 999, fontSize: 0.9375, fontWeight: 600 }),
                                btn('View services', { id: 'ac-hero-sec', backgroundColor: 'transparent', color: AC_FG, fontFamily: AC_FONT, borderRadius: 999, fontSize: 0.9375, fontWeight: 600, borderWidth: 1, borderColor: AC_FG, borderType: 'solid' }),
                            ],
                        }),
                    ],
                }),
                box({
                    id: 'ac-hero-img-wrap',
                    grow: true,
                    aspectRatio: '5/6',
                    overflow: 'hidden',
                    borderRadius: 24,
                    content: [img({ id: 'ac-hero-img' })],
                }),
            ],
        }),

        // ── SERVICES ──────────────────────────────────────────────────────────────
        box({
            id: 'ac-services',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 24,
            backgroundColor: AC_BG,
            content: [
                ct('Services', { id: 'ac-svc-ew', fontFamily: AC_FONT, fontSize: 0.6875, fontWeight: 600, lineHeight: 1, color: AC_FG, backgroundColor: AC_ACCENT, paddingExpanded: 'true', paddingTop: 0.375, paddingBottom: 0.375, paddingLeft: 0.75, paddingRight: 0.75, borderRadius: 999 }),
                ct('Care across textures, priced honestly.', { id: 'ac-svc-h', fontFamily: AC_FONT, fontSize: 3.25, fontWeight: 500, letterSpacing: -1, lineHeight: 1.1, color: AC_FG, maxWidth: 36 }),
                box({
                    id: 'ac-svc-grid',
                    flexDirection: 'flex-col',
                    gapY: 12,
                    content: [
                        acSvcCard('Silk Press', '2 hr', '$140', 'r1'),
                        acSvcCard('Color · Single Process', '2.5 hr', '$180', 'r2'),
                        acSvcCard('Curl Cut & Style', '90 min', '$110', 'r3'),
                        acSvcCard('Twist-Out · Refresh', '60 min', '$75', 'r4'),
                        acSvcCard('Trim Only', '30 min', '$50', 'r5'),
                    ],
                }),
            ],
        }),

        // ── PORTFOLIO ─────────────────────────────────────────────────────────────
        box({
            id: 'ac-port',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 32,
            backgroundColor: AC_BG,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: AC_BORDER,
            borderType: 'solid',
            content: [
                box({
                    id: 'ac-port-hd',
                    flexDirection: 'flex-row',
                    responsiveDirection: 'col-to-row',
                    mainAxisLayout: 'space-between',
                    altAxisLayout: 'end',
                    gapX: 16,
                    content: [
                        box({ id: 'ac-port-hdl', grow: false, gapY: 12, content: [
                            ct('Recent work', { id: 'ac-port-ew', fontFamily: AC_FONT, fontSize: 0.6875, fontWeight: 600, lineHeight: 1, color: AC_FG, backgroundColor: AC_ACCENT, paddingExpanded: 'true', paddingTop: 0.375, paddingBottom: 0.375, paddingLeft: 0.75, paddingRight: 0.75, borderRadius: 999 }),
                            ct('A small archive.', { id: 'ac-port-h', fontFamily: AC_FONT, fontSize: 3.25, fontWeight: 500, letterSpacing: -1, lineHeight: 1.1, color: AC_FG }),
                        ] }),
                        ct('Tap any image to view in full.', { id: 'ac-port-sub', fontSize: 0.8125, color: AC_MUTED, maxWidth: 15 }),
                    ],
                }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'ac-port-grid',
                        numberOfColumns: 3,
                        numberOfRows: 2,
                        gapX: 16,
                        gapY: 16,
                        justifyItems: 'stretch',
                        alignItems: 'stretch',
                        firstCellRowSpan: 1,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [box({ id: 'ac-pg1', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'ac-pg1-i' })] })] },
                            { cell: [box({ id: 'ac-pg2', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'ac-pg2-i' })] })] },
                            { cell: [box({ id: 'ac-pg3', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'ac-pg3-i' })] })] },
                            { cell: [box({ id: 'ac-pg4', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'ac-pg4-i' })] })] },
                            { cell: [box({ id: 'ac-pg5', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'ac-pg5-i' })] })] },
                            { cell: [box({ id: 'ac-pg6', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'ac-pg6-i' })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── ABOUT ─────────────────────────────────────────────────────────────────
        box({
            id: 'ac-about',
            responsiveDirection: 'col-to-row',
            altAxisLayout: 'center',
            spacing: 'spacious',
            gapX: 60,
            gapY: 32,
            backgroundColor: '#f1ede4',
            content: [
                box({ id: 'ac-ab-img-wrap', grow: true, aspectRatio: '4/5', overflow: 'hidden', borderRadius: 20, content: [img({ id: 'ac-ab-img' })] }),
                box({
                    id: 'ac-ab-text',
                    grow: true,
                    flexDirection: 'flex-col',
                    gapY: 20,
                    content: [
                        ct('About Naomi', { id: 'ac-ab-ew', fontFamily: AC_FONT, fontSize: 0.6875, fontWeight: 600, lineHeight: 1, color: AC_FG, backgroundColor: AC_ACCENT, paddingExpanded: 'true', paddingTop: 0.375, paddingBottom: 0.375, paddingLeft: 0.75, paddingRight: 0.75, borderRadius: 999 }),
                        ct('Hair as a quiet, continuing conversation.', { id: 'ac-ab-h', fontFamily: AC_FONT, fontSize: 3.25, fontWeight: 500, letterSpacing: -1, lineHeight: 1.1, color: AC_FG }),
                        ct('Naomi works across textures with a focus on sustainable color and gentle, low-manipulation styling. The studio is small on purpose — two clients a day, lavender tea on arrival, no rushing.', {
                            id: 'ac-ab-bio', fontFamily: AC_FONT, fontSize: 1, lineHeight: 1.65, color: AC_MUTED, maxWidth: 30,
                        }),
                        box({ id: 'ac-ab-stats', grow: false, flexDirection: 'flex-row', gapX: 24, content: [
                            box({ id: 'ac-abs1', grow: false, gapY: 2, content: [ct('9', { id: 'ac-abs1v', fontSize: 1.5, fontWeight: 600, lineHeight: 1, color: AC_FG }), ct('Years', { id: 'ac-abs1l', fontSize: 0.6875, color: AC_MUTED, lineHeight: 1 })] }),
                            box({ id: 'ac-abs2', grow: false, gapY: 2, content: [ct('1A–4C', { id: 'ac-abs2v', fontSize: 1.5, fontWeight: 600, lineHeight: 1, color: AC_FG }), ct('Textures', { id: 'ac-abs2l', fontSize: 0.6875, color: AC_MUTED, lineHeight: 1 })] }),
                            box({ id: 'ac-abs3', grow: false, gapY: 2, content: [ct('Pvt.', { id: 'ac-abs3v', fontSize: 1.5, fontWeight: 600, lineHeight: 1, color: AC_FG }), ct('Studio', { id: 'ac-abs3l', fontSize: 0.6875, color: AC_MUTED, lineHeight: 1 })] }),
                        ] }),
                    ],
                }),
            ],
        }),

        // ── REVIEWS ───────────────────────────────────────────────────────────────
        box({
            id: 'ac-reviews',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 32,
            backgroundColor: AC_BG,
            content: [
                ct('Words', { id: 'ac-rv-ew', fontFamily: AC_FONT, fontSize: 0.6875, fontWeight: 600, lineHeight: 1, color: AC_FG, backgroundColor: AC_ACCENT, paddingExpanded: 'true', paddingTop: 0.375, paddingBottom: 0.375, paddingLeft: 0.75, paddingRight: 0.75, borderRadius: 999 }),
                ct('What clients say.', { id: 'ac-rv-h', fontFamily: AC_FONT, fontSize: 3.25, fontWeight: 500, letterSpacing: -1, lineHeight: 1.1, color: AC_FG }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'ac-rv-grid',
                        numberOfColumns: 3,
                        numberOfRows: 1,
                        gapX: 16,
                        gapY: 16,
                        justifyItems: 'stretch',
                        alignItems: 'start',
                        firstCellRowSpan: 1,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [box({ id: 'ac-rv1', backgroundColor: AC_FIELD, borderRadius: 18, paddingExpanded: 'true', paddingTop: 1.75, paddingBottom: 1.75, paddingLeft: 1.75, paddingRight: 1.75, gapY: 10, content: [ct('★★★★★', { id: 'ac-rv1s', fontSize: 0.75, lineHeight: 1, color: AC_FG }), ct('"Calmest salon experience I\'ve had. Naomi listens, works slowly, and the color was exactly what I asked for."', { id: 'ac-rv1q', fontFamily: AC_FONT, fontSize: 0.9375, lineHeight: 1.55, color: AC_FG }), ct('— Lauren O.', { id: 'ac-rv1n', fontSize: 0.75, fontWeight: 600, color: AC_MUTED, lineHeight: 1 })] })] },
                            { cell: [box({ id: 'ac-rv2', backgroundColor: AC_FIELD, borderRadius: 18, paddingExpanded: 'true', paddingTop: 1.75, paddingBottom: 1.75, paddingLeft: 1.75, paddingRight: 1.75, gapY: 10, content: [ct('★★★★★', { id: 'ac-rv2s', fontSize: 0.75, lineHeight: 1, color: AC_FG }), ct('"She gets curls. My hair has never been healthier."', { id: 'ac-rv2q', fontFamily: AC_FONT, fontSize: 0.9375, lineHeight: 1.55, color: AC_FG }), ct('— Priya M.', { id: 'ac-rv2n', fontSize: 0.75, fontWeight: 600, color: AC_MUTED, lineHeight: 1 })] })] },
                            { cell: [box({ id: 'ac-rv3', backgroundColor: AC_FIELD, borderRadius: 18, paddingExpanded: 'true', paddingTop: 1.75, paddingBottom: 1.75, paddingLeft: 1.75, paddingRight: 1.75, gapY: 10, content: [ct('★★★★★', { id: 'ac-rv3s', fontSize: 0.75, lineHeight: 1, color: AC_FG }), ct('"It feels more like visiting a friend who happens to be a colorist."', { id: 'ac-rv3q', fontFamily: AC_FONT, fontSize: 0.9375, lineHeight: 1.55, color: AC_FG }), ct('— Ade J.', { id: 'ac-rv3n', fontSize: 0.75, fontWeight: 600, color: AC_MUTED, lineHeight: 1 })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── BOOKING CTA ───────────────────────────────────────────────────────────
        box({
            id: 'ac-cta',
            spacing: 'spacious',
            backgroundColor: AC_BG,
            content: [
                box({
                    id: 'ac-cta-card',
                    flexDirection: 'flex-col',
                    altAxisLayout: 'center',
                    paddingExpanded: 'true',
                    paddingTop: 4.5,
                    paddingBottom: 4.5,
                    paddingLeft: 3.75,
                    paddingRight: 3.75,
                    gapY: 16,
                    backgroundColor: AC_FG,
                    borderRadius: 28,
                    content: [
                        ct('Reserve your chair.', { id: 'ac-cta-h', fontFamily: AC_FONT, fontSize: 4.75, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.1, color: AC_BG, align: 'center' }),
                        ct('Two clients a day. Booking opens four weeks in advance.', { id: 'ac-cta-body', fontFamily: AC_FONT, fontSize: 1, lineHeight: 1.55, color: 'rgba(250,248,244,.7)', align: 'center', maxWidth: 26 }),
                        btn('Book a visit →', { id: 'ac-cta-btn', backgroundColor: AC_BG, color: AC_FG, fontFamily: AC_FONT, borderRadius: 999, fontSize: 0.9375, fontWeight: 600 }),
                    ],
                }),
            ],
        }),

        // ── FOOTER ────────────────────────────────────────────────────────────────
        box({
            id: 'ac-footer',
            responsiveDirection: 'col-to-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'start',
            spacing: 'tight',
            gapX: 32,
            gapY: 24,
            backgroundColor: AC_BG,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: AC_BORDER,
            borderType: 'solid',
            content: [
                box({ id: 'ac-ft-brand', grow: false, gapY: 8, content: [
                    ct('atelier clair', { id: 'ac-ft-name', fontFamily: AC_FONT, fontSize: 1.125, fontWeight: 600, lineHeight: 1, color: AC_FG }),
                    ct('812 W Lake St · Minneapolis, MN\nhello@atelierclair.co', { id: 'ac-ft-addr', fontFamily: AC_FONT, fontSize: 0.8125, lineHeight: 1.7, color: AC_MUTED }),
                ] }),
                box({ id: 'ac-ft-meta', grow: false, flexDirection: 'flex-row', gapX: 32, altAxisLayout: 'center', content: [
                    ct('Tue–Sat 10–6', { id: 'ac-ft-h', fontFamily: AC_FONT, fontSize: 0.8125, color: AC_MUTED }),
                    ct('Instagram', { id: 'ac-ft-ig', fontFamily: AC_FONT, fontSize: 0.8125, color: AC_MUTED }),
                    ct('Newsletter', { id: 'ac-ft-nl', fontFamily: AC_FONT, fontSize: 0.8125, color: AC_MUTED }),
                ] }),
            ],
        }),
    ],
    root: { props: {} },
    zones: {},
}

// ─── RougeMaison tokens ────────────────────────────────────────────────────────
const RM_BG = '#f4d9d4'
const RM_FG = '#0a0a0a'
const RM_ACCENT = '#a82847'
const RM_MUTED = 'rgba(10,10,10,.6)'
const RM_BORDER = 'rgba(10,10,10,.15)'
const RM_SERIF = '"Playfair Display", Georgia, serif'
const RM_BODY = '"DM Sans", "Inter", system-ui, sans-serif'

const rmSvcRow = (num: string, name: string, desc: string, price: string, id: string) =>
    wrapInCard(box({
        id: `rm-svc-${id}`,
        flexDirection: 'flex-row',
        mainAxisLayout: 'start',
        altAxisLayout: 'center',
        gapX: 16,
        borderExpanded: 'true',
        borderTop: 1,
        borderWidth: 0,
        borderColor: 'rgba(244,217,212,.2)',
        borderType: 'solid',
        paddingExpanded: 'true',
        paddingTop: 1.5,
        paddingBottom: 1.5,
        content: [
            ct(num, { id: `rm-svc-${id}-n`, fontFamily: RM_SERIF, fontSize: 1.125, lineHeight: 1, style: ['italic'], color: RM_ACCENT }),
            box({ id: `rm-svc-${id}-nm`, grow: true, content: [ct(name, { id: `rm-svc-${id}-t`, fontFamily: RM_SERIF, fontSize: 3, lineHeight: 0.95, color: '#f4d9d4' })] }),
            box({ id: `rm-svc-${id}-r`, grow: false, gapY: 4, content: [
                ct(price, { id: `rm-svc-${id}-p`, fontFamily: RM_SERIF, fontSize: 3, lineHeight: 0.95, style: ['italic'], color: RM_ACCENT }),
                ct(desc, { id: `rm-svc-${id}-d`, fontSize: 0.75, color: 'rgba(244,217,212,.6)', lineHeight: 1, letterSpacing: 1 }),
            ] }),
        ],
    }), `rm-card-${id}`)

const rougeMaisonData: Data = {
    content: [
        // ── NAV ───────────────────────────────────────────────────────────────────
        box({
            id: 'rm-nav',
            flexDirection: 'flex-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'center',
            spacing: 'tight',
            backgroundColor: RM_BG,
            borderExpanded: 'true',
            borderBottom: 1,
            borderWidth: 0,
            borderColor: RM_FG,
            borderType: 'solid',
            content: [
                ct('ROUGE Maison', { id: 'rm-nav-logo', fontFamily: RM_SERIF, fontSize: 1.625, letterSpacing: -0.5, lineHeight: 1, color: RM_FG }),
                box({
                    id: 'rm-nav-links',
                    grow: false,
                    flexDirection: 'flex-row',
                    gapX: 28,
                    hideBelow: 'lg',
                    altAxisLayout: 'center',
                    content: [
                        ct('Services', { id: 'rm-nl1', fontFamily: RM_BODY, fontSize: 0.75, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG }),
                        ct('Lookbook', { id: 'rm-nl2', fontFamily: RM_BODY, fontSize: 0.75, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG }),
                        ct('Press', { id: 'rm-nl3', fontFamily: RM_BODY, fontSize: 0.75, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG }),
                        ct('Contact', { id: 'rm-nl4', fontFamily: RM_BODY, fontSize: 0.75, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG }),
                    ],
                }),
                btn('Book Zara', { id: 'rm-nav-cta', backgroundColor: RM_FG, color: RM_BG, fontFamily: RM_BODY, borderRadius: 0, fontSize: 0.6875, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }),
            ],
        }),

        // ── HERO ──────────────────────────────────────────────────────────────────
        box({
            id: 'rm-hero',
            responsiveDirection: 'col-to-row',
            altAxisLayout: 'stretch',
            backgroundColor: RM_BG,
            content: [
                box({
                    id: 'rm-hero-text',
                    grow: true,
                    flexDirection: 'flex-col',
                    spacing: 'spacious',
                    gapY: 24,
                    content: [
                        box({ id: 'rm-hero-meta', grow: false, flexDirection: 'flex-row', mainAxisLayout: 'space-between', content: [
                            ct('Vol. 11 · No. 4', { id: 'rm-meta1', fontFamily: RM_SERIF, fontSize: 0.8125, letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1, color: RM_FG }),
                            ct("Spring '26", { id: 'rm-meta2', fontFamily: RM_SERIF, fontSize: 0.8125, letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1, color: RM_ACCENT }),
                        ] }),
                        ct('ROUGE', { id: 'rm-h1', fontFamily: RM_SERIF, fontSize: 9, lineHeight: 0.95, color: RM_FG, letterSpacing: -2 }),
                        ct('Maison.', { id: 'rm-h2', fontFamily: RM_SERIF, fontSize: 9, lineHeight: 0.95, style: ['italic'], color: RM_ACCENT, letterSpacing: -2 }),
                        box({ id: 'rm-hero-rule', grow: false, minHeight: 0.0625, backgroundColor: RM_FG, maxWidth: 20 }),
                        ct('Editorial-trained makeup artistry from Zara Mensah. Skin-first beauty, deep complexion expertise, and the kind of lookbook photos clients frame on their walls.', {
                            id: 'rm-hero-body', fontFamily: RM_BODY, fontSize: 1.125, lineHeight: 1.5, color: RM_FG, maxWidth: 26,
                        }),
                        box({ id: 'rm-hero-btns', grow: false, flexDirection: 'flex-row', responsiveDirection: 'col-to-row', gapX: 12, content: [
                            btn('Book a sitting →', { id: 'rm-hero-cta', backgroundColor: RM_ACCENT, color: RM_BG, fontFamily: RM_BODY, borderRadius: 0, fontSize: 0.8125, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }),
                            btn('View lookbook', { id: 'rm-hero-sec', backgroundColor: 'transparent', color: RM_FG, fontFamily: RM_BODY, borderRadius: 0, fontSize: 0.8125, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderWidth: 1.5, borderColor: RM_FG, borderType: 'solid' }),
                        ] }),
                        ct('Featured · Essence · Allure · NYFW \'24', { id: 'rm-hero-press', fontFamily: RM_BODY, fontSize: 0.6875, letterSpacing: 2, textTransform: 'uppercase', color: RM_MUTED, fontWeight: 600, lineHeight: 1 }),
                    ],
                }),
                box({
                    id: 'rm-hero-img-wrap',
                    grow: true,
                    overflow: 'hidden',
                    positionType: 'relative',
                    backgroundColor: RM_ACCENT,
                    minHeight: 45,
                    content: [
                        img({ id: 'rm-hero-img' }),
                        box({
                            id: 'rm-hero-tag',
                            positionType: 'absolute',
                            top: 0,
                            right: 0,
                            grow: false,
                            backgroundColor: RM_FG,
                            paddingExpanded: 'true',
                            paddingTop: 0.5,
                            paddingBottom: 0.5,
                            paddingLeft: 0.75,
                            paddingRight: 0.75,
                            content: [ct('"Skin like silk." — Allure', { id: 'rm-hero-tagtext', fontFamily: RM_SERIF, fontSize: 0.875, lineHeight: 1.3, style: ['italic'], color: RM_BG })],
                        }),
                    ],
                }),
            ],
        }),

        // ── SERVICES ──────────────────────────────────────────────────────────────
        box({
            id: 'rm-services',
            flexDirection: 'flex-col',
            spacing: 'normal',
            backgroundColor: RM_FG,
            content: [
                ct('The work', { id: 'rm-svc-ew', fontFamily: RM_BODY, fontSize: 0.6875, letterSpacing: 3, textTransform: 'uppercase', color: RM_ACCENT, fontWeight: 700, lineHeight: 1 }),
                ct('Five services.', { id: 'rm-svc-h1', fontFamily: RM_SERIF, fontSize: 5.5, lineHeight: 0.95, color: RM_BG, letterSpacing: -1 }),
                ct('One face at a time.', { id: 'rm-svc-h2', fontFamily: RM_SERIF, fontSize: 5.5, lineHeight: 0.95, style: ['italic'], color: RM_ACCENT, letterSpacing: -1 }),
                box({
                    id: 'rm-svc-list',
                    flexDirection: 'flex-col',
                    content: [
                        rmSvcRow('№1', 'Bridal · Trial', 'Full glam dress rehearsal', '$175', 'r1'),
                        rmSvcRow('№2', 'Bridal · Day-of', 'On-site, lashes included', '$350', 'r2'),
                        rmSvcRow('№3', 'Soft Glam', 'Photoshoot or event', '$140', 'r3'),
                        rmSvcRow('№4', 'Editorial / Creative', 'Lookbook, runway', '$280', 'r4'),
                        rmSvcRow('№5', 'Lesson · 1:1', 'Learn on your own face', '$165', 'r5'),
                    ],
                }),
            ],
        }),

        // ── LOOKBOOK ──────────────────────────────────────────────────────────────
        box({
            id: 'rm-port',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 32,
            backgroundColor: RM_BG,
            content: [
                box({ id: 'rm-port-hd', flexDirection: 'flex-row', responsiveDirection: 'col-to-row', mainAxisLayout: 'space-between', altAxisLayout: 'end', gapX: 16, content: [
                    box({ id: 'rm-port-hdl', grow: false, gapY: 8, content: [
                        ct("Lookbook · '24–'25", { id: 'rm-port-ew', fontFamily: RM_BODY, fontSize: 0.6875, letterSpacing: 3, textTransform: 'uppercase', color: RM_ACCENT, fontWeight: 700, lineHeight: 1 }),
                        box({ id: 'rm-port-htitle', grow: false, flexDirection: 'flex-row', gapX: 8, content: [
                            ct('Recent', { id: 'rm-port-h1', fontFamily: RM_SERIF, fontSize: 5.5, lineHeight: 0.95, color: RM_FG, letterSpacing: -1 }),
                            ct('faces.', { id: 'rm-port-h2', fontFamily: RM_SERIF, fontSize: 5.5, lineHeight: 0.95, style: ['italic'], color: RM_ACCENT, letterSpacing: -1 }),
                        ] }),
                    ] }),
                    ct('View all →', { id: 'rm-port-link', fontFamily: RM_BODY, fontSize: 0.75, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', style: ['underline'], color: RM_FG, lineHeight: 1 }),
                ] }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'rm-port-grid',
                        numberOfColumns: 3,
                        numberOfRows: 2,
                        gapX: 12,
                        gapY: 12,
                        justifyItems: 'stretch',
                        alignItems: 'stretch',
                        firstCellRowSpan: 2,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [box({ id: 'rm-pg1', aspectRatio: '4/5', overflow: 'hidden', padding: 0, content: [img({ id: 'rm-pg1-i' })] })] },
                            { cell: [box({ id: 'rm-pg2', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'rm-pg2-i' })] })] },
                            { cell: [box({ id: 'rm-pg3', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'rm-pg3-i' })] })] },
                            { cell: [box({ id: 'rm-pg4', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'rm-pg4-i' })] })] },
                            { cell: [box({ id: 'rm-pg5', aspectRatio: '1/1', overflow: 'hidden', padding: 0, content: [img({ id: 'rm-pg5-i' })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── ABOUT ─────────────────────────────────────────────────────────────────
        box({
            id: 'rm-about',
            responsiveDirection: 'col-to-row',
            altAxisLayout: 'center',
            spacing: 'spacious',
            gapX: 60,
            gapY: 32,
            backgroundColor: RM_ACCENT,
            content: [
                box({ id: 'rm-ab-img-wrap', grow: true, aspectRatio: '4/5', overflow: 'hidden', content: [img({ id: 'rm-ab-img' })] }),
                box({
                    id: 'rm-ab-text',
                    grow: true,
                    flexDirection: 'flex-col',
                    gapY: 24,
                    content: [
                        ct('The artist', { id: 'rm-ab-ew', fontFamily: RM_BODY, fontSize: 0.6875, letterSpacing: 3, textTransform: 'uppercase', color: RM_BG, fontWeight: 700, lineHeight: 1 }),
                        ct('Eleven years.\nThree magazines.\nCountless faces.', { id: 'rm-ab-h', fontFamily: RM_SERIF, fontSize: 5.5, lineHeight: 0.95, color: RM_BG, letterSpacing: -1 }),
                        ct("Zara's work has appeared in Essence, Allure, and on the runways at NYFW. She specializes in skin-first beauty across deep complexions.", {
                            id: 'rm-ab-bio', fontFamily: RM_BODY, fontSize: 1.0625, lineHeight: 1.6, color: RM_BG, maxWidth: 30,
                        }),
                        box({ id: 'rm-ab-stats', grow: false, flexDirection: 'flex-row', gapX: 32, paddingExpanded: 'true', paddingTop: 1.5, borderExpanded: 'true', borderTop: 1, borderWidth: 0, borderColor: 'rgba(244,217,212,.4)', borderType: 'solid', content: [
                            box({ id: 'rm-abs1', grow: false, gapY: 4, content: [ct('11', { id: 'rm-abs1v', fontFamily: RM_SERIF, fontSize: 3, lineHeight: 0.95, style: ['italic'], color: RM_BG }), ct('Years', { id: 'rm-abs1l', fontSize: 0.6875, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_BG, lineHeight: 1 })] }),
                            box({ id: 'rm-abs2', grow: false, gapY: 4, content: [ct('140+', { id: 'rm-abs2v', fontFamily: RM_SERIF, fontSize: 3, lineHeight: 0.95, style: ['italic'], color: RM_BG }), ct('Brides served', { id: 'rm-abs2l', fontSize: 0.6875, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_BG, lineHeight: 1 })] }),
                            box({ id: 'rm-abs3', grow: false, gapY: 4, content: [ct('42', { id: 'rm-abs3v', fontFamily: RM_SERIF, fontSize: 3, lineHeight: 0.95, style: ['italic'], color: RM_BG }), ct('Editorials', { id: 'rm-abs3l', fontSize: 0.6875, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_BG, lineHeight: 1 })] }),
                        ] }),
                    ],
                }),
            ],
        }),

        // ── REVIEWS ───────────────────────────────────────────────────────────────
        box({
            id: 'rm-reviews',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 32,
            backgroundColor: RM_BG,
            content: [
                ct('Words on the work', { id: 'rm-rv-ew', fontFamily: RM_BODY, fontSize: 0.6875, letterSpacing: 3, textTransform: 'uppercase', color: RM_ACCENT, fontWeight: 700, lineHeight: 1 }),
                box({ id: 'rm-rv-hrow', grow: false, flexDirection: 'flex-row', gapX: 8, content: [
                    ct('Press &', { id: 'rm-rv-h1', fontFamily: RM_SERIF, fontSize: 5.5, lineHeight: 0.95, color: RM_FG, letterSpacing: -1 }),
                    ct('letters.', { id: 'rm-rv-h2', fontFamily: RM_SERIF, fontSize: 5.5, lineHeight: 0.95, style: ['italic'], color: RM_ACCENT, letterSpacing: -1 }),
                ] }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'rm-rv-grid',
                        numberOfColumns: 3,
                        numberOfRows: 1,
                        gapX: 0,
                        gapY: 0,
                        justifyItems: 'stretch',
                        alignItems: 'start',
                        firstCellRowSpan: 1,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [box({ id: 'rm-rv1', paddingExpanded: 'true', paddingTop: 2, paddingBottom: 2, paddingLeft: 1.75, paddingRight: 1.75, borderExpanded: 'true', borderTop: 1, borderRight: 1, borderWidth: 0, borderColor: RM_FG, borderType: 'solid', gapY: 12, content: [ct('"', { id: 'rm-rv1-q', fontFamily: RM_SERIF, fontSize: 3.5, lineHeight: 0.5, color: RM_ACCENT }), ct('"Zara made my skin look like skin — luminous, not painted on."', { id: 'rm-rv1-body', fontFamily: RM_SERIF, fontSize: 1.375, lineHeight: 1.3, style: ['italic'], color: RM_FG }), ct('— Tola O. (bride)', { id: 'rm-rv1-n', fontFamily: RM_BODY, fontSize: 0.6875, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG })] })] },
                            { cell: [box({ id: 'rm-rv2', paddingExpanded: 'true', paddingTop: 2, paddingBottom: 2, paddingLeft: 1.75, paddingRight: 1.75, borderExpanded: 'true', borderTop: 1, borderRight: 1, borderWidth: 0, borderColor: RM_FG, borderType: 'solid', gapY: 12, content: [ct('"', { id: 'rm-rv2-q', fontFamily: RM_SERIF, fontSize: 3.5, lineHeight: 0.5, color: RM_ACCENT }), ct('"She nailed a 1970s editorial look I\'d been chasing for years."', { id: 'rm-rv2-body', fontFamily: RM_SERIF, fontSize: 1.375, lineHeight: 1.3, style: ['italic'], color: RM_FG }), ct('— Kerry M.', { id: 'rm-rv2-n', fontFamily: RM_BODY, fontSize: 0.6875, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG })] })] },
                            { cell: [box({ id: 'rm-rv3', paddingExpanded: 'true', paddingTop: 2, paddingBottom: 2, paddingLeft: 1.75, paddingRight: 1.75, borderExpanded: 'true', borderTop: 1, borderWidth: 0, borderColor: RM_FG, borderType: 'solid', gapY: 12, content: [ct('"', { id: 'rm-rv3-q', fontFamily: RM_SERIF, fontSize: 3.5, lineHeight: 0.5, color: RM_ACCENT }), ct('"Took a lesson with Zara and finally learned how to do my own brows."', { id: 'rm-rv3-body', fontFamily: RM_SERIF, fontSize: 1.375, lineHeight: 1.3, style: ['italic'], color: RM_FG }), ct('— Jada A.', { id: 'rm-rv3-n', fontFamily: RM_BODY, fontSize: 0.6875, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── BOOKING CTA ───────────────────────────────────────────────────────────
        box({
            id: 'rm-cta',
            flexDirection: 'flex-col',
            altAxisLayout: 'center',
            spacing: 'spacious',
            gapY: 12,
            backgroundColor: RM_FG,
            content: [
                ct('SIT FOR', { id: 'rm-cta-h1', fontFamily: RM_SERIF, fontSize: 9, lineHeight: 0.9, color: RM_BG, align: 'center', letterSpacing: -2 }),
                ct('Zara.', { id: 'rm-cta-h2', fontFamily: RM_SERIF, fontSize: 9, lineHeight: 0.9, style: ['italic'], color: RM_ACCENT, align: 'center', letterSpacing: -2 }),
                ct('Bridal books eight months out. Editorial & lookbook projects, by quote.', { id: 'rm-cta-body', fontFamily: RM_BODY, fontSize: 1.0625, lineHeight: 1.55, color: 'rgba(244,217,212,.7)', maxWidth: 28, align: 'center' }),
                btn('Reserve a sitting →', { id: 'rm-cta-btn', backgroundColor: RM_ACCENT, color: RM_BG, fontFamily: RM_BODY, borderRadius: 0, fontSize: 0.8125, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }),
            ],
        }),

        // ── FOOTER ────────────────────────────────────────────────────────────────
        box({
            id: 'rm-footer',
            responsiveDirection: 'col-to-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'start',
            spacing: 'tight',
            gapX: 32,
            gapY: 24,
            backgroundColor: RM_BG,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: RM_FG,
            borderType: 'solid',
            content: [
                box({ id: 'rm-ft-brand', grow: false, gapY: 8, content: [
                    ct('ROUGE Maison', { id: 'rm-ft-name', fontFamily: RM_SERIF, fontSize: 1.375, lineHeight: 1, color: RM_FG }),
                    ct('Studio · Atlanta, GA\nzara@rougemaison.studio', { id: 'rm-ft-addr', fontFamily: RM_BODY, fontSize: 0.75, lineHeight: 1.7, color: RM_MUTED }),
                ] }),
                box({ id: 'rm-ft-links', grow: false, flexDirection: 'flex-row', gapX: 32, altAxisLayout: 'center', content: [
                    ct('Bridal', { id: 'rm-ft-l1', fontFamily: RM_BODY, fontSize: 0.75, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG }),
                    ct('Editorial', { id: 'rm-ft-l2', fontFamily: RM_BODY, fontSize: 0.75, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG }),
                    ct('Press', { id: 'rm-ft-l3', fontFamily: RM_BODY, fontSize: 0.75, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG }),
                    ct('@rougemaison', { id: 'rm-ft-l4', fontFamily: RM_BODY, fontSize: 0.75, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: RM_FG }),
                ] }),
            ],
        }),
    ],
    root: { props: {} },
    zones: {},
}

// ─── CoilCrown tokens ──────────────────────────────────────────────────────────
const CC_BG = '#fdf3e3'
const CC_FG = '#3d1a3d'
const CC_ACCENT = '#e8a534'
const CC_MUTED = 'rgba(61,26,61,.6)'
const CC_BORDER = 'rgba(61,26,61,.18)'
const CC_ROSE = '#d96479'
const CC_SERIF = '"DM Serif Display", Georgia, serif'
const CC_BODY = '"Inter", system-ui, sans-serif'

const ccSvcCard = (num: string, name: string, desc: string, price: string, bg: string, id: string) =>
    wrapInCard(box({
        id: `cc-svc-${id}`,
        flexDirection: 'flex-col',
        mainAxisLayout: 'space-between',
        paddingExpanded: 'true',
        paddingTop: 1.5,
        paddingBottom: 1.5,
        paddingLeft: 1.5,
        paddingRight: 1.5,
        backgroundColor: bg,
        borderRadius: 20,
        minHeight: 12.5,
        gapY: 24,
        content: [
            box({ id: `cc-svc-${id}-top`, grow: true, gapY: 8, content: [
                ct(num, { id: `cc-svc-${id}-n`, fontFamily: CC_SERIF, fontSize: 2, lineHeight: 1, color: CC_FG, style: ['italic'] }),
                ct(name, { id: `cc-svc-${id}-t`, fontFamily: CC_SERIF, fontSize: 2.25, lineHeight: 1.0, color: CC_FG }),
                ct(desc, { id: `cc-svc-${id}-d`, fontFamily: CC_BODY, fontSize: 0.8125, lineHeight: 1.4, color: CC_FG }),
            ] }),
            box({ id: `cc-svc-${id}-bot`, grow: false, flexDirection: 'flex-row', mainAxisLayout: 'space-between', altAxisLayout: 'end', content: [
                ct(price, { id: `cc-svc-${id}-p`, fontFamily: CC_SERIF, fontSize: 1.75, lineHeight: 1, color: CC_FG }),
                ct('→', { id: `cc-svc-${id}-arr`, fontFamily: CC_BODY, fontSize: 0.875, lineHeight: 1, color: CC_FG }),
            ] }),
        ],
    }), `cc-card-${id}`)

const coilCrownData: Data = {
    content: [
        // ── NAV ───────────────────────────────────────────────────────────────────
        box({
            id: 'cc-nav',
            flexDirection: 'flex-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'center',
            spacing: 'tight',
            backgroundColor: CC_BG,
            content: [
                box({ id: 'cc-nav-logo', grow: false, flexDirection: 'flex-row', gapX: 8, altAxisLayout: 'center', content: [
                    ct('Coil & Crown', { id: 'cc-nav-name', fontFamily: CC_SERIF, fontSize: 1.375, lineHeight: 1, color: CC_FG }),
                ] }),
                box({
                    id: 'cc-nav-links',
                    grow: false,
                    flexDirection: 'flex-row',
                    gapX: 28,
                    hideBelow: 'lg',
                    altAxisLayout: 'center',
                    content: [
                        ct('Services', { id: 'cc-nl1', fontFamily: CC_BODY, fontSize: 0.8125, fontWeight: 500, color: CC_FG }),
                        ct('Journey', { id: 'cc-nl2', fontFamily: CC_BODY, fontSize: 0.8125, fontWeight: 500, color: CC_FG }),
                        ct('Studio', { id: 'cc-nl3', fontFamily: CC_BODY, fontSize: 0.8125, fontWeight: 500, color: CC_FG }),
                        ct('Visit', { id: 'cc-nl4', fontFamily: CC_BODY, fontSize: 0.8125, fontWeight: 500, color: CC_FG }),
                    ],
                }),
                btn('Book', { id: 'cc-nav-cta', backgroundColor: CC_FG, color: CC_BG, fontFamily: CC_BODY, borderRadius: 999, fontSize: 0.8125, fontWeight: 600 }),
            ],
        }),

        // ── HERO ──────────────────────────────────────────────────────────────────
        box({
            id: 'cc-hero',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 32,
            backgroundColor: CC_BG,
            content: [
                ct('Brooklyn · Est. 2011', { id: 'cc-hero-ew', fontFamily: CC_BODY, fontSize: 0.6875, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: CC_ROSE, lineHeight: 1 }),
                box({ id: 'cc-hero-htitle', grow: false, flexDirection: 'flex-row', gapX: 8, content: [
                    ct('Your', { id: 'cc-hero-h1', fontFamily: CC_SERIF, fontSize: 6, lineHeight: 1.0, color: CC_FG }),
                    ct('crown,', { id: 'cc-hero-h2', fontFamily: CC_SERIF, fontSize: 6, lineHeight: 1.0, style: ['italic'], color: CC_ROSE }),
                ] }),
                ct('cared for by hand.', { id: 'cc-hero-h3', fontFamily: CC_SERIF, fontSize: 6, lineHeight: 1.0, color: CC_FG }),
                ct('Imani has been growing, twisting, and sculpting locs in Brooklyn for fifteen years. Sit, sip something herbal, and let your roots breathe.', {
                    id: 'cc-hero-body', fontFamily: CC_BODY, fontSize: 1.125, lineHeight: 1.55, color: CC_MUTED, maxWidth: 30,
                }),
                box({ id: 'cc-hero-btns', grow: false, flexDirection: 'flex-row', responsiveDirection: 'col-to-row', gapX: 12, altAxisLayout: 'center', content: [
                    btn('Book a session →', { id: 'cc-hero-cta', backgroundColor: CC_FG, color: CC_BG, fontFamily: CC_BODY, borderRadius: 999, fontSize: 0.9375, fontWeight: 600 }),
                    ct('4.9 · 320+ reviews', { id: 'cc-hero-rating', fontFamily: CC_BODY, fontSize: 0.8125, color: CC_MUTED }),
                ] }),
                // Gallery collage
                box({ id: 'cc-hero-imgs', flexDirection: 'flex-row', gapX: 16, altAxisLayout: 'end', content: [
                    box({ id: 'cc-hi1', grow: true, aspectRatio: '4/5', overflow: 'hidden', borderRadius: 24, content: [img({ id: 'cc-hi1-i' })] }),
                    box({ id: 'cc-hi2', grow: false, aspectRatio: '3/4', overflow: 'hidden', borderRadius: 24, maxWidth: 14, content: [img({ id: 'cc-hi2-i' })] }),
                ] }),
            ],
        }),

        // ── SERVICES ──────────────────────────────────────────────────────────────
        box({
            id: 'cc-services',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 32,
            backgroundColor: CC_FG,
            content: [
                ct('The menu', { id: 'cc-svc-ew', fontFamily: CC_BODY, fontSize: 0.6875, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: CC_ACCENT, lineHeight: 1 }),
                box({ id: 'cc-svc-hrow', grow: false, flexDirection: 'flex-row', gapX: 8, content: [
                    ct('Five rituals.', { id: 'cc-svc-h1', fontFamily: CC_SERIF, fontSize: 4, lineHeight: 1.0, color: CC_BG }),
                    ct('One crown.', { id: 'cc-svc-h2', fontFamily: CC_SERIF, fontSize: 4, lineHeight: 1.0, style: ['italic'], color: CC_ROSE }),
                ] }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'cc-svc-grid',
                        numberOfColumns: 3,
                        numberOfRows: 2,
                        gapX: 12,
                        gapY: 12,
                        justifyItems: 'stretch',
                        alignItems: 'stretch',
                        firstCellRowSpan: 1,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [ccSvcCard('01', 'Loc Starter Set', 'Comb-coil or two-strand · 4 hr', '$220', CC_ACCENT, 'r1')] },
                            { cell: [ccSvcCard('02', 'Retwist & Style', 'Roots + finishing style · 2.5 hr', '$130', CC_ROSE, 'r2')] },
                            { cell: [ccSvcCard('03', 'Loc Detox', 'Deep cleanse + tea rinse · 90 min', '$90', '#5db995', 'r3')] },
                            { cell: [ccSvcCard('04', 'Updo · Special Event', 'Wedding, photoshoot · 2 hr', '$160', CC_ACCENT, 'r4')] },
                            { cell: [ccSvcCard('05', 'Color Treatment', 'Henna or semi-permanent · 3 hr', '$200', CC_ROSE, 'r5')] },
                        ],
                    },
                },
            ],
        }),

        // ── PORTFOLIO ─────────────────────────────────────────────────────────────
        box({
            id: 'cc-port',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 32,
            backgroundColor: CC_BG,
            content: [
                ct('Recent work', { id: 'cc-port-ew', fontFamily: CC_BODY, fontSize: 0.6875, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: CC_ROSE, lineHeight: 1 }),
                box({ id: 'cc-port-hrow', grow: false, flexDirection: 'flex-row', gapX: 8, content: [
                    ct('A field of', { id: 'cc-port-h1', fontFamily: CC_SERIF, fontSize: 4, lineHeight: 1.0, color: CC_FG }),
                    ct('crowns.', { id: 'cc-port-h2', fontFamily: CC_SERIF, fontSize: 4, lineHeight: 1.0, style: ['italic'], color: CC_ROSE }),
                ] }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'cc-port-grid',
                        numberOfColumns: 4,
                        numberOfRows: 2,
                        gapX: 16,
                        gapY: 16,
                        justifyItems: 'stretch',
                        alignItems: 'stretch',
                        firstCellRowSpan: 2,
                        firstCellColumnSpan: 2,
                        cells: [
                            { cell: [box({ id: 'cc-pg1', aspectRatio: '3/4', overflow: 'hidden', borderRadius: 16, padding: 0, content: [img({ id: 'cc-pg1-i' })] })] },
                            { cell: [box({ id: 'cc-pg2', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 16, padding: 0, content: [img({ id: 'cc-pg2-i' })] })] },
                            { cell: [box({ id: 'cc-pg3', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 16, padding: 0, content: [img({ id: 'cc-pg3-i' })] })] },
                            { cell: [box({ id: 'cc-pg4', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 16, padding: 0, content: [img({ id: 'cc-pg4-i' })] })] },
                            { cell: [box({ id: 'cc-pg5', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 16, padding: 0, content: [img({ id: 'cc-pg5-i' })] })] },
                            { cell: [box({ id: 'cc-pg6', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 16, padding: 0, content: [img({ id: 'cc-pg6-i' })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── ABOUT ─────────────────────────────────────────────────────────────────
        box({
            id: 'cc-about',
            responsiveDirection: 'col-to-row',
            altAxisLayout: 'center',
            spacing: 'spacious',
            gapX: 60,
            gapY: 32,
            backgroundColor: CC_ACCENT,
            content: [
                box({ id: 'cc-ab-img-wrap', grow: true, aspectRatio: '4/5', overflow: 'hidden', borderRadius: 24, content: [img({ id: 'cc-ab-img' })] }),
                box({
                    id: 'cc-ab-text',
                    grow: true,
                    flexDirection: 'flex-col',
                    gapY: 20,
                    content: [
                        ct('About Imani', { id: 'cc-ab-ew', fontFamily: CC_BODY, fontSize: 0.6875, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: CC_FG, lineHeight: 1 }),
                        ct('Fifteen years on the journey with you.', { id: 'cc-ab-h', fontFamily: CC_SERIF, fontSize: 4, lineHeight: 1.0, color: CC_FG }),
                        ct('Imani has been growing locs for fifteen years and styling them like sculpture for ten. Each appointment includes a scalp consultation, herbal tea, and a Polaroid for the wall.', {
                            id: 'cc-ab-bio', fontFamily: CC_BODY, fontSize: 1, lineHeight: 1.6, color: CC_FG, maxWidth: 30,
                        }),
                        box({ id: 'cc-ab-tags', grow: false, flexDirection: 'flex-row', gapX: 8, gapY: 8, content: [
                            ct('Loc journey expert', { id: 'cc-tag1', fontFamily: CC_BODY, fontSize: 0.75, fontWeight: 500, paddingExpanded: 'true', paddingTop: 0.5, paddingBottom: 0.5, paddingLeft: 0.875, paddingRight: 0.875, backgroundColor: CC_FG, color: CC_BG, borderRadius: 999, lineHeight: 1 }),
                            ct('Herbal scalp care', { id: 'cc-tag2', fontFamily: CC_BODY, fontSize: 0.75, fontWeight: 500, paddingExpanded: 'true', paddingTop: 0.5, paddingBottom: 0.5, paddingLeft: 0.875, paddingRight: 0.875, backgroundColor: CC_FG, color: CC_BG, borderRadius: 999, lineHeight: 1 }),
                            ct('Bridal updos', { id: 'cc-tag3', fontFamily: CC_BODY, fontSize: 0.75, fontWeight: 500, paddingExpanded: 'true', paddingTop: 0.5, paddingBottom: 0.5, paddingLeft: 0.875, paddingRight: 0.875, backgroundColor: CC_FG, color: CC_BG, borderRadius: 999, lineHeight: 1 }),
                        ] }),
                    ],
                }),
            ],
        }),

        // ── REVIEWS ───────────────────────────────────────────────────────────────
        box({
            id: 'cc-reviews',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 32,
            backgroundColor: CC_BG,
            content: [
                ct('Words from the chair', { id: 'cc-rv-ew', fontFamily: CC_BODY, fontSize: 0.6875, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: CC_ROSE, lineHeight: 1 }),
                ct('What folks say.', { id: 'cc-rv-h', fontFamily: CC_SERIF, fontSize: 4, lineHeight: 1.0, color: CC_FG }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'cc-rv-grid',
                        numberOfColumns: 3,
                        numberOfRows: 1,
                        gapX: 16,
                        gapY: 16,
                        justifyItems: 'stretch',
                        alignItems: 'start',
                        firstCellRowSpan: 1,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [box({ id: 'cc-rv1', backgroundColor: CC_ROSE, borderRadius: 20, paddingExpanded: 'true', paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 1.5, paddingRight: 1.5, gapY: 10, content: [ct('★★★★★', { id: 'cc-rv1s', fontSize: 0.75, color: CC_FG, lineHeight: 1 }), ct('"Imani treated my crown like an installation. I left feeling like a whole exhibition."', { id: 'cc-rv1q', fontFamily: CC_BODY, fontSize: 0.9375, lineHeight: 1.55, color: CC_FG }), ct('— Khadija L.', { id: 'cc-rv1n', fontSize: 0.75, fontWeight: 700, color: CC_FG, lineHeight: 1 })] })] },
                            { cell: [box({ id: 'cc-rv2', backgroundColor: CC_ACCENT, borderRadius: 20, paddingExpanded: 'true', paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 1.5, paddingRight: 1.5, gapY: 10, content: [ct('★★★★★', { id: 'cc-rv2s', fontSize: 0.75, color: CC_FG, lineHeight: 1 }), ct('"Five years deep on my loc journey with her. I trust no one else with my hair."', { id: 'cc-rv2q', fontFamily: CC_BODY, fontSize: 0.9375, lineHeight: 1.55, color: CC_FG }), ct('— Folake A.', { id: 'cc-rv2n', fontSize: 0.75, fontWeight: 700, color: CC_FG, lineHeight: 1 })] })] },
                            { cell: [box({ id: 'cc-rv3', backgroundColor: '#5db995', borderRadius: 20, paddingExpanded: 'true', paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 1.5, paddingRight: 1.5, gapY: 10, content: [ct('★★★★★', { id: 'cc-rv3s', fontSize: 0.75, color: CC_FG, lineHeight: 1 }), ct('"She braided gold thread through my locs for my wedding. Photos still going viral."', { id: 'cc-rv3q', fontFamily: CC_BODY, fontSize: 0.9375, lineHeight: 1.55, color: CC_FG }), ct('— Renée S.', { id: 'cc-rv3n', fontSize: 0.75, fontWeight: 700, color: CC_FG, lineHeight: 1 })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── BOOKING CTA ───────────────────────────────────────────────────────────
        box({
            id: 'cc-cta',
            flexDirection: 'flex-col',
            altAxisLayout: 'center',
            spacing: 'spacious',
            gapY: 20,
            backgroundColor: CC_ROSE,
            content: [
                ct('Ready to sit?', { id: 'cc-cta-h', fontFamily: CC_SERIF, fontSize: 6, lineHeight: 1.0, color: CC_FG, align: 'center' }),
                ct('Sessions release Sunday at 8pm for the following week. Tea will be ready.', { id: 'cc-cta-body', fontFamily: CC_BODY, fontSize: 1.0625, lineHeight: 1.5, color: CC_FG, maxWidth: 28, align: 'center' }),
                btn('Book a session →', { id: 'cc-cta-btn', backgroundColor: CC_FG, color: CC_BG, fontFamily: CC_BODY, borderRadius: 999, fontSize: 0.9375, fontWeight: 600 }),
            ],
        }),

        // ── FOOTER ────────────────────────────────────────────────────────────────
        box({
            id: 'cc-footer',
            responsiveDirection: 'col-to-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'start',
            spacing: 'tight',
            gapX: 32,
            gapY: 24,
            backgroundColor: CC_FG,
            content: [
                box({ id: 'cc-ft-brand', grow: false, gapY: 8, content: [
                    ct('Coil & Crown', { id: 'cc-ft-name', fontFamily: CC_SERIF, fontSize: 1.375, lineHeight: 1, color: CC_BG }),
                    ct('218 Lefferts Pl · Brooklyn, NY 11238\nimani@coilandcrown.studio', { id: 'cc-ft-addr', fontFamily: CC_BODY, fontSize: 0.75, lineHeight: 1.7, color: 'rgba(253,243,227,.7)' }),
                ] }),
                box({ id: 'cc-ft-meta', grow: false, flexDirection: 'flex-row', gapX: 32, altAxisLayout: 'center', content: [
                    ct('Wed–Sun by appt.', { id: 'cc-ft-h', fontFamily: CC_BODY, fontSize: 0.8125, color: 'rgba(253,243,227,.7)' }),
                    ct('@coilandcrown', { id: 'cc-ft-ig', fontFamily: CC_BODY, fontSize: 0.8125, color: 'rgba(253,243,227,.7)' }),
                ] }),
            ],
        }),
    ],
    root: { props: {} },
    zones: {},
}

// ─── Quickstart tokens ─────────────────────────────────────────────────────────
const QS_BG = '#ffffff'
const QS_FG = '#171717'
const QS_ACCENT = '#c4593a'
const QS_MUTED = 'rgba(23,23,23,.6)'
const QS_BORDER = 'rgba(23,23,23,.12)'
const QS_FIELD = 'rgba(23,23,23,.04)'
const QS_FONT = '"Inter", system-ui, sans-serif'

const qsSvcRow = (name: string, duration: string, price: string, id: string) =>
    wrapInCard(box({
        id: `qs-svc-${id}`,
        flexDirection: 'flex-row',
        mainAxisLayout: 'space-between',
        altAxisLayout: 'center',
        paddingExpanded: 'true',
        paddingTop: 1.25,
        paddingBottom: 1.25,
        paddingLeft: 1.25,
        paddingRight: 1.25,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: QS_BORDER,
        borderType: 'solid',
        gapX: 16,
        content: [
            box({ id: `qs-svc-${id}-l`, grow: true, gapY: 4, content: [
                ct(name, { id: `qs-svc-${id}-n`, fontFamily: QS_FONT, fontSize: 1.375, fontWeight: 700, lineHeight: 1.15, color: QS_FG }),
                ct(duration, { id: `qs-svc-${id}-d`, fontFamily: QS_FONT, fontSize: 0.8125, color: QS_MUTED, lineHeight: 1 }),
            ] }),
            box({ id: `qs-svc-${id}-r`, grow: false, flexDirection: 'flex-row', gapX: 12, altAxisLayout: 'center', content: [
                ct(price, { id: `qs-svc-${id}-p`, fontFamily: QS_FONT, fontSize: 1.125, fontWeight: 700, color: QS_FG, lineHeight: 1 }),
                btn('Book', { id: `qs-svc-${id}-btn`, backgroundColor: QS_ACCENT, color: '#ffffff', fontFamily: QS_FONT, borderRadius: 8, fontSize: 0.8125, fontWeight: 600, paddingExpanded: 'true', paddingTop: 0.5, paddingBottom: 0.5, paddingLeft: 0.875, paddingRight: 0.875 }),
            ] }),
        ],
    }), `qs-card-${id}`)

const quickstartData: Data = {
    content: [
        // ── NAV ───────────────────────────────────────────────────────────────────
        box({
            id: 'qs-nav',
            flexDirection: 'flex-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'center',
            spacing: 'tight',
            backgroundColor: QS_BG,
            borderExpanded: 'true',
            borderBottom: 1,
            borderWidth: 0,
            borderColor: QS_BORDER,
            borderType: 'solid',
            content: [
                box({ id: 'qs-nav-logo', grow: false, flexDirection: 'flex-row', gapX: 10, altAxisLayout: 'center', content: [
                    box({ id: 'qs-nav-icon', grow: false, paddingExpanded: 'true', paddingTop: 0.5, paddingBottom: 0.5, paddingLeft: 0.5, paddingRight: 0.5, backgroundColor: QS_ACCENT, borderRadius: 8, content: [ct('AJ', { id: 'qs-nav-initials', fontFamily: QS_FONT, fontSize: 0.875, fontWeight: 700, lineHeight: 1, color: '#ffffff' })] }),
                    ct('Aaliyah James', { id: 'qs-nav-name', fontFamily: QS_FONT, fontSize: 1, fontWeight: 700, lineHeight: 1, color: QS_FG }),
                ] }),
                box({ id: 'qs-nav-links', grow: false, flexDirection: 'flex-row', gapX: 28, hideBelow: 'lg', altAxisLayout: 'center', content: [
                    ct('Services', { id: 'qs-nl1', fontFamily: QS_FONT, fontSize: 0.875, color: QS_FG }),
                    ct('Gallery', { id: 'qs-nl2', fontFamily: QS_FONT, fontSize: 0.875, color: QS_FG }),
                    ct('About', { id: 'qs-nl3', fontFamily: QS_FONT, fontSize: 0.875, color: QS_FG }),
                    ct('Contact', { id: 'qs-nl4', fontFamily: QS_FONT, fontSize: 0.875, color: QS_FG }),
                ] }),
                btn('Book now', { id: 'qs-nav-cta', backgroundColor: QS_ACCENT, color: '#ffffff', fontFamily: QS_FONT, borderRadius: 10, fontSize: 0.875, fontWeight: 600 }),
            ],
        }),

        // ── HERO ──────────────────────────────────────────────────────────────────
        box({
            id: 'qs-hero',
            flexDirection: 'flex-col',
            altAxisLayout: 'center',
            spacing: 'spacious',
            gapY: 20,
            backgroundColor: QS_BG,
            content: [
                ct('Hair Stylist · Charlotte, NC', { id: 'qs-hero-ew', fontFamily: QS_FONT, fontSize: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, color: QS_ACCENT }),
                ct('Healthy hair, made simple.', { id: 'qs-hero-h', fontFamily: QS_FONT, fontSize: 3.75, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15, color: QS_FG, align: 'center', maxWidth: 45 }),
                ct("Hi, I'm Aaliyah! I've been doing hair for six years out of a cozy home studio in South End. I love color, healthy hair routines, and a good laugh in the chair.", {
                    id: 'qs-hero-body', fontFamily: QS_FONT, fontSize: 1.0625, lineHeight: 1.55, color: QS_MUTED, align: 'center', maxWidth: 32,
                }),
                box({ id: 'qs-hero-btns', grow: false, flexDirection: 'flex-row', responsiveDirection: 'col-to-row', gapX: 12, mainAxisLayout: 'center', content: [
                    btn('Book an appointment', { id: 'qs-hero-cta', backgroundColor: QS_ACCENT, color: '#ffffff', fontFamily: QS_FONT, borderRadius: 10, fontSize: 0.9375, fontWeight: 600 }),
                    btn('See my work', { id: 'qs-hero-sec', backgroundColor: 'transparent', color: QS_FG, fontFamily: QS_FONT, borderRadius: 10, fontSize: 0.9375, fontWeight: 600, borderWidth: 1, borderColor: QS_BORDER, borderType: 'solid' }),
                ] }),
                box({ id: 'qs-hero-trust', grow: false, flexDirection: 'flex-row', gapX: 16, paddingExpanded: 'true', paddingTop: 0.75, paddingBottom: 0.75, paddingLeft: 1.25, paddingRight: 1.25, backgroundColor: QS_FIELD, borderRadius: 999, altAxisLayout: 'center', content: [
                    ct('★★★★★ 4.9', { id: 'qs-trust1', fontFamily: QS_FONT, fontSize: 0.8125, color: QS_MUTED }),
                    ct('·', { id: 'qs-trust-d1', fontFamily: QS_FONT, fontSize: 0.8125, color: QS_MUTED }),
                    ct('120+ clients', { id: 'qs-trust2', fontFamily: QS_FONT, fontSize: 0.8125, color: QS_MUTED }),
                    ct('·', { id: 'qs-trust-d2', fontFamily: QS_FONT, fontSize: 0.8125, color: QS_MUTED }),
                    ct('6 yrs experience', { id: 'qs-trust3', fontFamily: QS_FONT, fontSize: 0.8125, color: QS_MUTED }),
                ] }),
            ],
        }),

        // ── HERO IMAGE ────────────────────────────────────────────────────────────
        box({
            id: 'qs-hero-img',
            spacing: 'normal',
            backgroundColor: QS_BG,
            content: [
                box({ id: 'qs-hero-img-wrap', aspectRatio: '16/7', overflow: 'hidden', borderRadius: 16, content: [img({ id: 'qs-hi' })] }),
            ],
        }),

        // ── SERVICES ──────────────────────────────────────────────────────────────
        box({
            id: 'qs-services',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 20,
            backgroundColor: QS_BG,
            content: [
                ct('Services', { id: 'qs-svc-ew', fontFamily: QS_FONT, fontSize: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, color: QS_ACCENT }),
                ct('What I do.', { id: 'qs-svc-h', fontFamily: QS_FONT, fontSize: 2.5, fontWeight: 700, letterSpacing: -1, lineHeight: 1.15, color: QS_FG }),
                box({ id: 'qs-svc-list', flexDirection: 'flex-col', gapY: 12, content: [
                    qsSvcRow('Wash, Cut & Style', '90 min', '$85', 'r1'),
                    qsSvcRow('Box Braids · Medium', '5 hr', '$200', 'r2'),
                    qsSvcRow('Silk Press', '2 hr', '$100', 'r3'),
                    qsSvcRow('Color Refresh', '2 hr', '$130', 'r4'),
                    qsSvcRow('Trim Only', '30 min', '$40', 'r5'),
                ] }),
            ],
        }),

        // ── GALLERY ───────────────────────────────────────────────────────────────
        box({
            id: 'qs-gallery',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 20,
            backgroundColor: QS_FIELD,
            content: [
                ct('Recent work', { id: 'qs-gal-ew', fontFamily: QS_FONT, fontSize: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, color: QS_ACCENT }),
                ct('Gallery.', { id: 'qs-gal-h', fontFamily: QS_FONT, fontSize: 2.5, fontWeight: 700, letterSpacing: -1, lineHeight: 1.15, color: QS_FG }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'qs-gal-grid',
                        numberOfColumns: 4,
                        numberOfRows: 1,
                        gapX: 12,
                        gapY: 12,
                        justifyItems: 'stretch',
                        alignItems: 'stretch',
                        firstCellRowSpan: 1,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [box({ id: 'qs-g1', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'qs-g1-i' })] })] },
                            { cell: [box({ id: 'qs-g2', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'qs-g2-i' })] })] },
                            { cell: [box({ id: 'qs-g3', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'qs-g3-i' })] })] },
                            { cell: [box({ id: 'qs-g4', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 12, padding: 0, content: [img({ id: 'qs-g4-i' })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── ABOUT ─────────────────────────────────────────────────────────────────
        box({
            id: 'qs-about',
            responsiveDirection: 'col-to-row',
            altAxisLayout: 'center',
            spacing: 'normal',
            gapX: 40,
            gapY: 32,
            backgroundColor: QS_BG,
            content: [
                box({ id: 'qs-ab-img-wrap', grow: false, aspectRatio: '1/1', overflow: 'hidden', borderRadius: 16, maxWidth: 22, content: [img({ id: 'qs-ab-img' })] }),
                box({
                    id: 'qs-ab-text',
                    grow: true,
                    flexDirection: 'flex-col',
                    gapY: 16,
                    content: [
                        ct('About me', { id: 'qs-ab-ew', fontFamily: QS_FONT, fontSize: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, color: QS_ACCENT }),
                        ct("Hi, I'm Aaliyah!", { id: 'qs-ab-h', fontFamily: QS_FONT, fontSize: 2.5, fontWeight: 700, letterSpacing: -1, lineHeight: 1.15, color: QS_FG }),
                        ct("I've been doing hair for 6 years and I love every part of it — from helping a new client find their first protective style to getting curls back on track after years of damage. My studio is small, calm, and welcoming.", {
                            id: 'qs-ab-bio', fontFamily: QS_FONT, fontSize: 1, lineHeight: 1.6, color: QS_MUTED, maxWidth: 35,
                        }),
                        box({ id: 'qs-ab-creds', grow: false, flexDirection: 'flex-col', gapY: 8, content: [
                            ct('✓ Licensed cosmetologist (NC, 2018)', { id: 'qs-cred1', fontFamily: QS_FONT, fontSize: 0.875, lineHeight: 1.4, color: QS_FG }),
                            ct('✓ Certified in healthy hair color', { id: 'qs-cred2', fontFamily: QS_FONT, fontSize: 0.875, lineHeight: 1.4, color: QS_FG }),
                            ct('✓ Specializes in natural & relaxed textures', { id: 'qs-cred3', fontFamily: QS_FONT, fontSize: 0.875, lineHeight: 1.4, color: QS_FG }),
                        ] }),
                    ],
                }),
            ],
        }),

        // ── REVIEWS ───────────────────────────────────────────────────────────────
        box({
            id: 'qs-reviews',
            flexDirection: 'flex-col',
            spacing: 'normal',
            gapY: 20,
            backgroundColor: QS_FIELD,
            content: [
                ct('Reviews', { id: 'qs-rv-ew', fontFamily: QS_FONT, fontSize: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, color: QS_ACCENT }),
                ct('What clients say.', { id: 'qs-rv-h', fontFamily: QS_FONT, fontSize: 2.5, fontWeight: 700, letterSpacing: -1, lineHeight: 1.15, color: QS_FG }),
                {
                    type: 'Grid' as const,
                    props: {
                        id: 'qs-rv-grid',
                        numberOfColumns: 3,
                        numberOfRows: 1,
                        gapX: 12,
                        gapY: 12,
                        justifyItems: 'stretch',
                        alignItems: 'start',
                        firstCellRowSpan: 1,
                        firstCellColumnSpan: 1,
                        cells: [
                            { cell: [box({ id: 'qs-rv1', backgroundColor: QS_BG, borderRadius: 12, borderWidth: 1, borderColor: QS_BORDER, borderType: 'solid', paddingExpanded: 'true', paddingTop: 1.25, paddingBottom: 1.25, paddingLeft: 1.25, paddingRight: 1.25, gapY: 8, content: [ct('★★★★★', { id: 'qs-rv1s', fontSize: 0.75, color: QS_FG, lineHeight: 1 }), ct('"Aaliyah is the sweetest. She listens, takes her time, and my hair has been thriving."', { id: 'qs-rv1q', fontFamily: QS_FONT, fontSize: 0.875, lineHeight: 1.55, color: QS_FG }), ct('— Brianna', { id: 'qs-rv1n', fontSize: 0.8125, fontWeight: 600, color: QS_FG, lineHeight: 1 })] })] },
                            { cell: [box({ id: 'qs-rv2', backgroundColor: QS_BG, borderRadius: 12, borderWidth: 1, borderColor: QS_BORDER, borderType: 'solid', paddingExpanded: 'true', paddingTop: 1.25, paddingBottom: 1.25, paddingLeft: 1.25, paddingRight: 1.25, gapY: 8, content: [ct('★★★★★', { id: 'qs-rv2s', fontSize: 0.75, color: QS_FG, lineHeight: 1 }), ct('"Best braids I\'ve had in Charlotte. Lasted 8 weeks looking fresh!"', { id: 'qs-rv2q', fontFamily: QS_FONT, fontSize: 0.875, lineHeight: 1.55, color: QS_FG }), ct('— Kendra', { id: 'qs-rv2n', fontSize: 0.8125, fontWeight: 600, color: QS_FG, lineHeight: 1 })] })] },
                            { cell: [box({ id: 'qs-rv3', backgroundColor: QS_BG, borderRadius: 12, borderWidth: 1, borderColor: QS_BORDER, borderType: 'solid', paddingExpanded: 'true', paddingTop: 1.25, paddingBottom: 1.25, paddingLeft: 1.25, paddingRight: 1.25, gapY: 8, content: [ct('★★★★★', { id: 'qs-rv3s', fontSize: 0.75, color: QS_FG, lineHeight: 1 }), ct('"She really cares about hair health. My ends have never looked better."', { id: 'qs-rv3q', fontFamily: QS_FONT, fontSize: 0.875, lineHeight: 1.55, color: QS_FG }), ct('— Maya', { id: 'qs-rv3n', fontSize: 0.8125, fontWeight: 600, color: QS_FG, lineHeight: 1 })] })] },
                        ],
                    },
                },
            ],
        }),

        // ── BOOKING CTA ───────────────────────────────────────────────────────────
        box({
            id: 'qs-cta',
            spacing: 'normal',
            backgroundColor: QS_BG,
            content: [
                box({
                    id: 'qs-cta-card',
                    flexDirection: 'flex-col',
                    altAxisLayout: 'center',
                    paddingExpanded: 'true',
                    paddingTop: 3,
                    paddingBottom: 3,
                    paddingLeft: 3.5,
                    paddingRight: 3.5,
                    gapY: 12,
                    backgroundColor: QS_FG,
                    borderRadius: 20,
                    content: [
                        ct('Ready to book?', { id: 'qs-cta-h', fontFamily: QS_FONT, fontSize: 2.5, fontWeight: 700, letterSpacing: -1, lineHeight: 1.15, color: QS_BG, align: 'center' }),
                        ct("Pick a time that works for you. I'll send a confirmation right after.", { id: 'qs-cta-body', fontFamily: QS_FONT, fontSize: 1, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', align: 'center', maxWidth: 25 }),
                        btn('Book an appointment →', { id: 'qs-cta-btn', backgroundColor: QS_ACCENT, color: '#ffffff', fontFamily: QS_FONT, borderRadius: 10, fontSize: 0.9375, fontWeight: 600 }),
                        ct('Or reach me at (704) 555-0177', { id: 'qs-cta-tel', fontFamily: QS_FONT, fontSize: 0.8125, color: 'rgba(255,255,255,.6)', align: 'center', lineHeight: 1 }),
                    ],
                }),
            ],
        }),

        // ── FOOTER ────────────────────────────────────────────────────────────────
        box({
            id: 'qs-footer',
            flexDirection: 'flex-row',
            mainAxisLayout: 'space-between',
            altAxisLayout: 'center',
            spacing: 'tight',
            responsiveDirection: 'col-to-row',
            backgroundColor: QS_BG,
            borderExpanded: 'true',
            borderTop: 1,
            borderWidth: 0,
            borderColor: QS_BORDER,
            borderType: 'solid',
            content: [
                ct('© Aaliyah James, 2026 · Built on AfroAllure', { id: 'qs-ft-copy', fontFamily: QS_FONT, fontSize: 0.8125, color: QS_MUTED, lineHeight: 1 }),
                box({ id: 'qs-ft-social', grow: false, flexDirection: 'flex-row', gapX: 16, content: [
                    ct('Instagram', { id: 'qs-ft-ig', fontFamily: QS_FONT, fontSize: 0.8125, color: QS_MUTED }),
                    ct('TikTok', { id: 'qs-ft-tt', fontFamily: QS_FONT, fontSize: 0.8125, color: QS_MUTED }),
                ] }),
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
    {
        id: 'fade-house',
        name: 'Fade House',
        description: 'Bold urban barber — charcoal, blood red, Anton display. Condensed, powerful, fast.',
        category: 'modern',
        data: fadeHouseData,
    },
    {
        id: 'atelier-clair',
        name: 'Atelier Clair',
        description: 'Soft minimal salon — bone, lavender, Manrope. Generous whitespace, rounded cards.',
        category: 'minimal',
        data: atelierClairData,
    },
    {
        id: 'rouge-maison',
        name: 'Rouge Maison',
        description: 'Editorial MUA — blush, black, rouge. Playfair Display serif, magazine-cover layout.',
        category: 'luxury',
        data: rougeMaisonData,
    },
    {
        id: 'coil-crown',
        name: 'Coil & Crown',
        description: 'Vibrant loctician — cream, aubergine, marigold. DM Serif Display, expressive layout.',
        category: 'modern',
        data: coilCrownData,
    },
    {
        id: 'quickstart',
        name: 'Quickstart',
        description: 'Simple starter — white, charcoal, coral. Inter throughout. Fast to customize.',
        category: 'minimal',
        data: quickstartData,
    },
]
