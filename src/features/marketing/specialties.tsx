// /for/<specialty> pages. Each speaks to one kind of pro: their menu, their
// no-show problem, their prep. Keep every claim true of AfroAllure today.

import type { MarketingPageContent } from './content'
import { dollars, GROWTH_MONTHLY_CENTS, GROWTH_YEARLY_CENTS, TRIAL_DAYS } from '../billing/plans'

const GROWTH_PRICE = `${dollars(GROWTH_MONTHLY_CENTS)}/mo or ${dollars(GROWTH_YEARLY_CENTS)}/yr`

export type SpecialtySlug = 'braiders' | 'locticians' | 'natural-hair' | 'wigs-and-installs'

export const SPECIALTIES: Record<SpecialtySlug, MarketingPageContent> = {
    braiders: {
        slug: 'braiders',
        kind: 'specialty',
        metaTitle: 'Booking App for Braiders | Size × Length Pricing & Deposits | AfroAllure',
        metaDescription: 'A booking site built for braiders: price knotless, boho and goddess braids by size and length, collect deposits, send prep instructions and charge no-show fees. 30 days free.',
        eyebrow: 'For braiders',
        heroTitle: <>Stop quoting in the DMs.<br /><em>Let the menu do it.</em></>,
        heroBody: 'Clients pick the style, the size and the length, see the real price and the time it takes, pay the deposit and get your prep list. You get back the hours you spend answering "how much for smedium, mid-back?"',
        painsTitle: 'Sound familiar?',
        pains: [
            { title: 'Every price is a conversation', body: 'Small or medium, shoulder or waist, hair included or not. Each combination means another message thread before anyone books.' },
            { title: 'An empty eight-hour block', body: 'A no-show on a full head of small knotless isn\'t a missed hour. It\'s a lost day you can\'t fill at short notice.' },
            { title: 'Clients who show up unprepped', body: 'Hair not washed, not blow-dried, wrong hair bought. You lose time before you start, or turn them away.' },
        ],
        benefitsTitle: 'Built around how braids are priced',
        benefitsIntro: 'Set your menu once. Clients book the exact style, and the price, deposit and time block follow.',
        benefits: [
            { title: 'Size × length pricing', body: 'One service, a grid of prices: every size against every length, each with its own price and extra time. Turn off combinations you don\'t do.' },
            { title: 'Hair, handled', body: 'Mark hair as included, optional for an extra charge, or brought by the client, with a note like "6 packs of pre-stretched 1B".' },
            { title: 'Deposits that hold the chair', body: 'Take a flat or percentage deposit when they book. The card is saved, so an agreed no-show fee is one tap away.' },
            { title: 'Prep they have to read', body: 'Add instructions and a checklist to each service, and require clients to tick "I agree" before they can book.' },
            { title: 'Add-ons with prices', body: 'Curly ends, boho pieces, beads, take-down: priced add-ons clients choose while booking.' },
            { title: 'Rebook before they wander', body: 'Set how many weeks a style lasts and clients get a reminder to rebook when it\'s time, with a link to your calendar.' },
        ],
        sampleMenus: {
            title: 'What clients see when they book',
            intro: 'An example menu. You set every price, time and option.',
            menus: [
                {
                    service: 'Knotless braids',
                    note: 'Price for size × length. Hair optional, +$30 if supplied.',
                    columns: ['Shoulder', 'Mid-back', 'Waist'],
                    rows: [
                        { label: 'Large', cells: ['$160 · 3h', '$180 · 3.5h', '$210 · 4h'] },
                        { label: 'Medium', cells: ['$200 · 4.5h', '$230 · 5h', '$260 · 6h'] },
                        { label: 'Small', cells: ['$260 · 6h', '$300 · 7h', '$340 · 8h'] },
                    ],
                    extras: ['Curly ends +$25', 'Boho pieces +$40', 'Take-down +$45'],
                },
            ],
        },
        faq: [
            ['Can I charge more for longer lengths without making separate services?', 'Yes. Each braid service has its own size × length grid, so one "Knotless braids" listing covers every combination with its own price and time.'],
            ['What if a client wants me to buy the hair?', 'Set hair to optional with a price. Clients tick it when they book and it\'s added to their total. Or set it to "client brings" with a note of exactly what to buy.'],
            ['How do deposits work?', 'Choose a flat amount or a percentage. Clients pay it by card to book, and it comes off the final balance if you choose. If you add a no-show fee, the card is saved so you can charge it if they don\'t come.'],
            ['Can clients book on Instagram?', 'Put your booking link in your bio and stories. Clients book on your own site at yourname.afroallure.co, with your colors and photos.'],
            ['What does it cost?', `Growth is ${GROWTH_PRICE} with no fee on your payments. Starter is free and takes 1% per card payment. Every new account gets ${TRIAL_DAYS} days of Growth free, no card needed.`],
        ],
        related: ['/features/style-menus', '/features/no-show-protection', '/switch/styleseat'],
    },

    locticians: {
        slug: 'locticians',
        kind: 'specialty',
        metaTitle: 'Booking App for Locticians | Retwists, Starter Locs & Rebook Reminders | AfroAllure',
        metaDescription: 'Booking built for locticians: price retwists by length, starter locs by size, add loc repair as an add-on, and remind clients when their next retwist is due. 30 days free.',
        eyebrow: 'For locticians',
        heroTitle: <>Your clients come back every few weeks.<br /><em>Make it automatic.</em></>,
        heroBody: 'Locs are a relationship, not a one-off. AfroAllure prices retwists and starters the way you do, and nudges each client when their next maintenance is due, so your book stays full without chasing.',
        painsTitle: 'What gets in the way',
        pains: [
            { title: 'Clients go too long between retwists', body: 'Then the appointment takes twice as long, at the same price, and the locs pay for it.' },
            { title: 'Starter loc pricing is complicated', body: 'Comb coils, two-strand, interlocking, by size and length. Hard to fit into a one-price menu.' },
            { title: 'Repairs and extras get missed', body: 'Loc repair, extensions and styling get added at the chair, and the time block was never long enough.' },
        ],
        benefitsTitle: 'Made for maintenance clients',
        benefitsIntro: 'The tools that keep regulars on schedule and price the work properly.',
        benefits: [
            { title: 'Rebook reminders on your cycle', body: 'Set "retwist every 6 weeks" on a service. When a client is due and hasn\'t rebooked, they get a reminder with a link to your calendar.' },
            { title: 'Pricing by length or size', body: 'Retwists priced by length, starters by size × length, each with their own time so your calendar blocks the right amount.' },
            { title: 'Add-ons for repairs and styling', body: 'Price loc repair, a style, or a detox as add-ons, and the extra time is added to the booking.' },
            { title: 'Loyalty for regulars', body: 'Reward clients after a number of visits or an amount spent, with money or a percentage off, sent to them automatically.' },
            { title: 'Prep and aftercare notes', body: 'Tell clients to come with clean, dry hair, or what to avoid between visits, on every service.' },
            { title: 'Deposits and no-show fees', body: 'A deposit holds the chair, and an agreed no-show fee can be charged to the saved card in one tap.' },
        ],
        sampleMenus: {
            title: 'An example loc menu',
            intro: 'You set every service, price and time.',
            menus: [
                {
                    service: 'Retwist & style',
                    note: 'Rebook reminder every 6 weeks.',
                    columns: ['Price', 'Time'],
                    rows: [
                        { label: 'Short (above shoulder)', cells: ['$85', '2h'] },
                        { label: 'Medium (shoulder to bra strap)', cells: ['$110', '2.5h'] },
                        { label: 'Long (past bra strap)', cells: ['$140', '3h'] },
                    ],
                    extras: ['Loc repair (per loc) +$10', 'Barrel twists +$20', 'Detox +$35'],
                },
                {
                    service: 'Starter locs',
                    columns: ['Short', 'Medium'],
                    rows: [
                        { label: 'Comb coils', cells: ['$120 · 2h', '$150 · 3h'] },
                        { label: 'Two-strand twists', cells: ['$140 · 3h', '$175 · 4h'] },
                    ],
                },
            ],
        },
        faq: [
            ['How do rebook reminders work?', 'On each service, set how often it should be redone. AfroAllure checks every day and emails clients who are due and haven\'t booked yet, with a link straight to your booking page.'],
            ['Can I price interlocking differently from palm rolling?', 'Yes. Make them separate services, each with its own length or size pricing and time.'],
            ['Can clients choose add-ons like repairs?', 'Yes. Add-ons have their own price and time, and clients pick them while booking.'],
            ['Can I bring my current clients?', 'Yes. Import a CSV from StyleSeat, GlossGenius, Acuity or a spreadsheet. Nobody gets a message when you import.'],
            ['What does it cost?', `Growth is ${GROWTH_PRICE} with no fee on your payments. Starter is free and takes 1% per card payment. Every new account gets ${TRIAL_DAYS} days of Growth free, no card needed.`],
        ],
        related: ['/features/reminders', '/features/style-menus', '/switch/glossgenius'],
    },

    'natural-hair': {
        slug: 'natural-hair',
        kind: 'specialty',
        metaTitle: 'Booking App for Natural Hair & Silk Press Stylists | AfroAllure',
        metaDescription: 'Booking for natural hair and silk press stylists: price by length, collect deposits, send prep instructions, reward regulars with loyalty and fill cancellations from a waitlist. 30 days free.',
        eyebrow: 'For natural hair & silk press stylists',
        heroTitle: <>Fully booked,<br /><em>without the back-and-forth.</em></>,
        heroBody: 'Silk presses, wash and gos, twist outs, trims. Price them by length, take a deposit, tell clients how to come in, and let a waitlist fill the gaps when someone cancels.',
        painsTitle: 'The day-to-day',
        pains: [
            { title: 'Length changes everything', body: 'A press on shoulder-length hair isn\'t the same job as one on hip-length hair, but a flat price pretends it is.' },
            { title: 'Last-minute cancellations', body: 'A slot frees up the morning of, and there\'s no easy way to tell the people who wanted it.' },
            { title: 'Regulars who drift', body: 'A client who came every month stops, and nobody notices until they\'ve gone somewhere else.' },
        ],
        benefitsTitle: 'What helps',
        benefitsIntro: 'Simple to set up, and it keeps your chair full.',
        benefits: [
            { title: 'Pricing by length', body: 'Price each service by length, with the right time block for each, so a long press never runs into your next client.' },
            { title: 'A waitlist that fills cancellations', body: 'Clients join your waitlist for the dates they want. When someone cancels, the ones whose dates fit get an email right away.' },
            { title: 'Loyalty rewards', body: 'Reward regulars after a set number of visits or amount spent, with money or a percentage off.' },
            { title: 'Rebook reminders', body: 'Clients get a nudge when a press or trim is due again, with a link to book.' },
            { title: 'Prep instructions', body: 'Tell clients to come with detangled, product-free hair, or whatever you need, before they can book.' },
            { title: 'Openings for your stories', body: 'Turn open slots into a ready-to-post Instagram graphic in a couple of taps.' },
        ],
        sampleMenus: {
            title: 'An example menu',
            intro: 'You set every service, price and time.',
            menus: [
                {
                    service: 'Silk press',
                    note: 'Includes wash, deep condition and trim.',
                    columns: ['Price', 'Time'],
                    rows: [
                        { label: 'Short (above shoulder)', cells: ['$85', '2h'] },
                        { label: 'Shoulder to bra strap', cells: ['$105', '2.5h'] },
                        { label: 'Past bra strap', cells: ['$130', '3h'] },
                    ],
                    extras: ['Deep conditioning treatment +$25', 'Trim only +$20'],
                },
            ],
        },
        faq: [
            ['Can I charge more for thicker or longer hair?', 'Yes. Price each service by length, and add priced add-ons for anything extra, like a treatment.'],
            ['How does the waitlist work?', 'Clients join it from your booking page and choose the dates they want. When an appointment is cancelled, everyone on the waitlist whose dates fit that opening gets an email straight away.'],
            ['Do clients get reminders?', 'Yes: email reminders 24 hours and 1 hour before, which you can turn on or off. Growth businesses can add SMS reminders too.'],
            ['Can I take cash?', 'Yes. Mark an appointment paid in cash and there\'s no fee. Card payments go through Stripe.'],
            ['What does it cost?', `Growth is ${GROWTH_PRICE} with no fee on your payments. Starter is free and takes 1% per card payment. Every new account gets ${TRIAL_DAYS} days of Growth free, no card needed.`],
        ],
        related: ['/features/reminders', '/features/payments', '/switch/acuity'],
    },

    'wigs-and-installs': {
        slug: 'wigs-and-installs',
        kind: 'specialty',
        metaTitle: 'Booking App for Wig Installs & Sew-ins | AfroAllure',
        metaDescription: 'Booking for wig and sew-in stylists: price closure, frontal and leave-out installs, note exactly what hair clients bring, collect deposits and charge no-show fees. 30 days free.',
        eyebrow: 'For wig & sew-in stylists',
        heroTitle: <>Closure, frontal or leave-out.<br /><em>Booked right the first time.</em></>,
        heroBody: 'Clients choose the install, see what hair to bring, pay the deposit and agree to your prep before they book. No surprises when they sit down.',
        painsTitle: 'Where installs go wrong',
        pains: [
            { title: 'The wrong hair', body: 'A client brings two bundles for a job that needs four, or the wrong length, and the appointment stalls.' },
            { title: 'Frontal work priced like a closure', body: 'Different methods take very different time, but a vague menu books them the same.' },
            { title: 'Costly no-shows', body: 'You block hours for an install and the client never comes. The deposit is all you have.' },
        ],
        benefitsTitle: 'Built for installs',
        benefitsIntro: 'Exact options, clear hair notes and protection for your time.',
        benefits: [
            { title: 'One service, every option', body: 'Offer closure, frontal and leave-out as options on one install, each with its own price and time.' },
            { title: 'Hair notes on every service', body: 'Say exactly what to bring ("3 bundles, 18-22 inch, plus a 5x5 closure"), or include hair for a set price.' },
            { title: 'Deposits and no-show fees', body: 'A deposit to book, the card saved, and an agreed no-show fee you can charge in one tap.' },
            { title: 'Late fees', body: 'Set a grace period and a flat or percentage late fee. If a client runs late, add it to their balance from the appointment in one tap.' },
            { title: 'Prep and agreement', body: 'Clients tick that they\'ve read your prep and policies before they can book.' },
            { title: 'Payment links at the end', body: 'The balance goes to the client by email as a pay link near the end of the appointment, so checkout takes seconds.' },
        ],
        sampleMenus: {
            title: 'An example install menu',
            intro: 'You set every option, price and time.',
            menus: [
                {
                    service: 'Sew-in',
                    note: 'Client brings hair. Bring 3 bundles (18-22 inch) and a closure or frontal if using one.',
                    columns: ['Price', 'Time'],
                    rows: [
                        { label: 'Leave-out', cells: ['$180', '3h'] },
                        { label: 'Closure', cells: ['$200', '3.5h'] },
                        { label: 'Frontal', cells: ['$250', '4h'] },
                    ],
                    extras: ['Custom color +$60', 'Bundles supplied +$150'],
                },
                {
                    service: 'Wig install',
                    columns: ['Price', 'Time'],
                    rows: [
                        { label: 'Closure wig', cells: ['$120', '1.5h'] },
                        { label: 'Frontal wig', cells: ['$160', '2h'] },
                    ],
                },
            ],
        },
        faq: [
            ['Can clients see what hair to buy before they book?', 'Yes. Each service has a hair note and prep instructions shown while booking, and you can require them to agree before they confirm.'],
            ['Can I include hair in the price?', 'Yes. Set hair to included, or optional for an extra charge clients can choose.'],
            ['How do no-show fees work?', 'When you turn them on, the card used for the deposit is saved and the fee is shown to the client before they pay. If they don\'t come, you charge it from the appointment in one tap. Nothing is charged automatically.'],
            ['Can I charge for lateness?', 'Yes. Set a flat or percentage late fee and a grace period, shown to clients when they book. If someone runs late, add it to their balance from the appointment.'],
            ['What does it cost?', `Growth is ${GROWTH_PRICE} with no fee on your payments. Starter is free and takes 1% per card payment. Every new account gets ${TRIAL_DAYS} days of Growth free, no card needed.`],
        ],
        related: ['/features/no-show-protection', '/features/payments', '/switch/styleseat'],
    },
}
