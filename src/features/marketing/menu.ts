// The marketing site's menu: one page per specialty, per feature, and per
// platform people switch from. Page content lives in ./specialties.tsx,
// ./features.tsx and src/app/switch/platforms.tsx.

export interface MenuLink { label: string; href: string; blurb?: string; /** Column heading in a two-column dropdown. */ column?: string }
export interface MenuGroup { label: string; links: MenuLink[] }

export const SPECIALTY_LINKS: MenuLink[] = [
    { label: 'Braiders', href: '/for/braiders', blurb: 'Size × length pricing, hair, prep', column: 'Hair' },
    { label: 'Locticians', href: '/for/locticians', blurb: 'Retwists, starters, rebook cycles', column: 'Hair' },
    { label: 'Natural hair & silk press', href: '/for/natural-hair', blurb: 'Pricing by length, waitlist', column: 'Hair' },
    { label: 'Wigs & sew-ins', href: '/for/wigs-and-installs', blurb: 'Closures, frontals, hair notes', column: 'Hair' },
    { label: 'Nail techs', href: '/for/nails', blurb: 'Shape × length, art, fills', column: 'Beauty' },
    { label: 'Lash artists', href: '/for/lashes', blurb: 'Full sets, fills, prep', column: 'Beauty' },
    { label: 'Brow artists', href: '/for/brows', blurb: 'Lamination, tint, touch-ups', column: 'Beauty' },
    { label: 'Makeup artists', href: '/for/makeup', blurb: 'Event and bridal deposits', column: 'Beauty' },
]

export const FEATURE_LINKS: MenuLink[] = [
    { label: 'Calendar & scheduling', href: '/features/calendar', blurb: 'Hours, online booking, waitlist', column: 'Get booked' },
    { label: 'Website builder', href: '/features/website-builder', blurb: 'Templates and drag-and-drop', column: 'Get booked' },
    { label: 'Smart pricing', href: '/features/smart-pricing', blurb: 'Price by size, length and hair', column: 'Get booked' },
    { label: 'Reminders & SMS', href: '/features/reminders', blurb: 'Email, text, rebook nudges', column: 'Get booked' },
    { label: 'Payments & 0% fees', href: '/features/payments', blurb: 'Deposits, pay links, payouts', column: 'Run your business' },
    { label: 'No-show protection', href: '/features/no-show-protection', blurb: 'Deposits, fees and a ban list', column: 'Run your business' },
    { label: 'Loyalty program', href: '/features/loyalty', blurb: 'Rewards by visits or spend', column: 'Run your business' },
    { label: 'Client management', href: '/features/client-management', blurb: 'Your list, import, bans', column: 'Run your business' },
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
