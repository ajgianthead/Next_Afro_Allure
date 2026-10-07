// The marketing site's menu: one page per specialty, per feature, and per
// platform people switch from. Page content lives in ./specialties.tsx,
// ./features.tsx and src/app/switch/platforms.tsx.

export interface MenuLink { label: string; href: string; blurb?: string }
export interface MenuGroup { label: string; links: MenuLink[] }

export const SPECIALTY_LINKS: MenuLink[] = [
    { label: 'Braiders', href: '/for/braiders', blurb: 'Size × length pricing, hair, prep' },
    { label: 'Locticians', href: '/for/locticians', blurb: 'Retwists, starters, rebook cycles' },
    { label: 'Natural hair & silk press', href: '/for/natural-hair', blurb: 'Pricing by length, prep, loyalty' },
    { label: 'Wigs & sew-ins', href: '/for/wigs-and-installs', blurb: 'Closures, frontals, hair notes' },
]

export const FEATURE_LINKS: MenuLink[] = [
    { label: 'Payments & 0% fees', href: '/features/payments', blurb: 'Keep what you earn on Growth' },
    { label: 'No-show protection', href: '/features/no-show-protection', blurb: 'Deposits, no-show and late fees' },
    { label: 'Reminders & SMS', href: '/features/reminders', blurb: 'Email, text, rebook nudges' },
    { label: 'Style menus & prep', href: '/features/style-menus', blurb: 'Price by size, length and hair' },
]

export const SWITCH_LINKS: MenuLink[] = [
    { label: 'From StyleSeat', href: '/switch/styleseat' },
    { label: 'From GlossGenius', href: '/switch/glossgenius' },
    { label: 'From Acuity', href: '/switch/acuity' },
]

export const MARKETING_MENU: MenuGroup[] = [
    { label: 'Features', links: FEATURE_LINKS },
    { label: 'Who it’s for', links: SPECIALTY_LINKS },
    { label: 'Switch', links: SWITCH_LINKS },
]

export const PRICING_HREF = '/for-businesses#pricing'
