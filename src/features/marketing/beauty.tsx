// /for/<specialty> pages for beauty pros beyond hair: nails, lashes, brows,
// makeup. Same rules as ./specialties.tsx: every claim true of AfroAllure
// today, example prices clearly examples.

import type { MarketingPageContent } from './content'
import { dollars, GROWTH_MONTHLY_CENTS, GROWTH_YEARLY_CENTS, TRIAL_DAYS } from '../billing/plans'

const GROWTH_PRICE = `${dollars(GROWTH_MONTHLY_CENTS)}/mo or ${dollars(GROWTH_YEARLY_CENTS)}/yr`
const COST_FAQ: [string, string] = ['What does it cost?', `Growth is ${GROWTH_PRICE} with no fee on your payments. Starter is free and takes 1% per card payment. Every new account gets ${TRIAL_DAYS} days of Growth free, no card needed.`]

export type BeautySlug = 'nails' | 'lashes' | 'brows' | 'makeup'

export const BEAUTY: Record<BeautySlug, MarketingPageContent> = {
    nails: {
        slug: 'nails',
        kind: 'specialty',
        metaTitle: 'Booking App for Nail Techs | Shape × Length Pricing, Deposits & Fill Reminders | AfroAllure',
        metaDescription: 'Booking for nail techs: price sets by shape and length, add nail art and soak-offs as add-ons, take deposits, and remind clients when their fill is due. 30 days free.',
        eyebrow: 'For nail techs',
        heroTitle: <>Shape, length, art.<br /><em>Priced before they sit down.</em></>,
        heroBody: 'Clients pick the set, the shape and the length, add their art, and see the real price and time. Then they pay a deposit, and a nudge brings them back when their fill is due.',
        theme: { accent: '#D9577E', hero: 'split-light' },
        heroVisual: { slot: 'hero', widget: { kind: 'price-picker' } },
        sections: [
            { type: 'pains', style: 'cards' },
            { type: 'rows' },
            { type: 'menu' },
            { type: 'benefits', style: 'bento' },
            { type: 'showcase' },
        ],
        painsTitle: 'Behind the table',
        pains: [
            { title: '"How much for long coffin with art?"', body: 'Every set is a different price, and every price is a message thread before anyone books.' },
            { title: 'Old product on arrival', body: 'A client shows up with a full set from somewhere else and no time booked to take it off.' },
            { title: 'Fills that turn into full sets', body: 'Clients wait five weeks instead of two or three, and the appointment doesn\'t fit the slot anymore.' },
        ],
        rows: [
            {
                eyebrow: 'Fills', title: 'Back for a fill on time.',
                body: 'Set how often a service should be redone. Clients who are due and haven\'t rebooked get a reminder with a link to your calendar.',
                bullets: ['Set the cycle on each service', 'Sent automatically', 'Loyalty rewards for regulars'],
                visual: { slot: 'row-1', widget: { kind: 'rebook', business: 'Nails by Jas', service: 'Gel-X fill', weeks: 3 } },
            },
            {
                eyebrow: 'Deposits', title: 'A deposit holds the chair.',
                body: 'A flat or percentage deposit to book, the card saved, and a no-show fee they agreed to before paying.',
                visual: { slot: 'row-2', widget: { kind: 'checkout', service: 'Gel-X full set · Long coffin', totalCents: 9500, depositCents: 2500, noShowFeeCents: 2500 } },
            },
        ],
        benefitsTitle: 'Built for the way nails are priced',
        benefitsIntro: 'Set your menu once. The price, deposit and time follow every choice.',
        benefits: [
            { title: 'Shape × length pricing', body: 'One service, a grid of prices: every shape against every length, each with its own price and extra time.' },
            { title: 'Art and extras as add-ons', body: 'Nail art, French tips, chrome, soak-offs: priced add-ons clients choose while booking, with the time added.' },
            { title: 'Prep they read', body: 'Ask clients to come with bare nails or book a soak-off, and make them tick "I agree" before booking.' },
            { title: 'Deposits and no-show fees', body: 'A deposit to book and an agreed no-show fee you can charge from the appointment in one tap.' },
            { title: 'Fill reminders', body: 'Clients get a nudge when their fill is due, with a link to book.' },
            { title: 'Openings for your stories', body: 'Turn open slots into a ready-to-post Instagram graphic in a couple of taps.' },
        ],
        sampleMenus: {
            title: 'What clients see when they book',
            intro: 'An example menu. You set every shape, length, price and time.',
            menus: [
                {
                    service: 'Gel-X full set',
                    note: 'Price for shape × length.',
                    columns: ['Short', 'Medium', 'Long'],
                    rows: [
                        { label: 'Square', cells: ['$65 · 1.5h', '$75 · 1.75h', '$85 · 2h'] },
                        { label: 'Almond', cells: ['$70 · 1.5h', '$80 · 1.75h', '$90 · 2h'] },
                        { label: 'Coffin', cells: ['$75 · 1.5h', '$85 · 2h', '$95 · 2.25h'] },
                    ],
                    extras: ['Nail art (per nail) +$5', 'French tips +$15', 'Soak-off +$15'],
                },
                {
                    service: 'Fill',
                    columns: ['Price', 'Time'],
                    rows: [
                        { label: '2-week fill', cells: ['$45', '1h'] },
                        { label: '3-week fill', cells: ['$55', '1.25h'] },
                    ],
                },
            ],
        },
        faq: [
            ['Can I price by shape and length?', 'Yes. Add the shapes and lengths you offer to a service, and set a price and time for every combination. Turn off the ones you don\'t do.'],
            ['How do I charge for nail art?', 'Make it an add-on, per nail or per set, with its own price and time. Clients pick it while booking.'],
            ['Can I make clients book a soak-off?', 'Add it as an add-on and say in your prep instructions that anyone with product on needs it. You can require clients to agree to your prep before booking.'],
            ['Do clients get reminded about fills?', 'Yes. Set how many weeks a service lasts and clients get a rebook reminder when it\'s time.'],
            COST_FAQ,
        ],
        related: ['/features/style-menus', '/features/reminders', '/for/lashes'],
    },

    lashes: {
        slug: 'lashes',
        kind: 'specialty',
        metaTitle: 'Booking App for Lash Artists | Full Sets, Fills & Deposits | AfroAllure',
        metaDescription: 'Booking for lash artists: price classic, hybrid and volume full sets and fills, take deposits, send prep instructions, and remind clients before their fill window closes. 30 days free.',
        eyebrow: 'For lash artists',
        heroTitle: <>Full sets booked.<br /><em>Fills on time.</em></>,
        heroBody: 'Classic, hybrid or volume, full set or fill, with the right time for each. Clients come prepped, pay a deposit to book, and get a nudge before their fill window closes.',
        theme: { accent: '#5B4BB7', hero: 'centered-dark' },
        heroVisual: {
            slot: 'hero',
            widget: {
                kind: 'booking-site', business: 'Lashed by Tee', slug: 'lashedbytee', services: [
                    { name: 'Classic full set', price: '$120', time: '2h' },
                    { name: 'Hybrid full set', price: '$150', time: '2h 30m' },
                    { name: 'Volume full set', price: '$180', time: '3h' },
                    { name: '2-week fill', price: '$65', time: '1h' },
                ],
            },
        },
        sections: [
            { type: 'pains', style: 'numbered' },
            { type: 'rows' },
            { type: 'menu', withPicker: true },
            { type: 'benefits', style: 'checklist' },
            { type: 'showcase' },
        ],
        painsTitle: 'What costs you time',
        pains: [
            { title: 'A fill that\'s really a full set', body: 'Clients book a fill four weeks out, and there aren\'t enough lashes left to fill.' },
            { title: 'Mascara and makeup at the appointment', body: 'Twenty minutes of cleaning before you can start, every time someone forgets.' },
            { title: 'No-shows on a two-hour set', body: 'A long appointment you blocked out, and no way to fill it at short notice.' },
        ],
        rows: [
            {
                eyebrow: 'Fill windows', title: 'Reminded before the window closes.',
                body: 'Set how often a service should be redone. Clients who are due and haven\'t rebooked get a nudge with a link to your calendar.',
                visual: { slot: 'row-1', widget: { kind: 'rebook', business: 'Lashed by Tee', service: 'Lash fill', weeks: 3 } },
            },
            {
                eyebrow: 'Prep', title: 'Clean lashes, every time.',
                body: 'Prep instructions on every service ("no mascara, no lash serum the day of"), shown when they book, with reminders a day and an hour before.',
                bullets: ['Prep instructions and a checklist', 'Clients tick "I agree" before booking', 'Text reminders with the SMS add-on'],
                visual: { slot: 'row-2', widget: { kind: 'texts', business: 'Lashed by Tee', service: 'Volume full set' } },
            },
        ],
        benefitsTitle: 'What helps',
        benefitsIntro: 'Everything a lash business runs on, in one place.',
        benefits: [
            { title: 'Style × set pricing', body: 'Classic, hybrid and volume against full set and fills, each with its own price and time.' },
            { title: 'Deposits to book', body: 'A flat or percentage deposit, taken off the balance if you choose.' },
            { title: 'No-show fees', body: 'The deposit card is saved and the agreed fee charged in one tap if they don\'t show. Nothing automatic.' },
            { title: 'Fill reminders', body: 'Rebook nudges on the cycle you set, so fills stay fills.' },
            { title: 'Prep and aftercare', body: 'Instructions and a checklist on each service, agreed to before booking.' },
            { title: 'A waitlist for cancellations', body: 'When someone cancels, clients waiting for those dates get an email straight away.' },
        ],
        sampleMenus: {
            title: 'An example lash menu',
            intro: 'You set every style, price and time.',
            menus: [
                {
                    service: 'Lash extensions',
                    columns: ['Full set', '2-week fill', '3-week fill'],
                    rows: [
                        { label: 'Classic', cells: ['$120 · 2h', '$55 · 1h', '$70 · 1.25h'] },
                        { label: 'Hybrid', cells: ['$150 · 2.5h', '$65 · 1h', '$80 · 1.5h'] },
                        { label: 'Volume', cells: ['$180 · 3h', '$75 · 1.25h', '$95 · 1.5h'] },
                    ],
                    extras: ['Removal +$25', 'Colored lashes +$15'],
                },
            ],
        },
        faq: [
            ['Can fills be priced separately from full sets?', 'Yes. Set full sets and fills as the columns of one service and each style as a row, or make them separate services.'],
            ['How do I stop clients booking a fill too late?', 'Set a rebook cycle on the service. Clients who are due get a reminder, and your prep can say fills past a certain point become a full set.'],
            ['Can clients see what to do before they come?', 'Yes. Prep instructions and a checklist show while booking, and you can require them to agree first.'],
            ['Do I need deposits for a no-show fee?', 'Yes. The card is saved when they pay the deposit, which is what lets you charge the fee later.'],
            COST_FAQ,
        ],
        related: ['/features/no-show-protection', '/features/reminders', '/for/brows'],
    },

    brows: {
        slug: 'brows',
        kind: 'specialty',
        metaTitle: 'Booking App for Brow Artists | Lamination, Tint & Wax Bookings | AfroAllure',
        metaDescription: 'Booking for brow artists: lamination, tinting and shaping with prep and aftercare clients agree to, deposits, and rebook reminders when it\'s time for a touch-up. 30 days free.',
        eyebrow: 'For brow artists',
        heroTitle: <>Brows on a schedule.<br /><em>Clients on autopilot.</em></>,
        heroBody: 'Lamination every six weeks, shaping every four: AfroAllure reminds each client when they\'re due, sends your prep and aftercare, and holds the slot with a deposit.',
        theme: { accent: '#8A5A3C', hero: 'split-accent' },
        heroVisual: { slot: 'hero', widget: { kind: 'rebook', business: 'Brows by Simone', service: 'Brow lamination', weeks: 6 } },
        sections: [
            { type: 'pains', style: 'quotes' },
            { type: 'menu', withPicker: true },
            { type: 'rows' },
            { type: 'benefits', style: 'grid' },
            { type: 'showcase' },
        ],
        painsTitle: 'You\'ve heard it all',
        pains: [
            { title: '"I used retinol last night, is that ok?"', body: 'Prep that wasn\'t read means a service you can\'t safely do, and a slot you can\'t refill.' },
            { title: 'Quick services, lots of them', body: 'Thirty-minute appointments mean more bookings, more reminders and more chances for no-shows.' },
            { title: 'Touch-ups that never get booked', body: 'Clients love the result, then let it grow out for three months.' },
        ],
        rows: [
            {
                eyebrow: 'Prep & aftercare', title: 'Read, agreed and remembered.',
                body: 'Prep instructions and a checklist on each service, a box they tick before booking, and reminders a day and an hour before.',
                visual: { slot: 'row-1', widget: { kind: 'texts', business: 'Brows by Simone', service: 'Lamination & tint' } },
            },
            {
                eyebrow: 'Deposits', title: 'Even short appointments are worth protecting.',
                body: 'A small deposit to book cuts no-shows on quick services, and the card on file covers an agreed no-show fee.',
                visual: { slot: 'row-2', widget: { kind: 'checkout', service: 'Lamination & tint', totalCents: 8500, depositCents: 2000, noShowFeeCents: 2000 } },
            },
        ],
        benefitsTitle: 'What you get',
        benefitsIntro: 'Simple to set up, built for quick, repeat services.',
        benefits: [
            { title: 'Rebook reminders', body: 'Set the cycle for each service, and clients get a nudge when they\'re due.' },
            { title: 'Prep clients agree to', body: 'Instructions and a checklist on every service, with a box to tick before booking.' },
            { title: 'Deposits and no-show fees', body: 'Flat or percentage deposits, and a fee charged in one tap if they don\'t come.' },
            { title: 'Add-ons', body: 'Tint, lash lift or extra shaping as priced add-ons with their own time.' },
            { title: 'Loyalty rewards', body: 'Reward regulars after a number of visits or an amount spent.' },
            { title: 'Your own booking site', body: 'All your services on yourname.afroallure.co, in your colors.' },
        ],
        sampleMenus: {
            title: 'An example brow menu',
            intro: 'You set every service, price and time.',
            menus: [
                {
                    service: 'Brow services',
                    columns: ['Price', 'Time'],
                    rows: [
                        { label: 'Lamination & tint', cells: ['$85', '1h'] },
                        { label: 'Wax & tint', cells: ['$45', '45m'] },
                        { label: 'Brow shaping', cells: ['$30', '30m'] },
                    ],
                    extras: ['Lash lift +$60', 'Lip wax +$12'],
                },
            ],
        },
        faq: [
            ['Can I make clients read aftercare too?', 'Put aftercare in the service\'s instructions. It shows while booking, and you can require clients to agree before they confirm.'],
            ['How do rebook reminders work?', 'On each service, set how often it should be redone. Clients who are due and haven\'t booked get an email with a link to your booking page.'],
            ['Is a deposit worth it on a $30 service?', 'Even a small one cuts no-shows, and it\'s what lets you charge an agreed no-show fee to the saved card.'],
            ['Can clients add a lash lift to their brow appointment?', 'Yes. Make it a priced add-on with its own time, chosen while booking.'],
            COST_FAQ,
        ],
        related: ['/features/reminders', '/features/no-show-protection', '/for/lashes'],
    },

    makeup: {
        slug: 'makeup',
        kind: 'specialty',
        metaTitle: 'Booking App for Makeup Artists | Event & Bridal Deposits | AfroAllure',
        metaDescription: 'Booking for makeup artists: soft glam, full glam and bridal with deposits that lock in the date, prep clients agree to, late fees and pay links for the balance. 30 days free.',
        eyebrow: 'For makeup artists',
        heroTitle: <>Big days, booked<br /><em>and paid for.</em></>,
        heroBody: 'Weddings, birthdays, shoots. A deposit locks in the date, prep and policies are agreed up front, and the balance arrives by pay link, so your day is about the beat, not the paperwork.',
        theme: { accent: '#C75B39', hero: 'split-dark' },
        heroVisual: { slot: 'hero', widget: { kind: 'checkout', service: 'Bridal makeup', totalCents: 25000, depositCents: 10000, noShowFeeCents: 10000 } },
        sections: [
            { type: 'pains', style: 'numbered' },
            { type: 'rows' },
            { type: 'menu' },
            { type: 'benefits', style: 'bento' },
            { type: 'showcase' },
        ],
        painsTitle: 'The real work behind the glam',
        pains: [
            { title: 'Dates held, then dropped', body: 'You turn down three inquiries for a Saturday, and the client who held it cancels the week before.' },
            { title: 'Soft glam or full glam?', body: 'Clients aren\'t sure what to book, so it turns into a back-and-forth before they commit.' },
            { title: 'Running late on the day', body: 'A client who arrives late pushes back everyone after her, on the day it matters most.' },
        ],
        rows: [
            {
                eyebrow: 'Your menu', title: 'Every look, explained before they book.',
                body: 'Each service with a description, price and time on your own booking site, so clients pick the right look without a DM.',
                visual: {
                    slot: 'row-1',
                    widget: {
                        kind: 'booking-site', business: 'Beat by Maya', slug: 'beatbymaya', services: [
                            { name: 'Soft glam', price: '$95', time: '1h' },
                            { name: 'Full glam', price: '$120', time: '1h 15m' },
                            { name: 'Bridal makeup', price: '$250', time: '2h' },
                        ],
                    },
                },
            },
            {
                eyebrow: 'On the day', title: 'Everyone in the chair on time.',
                body: 'A confirmation when they book and reminders a day and an hour before, with your prep: clean, moisturized skin, no makeup.',
                bullets: ['Late fees with a grace period', 'Pay links for the balance', 'Text reminders with the SMS add-on'],
                visual: { slot: 'row-2', widget: { kind: 'texts', business: 'Beat by Maya', service: 'Full glam' } },
            },
        ],
        benefitsTitle: 'Built for appointments that matter',
        benefitsIntro: 'Protect your dates, your time and your income.',
        benefits: [
            { title: 'Deposits that lock in the date', body: 'A flat or percentage deposit to book, taken off the final balance if you choose.' },
            { title: 'No-show and late fees', body: 'An agreed no-show fee charged to the saved card in one tap, and late fees with a grace period.' },
            { title: 'Policies they agree to', body: 'Your cancellation and prep policies, with a box clients tick before they can book.' },
            { title: 'Add-ons', body: 'Lashes, touch-up kits or extra people\'s looks as priced add-ons.' },
            { title: 'Pay links for the balance', body: 'The client gets a link to pay what\'s left near the end of the appointment.' },
            { title: 'Your own booking site', body: 'Your looks, prices and photos on yourname.afroallure.co.' },
        ],
        sampleMenus: {
            title: 'An example makeup menu',
            intro: 'You set every service, price and time.',
            menus: [
                {
                    service: 'Makeup',
                    columns: ['Price', 'Time'],
                    rows: [
                        { label: 'Soft glam', cells: ['$95', '1h'] },
                        { label: 'Full glam', cells: ['$120', '1h 15m'] },
                        { label: 'Bridal trial', cells: ['$150', '1h 30m'] },
                        { label: 'Bridal makeup', cells: ['$250', '2h'] },
                    ],
                    extras: ['Strip lashes +$15', 'Touch-up kit +$25'],
                },
            ],
        },
        faq: [
            ['Can I take a bigger deposit for bridal?', 'Deposit settings apply to your whole booking policy, as a flat amount or a percentage. A percentage deposit scales with the price, so bridal bookings pay more up front.'],
            ['Can I charge if someone cancels last minute?', 'Set a no-show fee with your deposits. The client agrees to it before paying, and you charge it to the saved card in one tap if needed.'],
            ['Can clients book a trial and the wedding day?', 'Yes. Make the trial its own service and clients book each appointment.'],
            ['Can I charge for lateness?', 'Yes. Set a flat or percentage late fee and a grace period. If someone runs late, add it to their balance from the appointment.'],
            COST_FAQ,
        ],
        related: ['/features/no-show-protection', '/features/payments', '/for/brows'],
    },
}
