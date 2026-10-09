// Real photos, reels, videos and screen recordings on the marketing pages.
// No stock or AI-generated faces: stylists' work only with their yes, credited
// by name. See ./README.md for how to add an item and what permission to get.
//
// Two lists:
//   STYLIST_MEDIA  the "Real work" gallery on each page
//   SLOT_MEDIA     replaces one of a page's built-in animated demos (the hero
//                  visual, the demo frame, a feature row) with a real video,
//                  screen recording or photo
// Anything not filled in keeps its animated demo, so no page has an empty hole.

export type MarketingPageSlug =
    | 'braiders' | 'locticians' | 'natural-hair' | 'wigs-and-installs'
    | 'nails' | 'lashes' | 'brows' | 'makeup'
    | 'calendar' | 'website-builder' | 'smart-pricing' | 'reminders'
    | 'payments' | 'no-show-protection' | 'loyalty' | 'client-management'

export type MediaSource =
    /** A photo in /public, e.g. '/stylists/kayla-knotless.jpg'. */
    | { kind: 'image'; src: string }
    /** An MP4 in /public (a downloaded reel or a screen recording, under ~8 MB). `poster` is a still from it. */
    | { kind: 'video'; src: string; poster?: string }
    /** A public Instagram reel or post, embedded. `code` is the part after /reel/ or /p/ in its link. */
    | { kind: 'instagram'; code: string }

export interface Credit {
    name: string
    /** Instagram handle without the @. */
    instagram?: string
    city?: string
}

export type StylistMedia = MediaSource & {
    /** What the picture shows, for screen readers: "Medium knotless braids, waist length". */
    alt: string
    credit: Credit
    /** The date the stylist said yes (YYYY-MM-DD). Keep their message too. */
    permissionGiven: string
    /** Where it appears: page slugs, or 'all' for every page. */
    pages: MarketingPageSlug[] | 'all'
}

/** Slots each page can fill: its hero visual, its demo frame, the phone beside its menu, and its feature rows in order. */
export type SlotName = 'hero' | 'demo' | 'menu' | 'row-1' | 'row-2' | 'row-3'

export type SlotMedia = MediaSource & {
    alt: string
    /** Required when a stylist or client is shown, with the date they said yes. */
    credit?: Credit
    permissionGiven?: string
    /**
     * How to show it: 'laptop' for screen recordings of the dashboard or booking
     * site (16:10), 'phone' for vertical reels and phone recordings (9:16),
     * 'plain' for anything else. Instagram reels always use the phone frame.
     */
    frame?: 'laptop' | 'phone' | 'plain'
}

export const STYLIST_MEDIA: StylistMedia[] = [
    // Example: uncomment and fill in once a stylist says yes.
    // {
    //     kind: 'instagram',
    //     code: 'C9xYz123AbC',
    //     alt: 'Stylist spotlight reel: boho knotless braids',
    //     credit: { name: 'Kayla Johnson', instagram: 'braidsbykayla', city: 'Atlanta' },
    //     permissionGiven: '2026-10-07',
    //     pages: ['braiders', 'smart-pricing'],
    // },
]

/** Keyed `${page}:${slot}`, e.g. 'braiders:hero' or 'payments:demo'. */
export const SLOT_MEDIA: Partial<Record<`${MarketingPageSlug}:${SlotName}`, SlotMedia>> = {
    // 'payments:hero': { kind: 'video', src: '/demos/dashboard-appointments.mp4', poster: '/demos/dashboard-appointments.jpg', alt: 'Marking an appointment paid in the AfroAllure dashboard', frame: 'laptop' },
    // 'braiders:row-1': { kind: 'video', src: '/demos/booking-braids.mp4', poster: '/demos/booking-braids.jpg', alt: 'A client booking medium knotless braids on a phone', frame: 'phone' },
}

export function mediaFor(slug: MarketingPageSlug): StylistMedia[] {
    return STYLIST_MEDIA.filter(m => m.pages === 'all' || m.pages.includes(slug))
}

export function slotMedia(slug: MarketingPageSlug, slot: SlotName): SlotMedia | undefined {
    return SLOT_MEDIA[`${slug}:${slot}`]
}
