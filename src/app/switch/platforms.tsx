// What each /switch/<platform> page says. Every competitor fact here is from
// the platform's own pricing or help pages (see SOURCES in
// src/features/billing/competitors.ts), checked October 2026. Only claim a
// competitor lacks something when that's verified — otherwise describe what
// AfroAllure does and leave the comparison to the reader.

import type { ReactNode } from 'react'
import { ACUITY, GLOSSGENIUS, STYLESEAT, type CostModel } from '@/features/billing/competitors'
import { dollars, GROWTH_MONTHLY_CENTS, GROWTH_YEARLY_CENTS, TRIAL_DAYS, yearlyPerMonth } from '@/features/billing/plans'

export type PlatformSlug = 'styleseat' | 'glossgenius' | 'acuity'

export interface Gain { title: string; body: string }
export interface CompareRow { label: string; them: string; us: string; usWins?: boolean }

export interface SwitchPlatform {
    slug: PlatformSlug
    name: string
    metaTitle: string
    metaDescription: string
    heroTitle: ReactNode
    heroBody: string
    gainsTitle: string
    gainsIntro: string
    gains: Gain[]
    compare: CompareRow[]
    cost: { model: CostModel; marketplaceInput: boolean; note: string }
    /** What AfroAllure's price includes, said when the calculator shows the other platform lower. */
    included: string
    exportStep: ReactNode
    appointmentsNote: string
    faq: [string, string][]
}

const GROWTH_PRICE = `${dollars(GROWTH_MONTHLY_CENTS)}/mo or ${dollars(GROWTH_YEARLY_CENTS)}/yr`

// Everything AfroAllure does that a pro switching from any of the three gets.
const AFROALLURE_GAINS: Record<string, Gain> = {
    site: { title: 'A booking site with your name on it', body: 'A real site at yourname.afroallure.co with your colors, fonts, photos and policies. No other stylists listed beside you.' },
    pricing: { title: 'Priced the way braids and locs are priced', body: 'Size × length pricing, hair included or not, and prep instructions, so clients book the exact style and see the real price before they pay.' },
    fees: { title: 'No-show and late fees, automatically', body: 'The deposit saves the client\'s card. Charge an agreed no-show fee in one tap, and late fees land on the final balance.' },
    loyalty: { title: 'Loyalty rewards', body: 'Reward clients after a set number of visits or amount spent, with money or a percentage off, sent to them automatically.' },
    rebook: { title: 'Rebook reminders', body: 'Set how often a service should be redone and clients get a nudge when they\'re due, with a link straight to your calendar.' },
    waitlist: { title: 'A waitlist that fills cancellations', body: 'When someone cancels, clients on your waitlist whose dates fit get an email right away.' },
    openings: { title: 'Openings graphics for your stories', body: 'Turn your open slots into a ready-to-post graphic for Instagram in a couple of taps.' },
    noCut: { title: 'No cut of your income on Growth', body: `One flat price, ${GROWTH_PRICE}. AfroAllure takes no percentage of your bookings, just Stripe's card processing at cost.` },
    import: { title: 'Bring your whole client list', body: 'Upload your export and we match the columns, skip duplicates and keep your banned list. Nobody gets a message.' },
}

export const PLATFORMS: Record<PlatformSlug, SwitchPlatform> = {
    styleseat: {
        slug: 'styleseat',
        name: 'StyleSeat',
        metaTitle: 'Switching from StyleSeat | AfroAllure',
        metaDescription: 'Move your clients, services and booking link from StyleSeat to AfroAllure. No new-client fees, your own booking site, loyalty rewards, rebook reminders and automatic no-show fees.',
        heroTitle: <>Bring your clients.<br /><em>Keep your name on it.</em></>,
        heroBody: 'Most of your clients already find you on Instagram and through referrals. On AfroAllure they book on a site with your name on it, and you never pay a cut for a client you brought in yourself.',
        gainsTitle: 'What changes when you switch',
        gainsIntro: 'Everything you use StyleSeat for, plus the tools that turn first-time clients into regulars.',
        gains: [
            { title: 'No new-client fee. Ever.', body: 'StyleSeat takes 30% of a new client\'s first visit, up to $50, when its marketplace sends them. AfroAllure doesn\'t charge for new clients at all.' },
            { title: 'A lower monthly price', body: `${dollars(GROWTH_MONTHLY_CENTS)}/mo, or ${yearlyPerMonth()}/mo billed yearly, against StyleSeat's $35/mo. Plus a free Starter plan if you're just getting going.` },
            AFROALLURE_GAINS.site,
            AFROALLURE_GAINS.pricing,
            AFROALLURE_GAINS.loyalty,
            AFROALLURE_GAINS.rebook,
            AFROALLURE_GAINS.waitlist,
            AFROALLURE_GAINS.openings,
            AFROALLURE_GAINS.fees,
        ],
        compare: [
            { label: 'Monthly price', them: '$35/mo', us: GROWTH_PRICE, usWins: true },
            { label: 'Fee on new clients from the marketplace', them: '30% of the first visit, up to $50', us: 'None', usWins: true },
            { label: 'Your own website', them: '$10/mo add-on', us: 'Included', usWins: true },
            { label: 'Card processing', them: '2.6% + 30¢', us: '2.9% + 30¢ at cost, no cut of your bookings on Growth' },
            { label: 'Marketplace that sends you new clients', them: 'Yes, with a fee on each new client it sends', us: 'Launching soon, founding members listed first, no new-client fee' },
        ],
        cost: {
            model: STYLESEAT,
            marketplaceInput: true,
            note: 'StyleSeat figures are its standard plan and card-on-file rate. Promotional rates and add-ons like Smart Pricing aren\'t included.',
        },
        included: 'your own booking site, loyalty rewards, rebook reminders and no new-client fees',
        exportStep: <>In the StyleSeat app, open <strong>Clients</strong>, tap <strong>⋯</strong> in the top corner and choose <strong>Export Client List</strong>. StyleSeat emails you a CSV. <strong>Do this before you cancel.</strong> The export only works while your StyleSeat subscription is active.</>,
        appointmentsNote: 'StyleSeat doesn\'t let you export upcoming appointments yourself, so keep StyleSeat open until the ones already booked there are done, or add them to your AfroAllure calendar.',
        faq: [
            ['Do I lose new clients from StyleSeat search?', 'You lose StyleSeat\'s search listing when you cancel. If most of your clients come from Instagram, TikTok and referrals, that\'s usually a small share, and the calculator above shows what those clients cost you today.'],
            ['What about my StyleSeat reviews?', 'Reviews stay on StyleSeat. Screenshot your favorites and add them to your AfroAllure booking site.'],
        ],
    },

    glossgenius: {
        slug: 'glossgenius',
        name: 'GlossGenius',
        metaTitle: 'Switching from GlossGenius | AfroAllure',
        metaDescription: 'Move from GlossGenius to AfroAllure: built for braiders, locticians and natural hair stylists, with size × length pricing, loyalty rewards, rebook reminders and a lower price.',
        heroTitle: <>Built for your chair.<br /><em>Not every chair.</em></>,
        heroBody: 'GlossGenius is built for every kind of salon and spa. AfroAllure is built for braiders, locticians, natural hair stylists and barbers, priced the way your services actually work, for less each month.',
        gainsTitle: 'What you get on AfroAllure',
        gainsIntro: 'The essentials you have now, a booking site, reminders, deposits and no-show protection, plus the tools built around textured-hair services.',
        gains: [
            AFROALLURE_GAINS.pricing,
            { title: 'A lower price, monthly or yearly', body: `${dollars(GROWTH_MONTHLY_CENTS)}/mo against GlossGenius's $28/mo, or ${dollars(GROWTH_YEARLY_CENTS)}/yr against $288/yr billed yearly. And a free Starter plan to start.` },
            AFROALLURE_GAINS.loyalty,
            AFROALLURE_GAINS.rebook,
            AFROALLURE_GAINS.waitlist,
            AFROALLURE_GAINS.openings,
            AFROALLURE_GAINS.fees,
            AFROALLURE_GAINS.site,
            { title: 'Built by and for this community', body: 'AfroAllure is made for Black beauty professionals and the clients who look for them, including a marketplace where founding members are listed first.' },
        ],
        compare: [
            { label: 'Price, billed monthly', them: '$28/mo', us: `${dollars(GROWTH_MONTHLY_CENTS)}/mo`, usWins: true },
            { label: 'Price, billed yearly', them: '$24/mo ($288/yr)', us: `${dollars(GROWTH_YEARLY_CENTS)}/yr (${yearlyPerMonth()}/mo)`, usWins: true },
            { label: 'Free plan', them: 'Plans start at $24/mo', us: 'Starter, free (1% per card payment)', usWins: true },
            { label: 'Booking site, reminders, deposits, no-show protection', them: 'Included', us: 'Included' },
            { label: 'Card processing', them: '2.6%', us: '2.9% + 30¢ at cost, no cut of your bookings on Growth' },
        ],
        cost: {
            model: GLOSSGENIUS,
            marketplaceInput: false,
            note: 'GlossGenius figures are its Standard plan billed monthly ($24/mo billed yearly) and its 2.6% card rate.',
        },
        included: 'size × length pricing, loyalty rewards, rebook reminders and a waitlist that fills cancellations',
        exportStep: <>Log in to GlossGenius on a computer, open <strong>Clients</strong> and choose <strong>Export Clients</strong>. The CSV downloads right away. Client notes aren&apos;t included (GlossGenius support can send them), and on a team account only the owner can export.</>,
        appointmentsNote: 'Keep GlossGenius open until the appointments already booked there are done, or add them to your AfroAllure calendar.',
        faq: [
            ['How do card fees compare?', 'GlossGenius charges 2.6% per card payment. AfroAllure passes Stripe\'s standard 2.9% + 30¢ through at cost, takes nothing on top on Growth, and costs less each month. The calculator above shows the total for your numbers.'],
            ['Can my team come too?', 'AfroAllure is built for independent pros today. If you run a team, email us before you switch and we\'ll tell you honestly whether it fits.'],
        ],
    },

    acuity: {
        slug: 'acuity',
        name: 'Acuity',
        metaTitle: 'Switching from Acuity Scheduling | AfroAllure',
        metaDescription: 'Move from Acuity Scheduling to AfroAllure: a booking site built for hair, with size × length pricing, deposits, no-show fees, loyalty rewards and rebook reminders. 30 days free.',
        heroTitle: <>From a scheduling link<br /><em>to a real booking site.</em></>,
        heroBody: 'Acuity is built for any appointment: tutors, therapists, consultants. AfroAllure is built for hair. Size and length pricing, deposits and no-show fees, loyalty and rebooking, on a site with your name on it.',
        gainsTitle: 'What you get on AfroAllure',
        gainsIntro: 'Everything your Acuity link does, plus the tools that run a hair business and bring clients back.',
        gains: [
            AFROALLURE_GAINS.pricing,
            AFROALLURE_GAINS.site,
            AFROALLURE_GAINS.fees,
            AFROALLURE_GAINS.loyalty,
            AFROALLURE_GAINS.rebook,
            AFROALLURE_GAINS.waitlist,
            AFROALLURE_GAINS.openings,
            { title: 'A real free trial and a free plan', body: `${TRIAL_DAYS} days of everything with no card, then stay on Growth or drop to the free Starter plan. Acuity has a 7-day trial and no free plan.` },
            AFROALLURE_GAINS.import,
        ],
        compare: [
            { label: 'Made for', them: 'Any appointment business', us: 'Black beauty professionals', usWins: true },
            { label: 'Free trial', them: '7 days', us: `${TRIAL_DAYS} days, no card needed`, usWins: true },
            { label: 'Free plan', them: 'None', us: 'Starter, free (1% per card payment)', usWins: true },
            { label: 'Price', them: '$20/mo Starter · $34/mo Standard', us: GROWTH_PRICE },
            { label: 'Payments', them: 'Connect Stripe, Square or PayPal', us: 'Stripe built in, 2.9% + 30¢ at cost' },
        ],
        cost: {
            model: ACUITY,
            marketplaceInput: false,
            note: 'Acuity figures are its Starter plan billed monthly, which has no text reminders (Standard, with them, is $34/mo), plus Stripe\'s standard card rate.',
        },
        included: 'size × length pricing, no-show fees, loyalty rewards and rebook reminders, built for hair',
        exportStep: <>In Acuity, go to <strong>Clients</strong>, click <strong>Import/export</strong>, then <strong>Export client list</strong> and choose <strong>All clients</strong>. You get a CSV with names, emails and phone numbers.</>,
        appointmentsNote: 'Acuity can also export your appointments, which is handy for adding upcoming ones to your AfroAllure calendar. Keep Acuity open until those are done.',
        faq: [
            ['Do I need to set up a payment processor?', 'Payments run on Stripe, built into AfroAllure. Connecting your bank takes a few minutes inside your dashboard.'],
            ['Can I embed AfroAllure on my own website?', 'Your booking site lives at yourname.afroallure.co. Link to it from your website, your Instagram bio and your texts, the same way you share your Acuity link today.'],
        ],
    },
}

export const SHARED_FAQ: [string, string][] = [
    ['Will my clients get an email or text when I import them?', 'No. Importing just adds them to your client list. They only hear from you when they book, or when you turn on reminders like rebooking nudges.'],
    ['Can I keep my old account while I try AfroAllure?', 'Yes. Plenty of pros run both for a few weeks while their existing appointments finish. Just make sure the same time slot isn\'t open on both.'],
    ['What happens after the free trial?', `Choose Growth (${GROWTH_PRICE}) to keep everything with no fee on your payments, or stay on the free Starter plan, which takes 1% per card payment. No card is needed to start the trial.`],
    ['How do clients pay?', 'By card through Stripe, with deposits, a card on file for no-show and late fees, and the balance charged at the end. Cash works too and has no fees.'],
]
