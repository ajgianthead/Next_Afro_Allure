// Real stylists' photos and reels shown on the marketing pages. No stock or
// AI-generated faces: only work a stylist has said yes to sharing, credited
// by name. See ./README.md for how to add an item and what permission to get.
//
// Pages with nothing listed show a "get featured" card instead, so the site
// never fills the gap with a stranger's face.

export type MarketingPageSlug =
    | 'braiders' | 'locticians' | 'natural-hair' | 'wigs-and-installs'
    | 'payments' | 'no-show-protection' | 'reminders' | 'style-menus'

type MediaSource =
    /** A photo in /public, e.g. '/stylists/kayla-knotless.jpg'. */
    | { kind: 'image'; src: string }
    /** An MP4 in /public (a downloaded reel, under ~8 MB). `poster` is a still from it. */
    | { kind: 'video'; src: string; poster?: string }
    /** A public Instagram reel or post, embedded. `code` is the part after /reel/ or /p/ in its link. */
    | { kind: 'instagram'; code: string }

export type StylistMedia = MediaSource & {
    /** What the picture shows, for screen readers: "Medium knotless braids, waist length". */
    alt: string
    credit: {
        name: string
        /** Instagram handle without the @. */
        instagram?: string
        city?: string
    }
    /** The date the stylist said yes (YYYY-MM-DD). Keep their message too. */
    permissionGiven: string
    /** Where it appears: page slugs, or 'all' for every page. */
    pages: MarketingPageSlug[] | 'all'
}

export const STYLIST_MEDIA: StylistMedia[] = [
    // Example: uncomment and fill in once a stylist says yes.
    // {
    //     kind: 'instagram',
    //     code: 'C9xYz123AbC',
    //     alt: 'Stylist spotlight reel: boho knotless braids',
    //     credit: { name: 'Kayla Johnson', instagram: 'braidsbykayla', city: 'Atlanta' },
    //     permissionGiven: '2026-10-07',
    //     pages: ['braiders', 'style-menus'],
    // },
]

export function mediaFor(slug: MarketingPageSlug): StylistMedia[] {
    return STYLIST_MEDIA.filter(m => m.pages === 'all' || m.pages.includes(slug))
}
