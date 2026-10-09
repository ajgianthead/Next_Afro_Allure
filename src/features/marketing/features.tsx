// /features/<feature> pages: one feature each, explained in full, for links
// in DMs, ads and posts. Keep every claim true of AfroAllure today.

import type { MarketingPageContent } from './content'
import {
    dollars, GROWTH_MONTHLY_CENTS, GROWTH_YEARLY_CENTS, SMS_MONTHLY_CENTS, SMS_MONTHLY_TEXTS, STARTER_LIMITS, TRIAL_DAYS,
} from '../billing/plans'
import { INSTANT_PAYOUT_FEE_LABEL } from '@/lib/fees'

const GROWTH_PRICE = `${dollars(GROWTH_MONTHLY_CENTS)}/mo or ${dollars(GROWTH_YEARLY_CENTS)}/yr`
const ON_GROWTH = `part of Growth (${GROWTH_PRICE}). Try it free for ${TRIAL_DAYS} days when you upgrade`

export type FeatureSlug =
    | 'calendar' | 'website-builder' | 'smart-pricing' | 'reminders'
    | 'payments' | 'no-show-protection' | 'loyalty' | 'client-management'

/** Old feature URLs that moved, so links already shared keep working. */
export const FEATURE_REDIRECTS: Record<string, FeatureSlug> = {
    'style-menus': 'smart-pricing',
}

export const FEATURES: Record<FeatureSlug, MarketingPageContent> = {
    calendar: {
        slug: 'calendar',
        kind: 'feature',
        metaTitle: 'Calendar & Scheduling for Stylists | Online Booking, Hours & Waitlist | AfroAllure',
        metaDescription: 'One calendar for online and DM bookings. Set your hours and days off, choose how far ahead clients book and when they can reschedule, and refill cancellations from a waitlist.',
        eyebrow: 'Calendar & scheduling',
        heroTitle: <>Your hours, your rules.<br /><em>Booked while you work.</em></>,
        heroBody: 'Clients book the open times on your booking site, and every appointment, online or added by you, lands on one calendar.',
        theme: { accent: '#5B4BC4', hero: 'split-accent' },
        heroVisual: { slot: 'hero', widget: { kind: 'dashboard', view: 'appointments', business: 'Crown by Simone' } },
        facts: [
            ['24/7', 'online booking from your own site'],
            ['Day, week, list', 'calendar views of every appointment'],
            ['0', 'double bookings: taken times can\'t be booked'],
        ],
        sections: [
            { type: 'rows' },
            { type: 'facts' },
            { type: 'steps', style: 'cards' },
            { type: 'benefits', style: 'checklist' },
            { type: 'pains', style: 'cards' },
        ],
        rows: [
            {
                eyebrow: 'Working hours', title: 'Set it once. Change any day.',
                body: 'Weekly hours with as many blocks a day as you need, plus date overrides for a day off or extra hours. Clients only see times that are open.',
                visual: { slot: 'row-1', widget: { kind: 'hours' } },
            },
            {
                eyebrow: 'Waitlist', title: 'A cancellation refills itself.',
                body: 'When someone cancels, clients on your waitlist whose dates fit get an email right away, and the first to book takes the slot.',
                visual: { slot: 'row-2', widget: { kind: 'calendar' } },
            },
            {
                eyebrow: 'Share openings', title: 'Post your openings in a tap.',
                body: 'Turn this week\'s free time into a list of start times and a ready-made caption for your story or a DM.',
                visual: {
                    slot: 'row-3',
                    widget: {
                        kind: 'dm-thread', messages: [
                            { from: 'client', text: 'Hey! Do you have anything this week?' },
                            { from: 'you', text: 'Openings this week: Thu 10 AM & 2 PM, Sat 9 AM. Book at crownbysimone.afroallure.co' },
                            { from: 'client', text: 'Just booked Thursday at 10!' },
                        ],
                    },
                },
            },
        ],
        painsTitle: 'What scheduling by hand costs you',
        pains: [
            { title: 'Booking by DM all day', body: '"What do you have Saturday?" fifty times a week, between clients.' },
            { title: 'Two people, one slot', body: 'Someone confirmed in your DMs while someone else took the same time somewhere else.' },
            { title: 'Changes at the last minute', body: 'Reschedules the night before, with no rule to point to.' },
        ],
        benefitsTitle: 'Everything your calendar handles',
        benefitsIntro: 'Set it up in Availability and Booking Settings.',
        benefits: [
            { title: 'Online booking around the clock', body: 'Clients pick a service and an open time on your booking site, any hour of the day.' },
            { title: 'Add bookings yourself', body: 'DM and walk-in bookings go on the same calendar, with a deposit request if you want one.' },
            { title: 'Hours and days off', body: 'More than one block a day, and date overrides for holidays, days off or extra hours.' },
            { title: 'A booking window', body: 'Choose how far ahead clients can book, so your calendar only opens as far as you want.' },
            { title: 'Reschedule and cancel rules', body: 'Clients reschedule or cancel from their confirmation email, within the number of changes and the cutoff you set.' },
            { title: 'No double bookings', body: 'A booked time disappears for everyone else, whether it was booked online or added by you.' },
        ],
        steps: {
            title: 'Set up in an afternoon',
            steps: [
                { title: 'Set your hours', body: 'Your weekly schedule and any days off.' },
                { title: 'Set your rules', body: 'How far ahead clients can book, and when they can reschedule or cancel.' },
                { title: 'Share your link', body: 'Put your booking site in your bio and your DMs.' },
                { title: 'Clients book, you see it', body: 'Every booking lands on your calendar with the service, client and payment.' },
            ],
        },
        faq: [
            ['Can I add appointments myself?', 'Yes. Add DM, phone or walk-in bookings from your dashboard, and send a deposit request if you want one.'],
            ['Can clients reschedule themselves?', 'Yes, from the link in their confirmation email, within the number of reschedules and the cutoff you set.'],
            ['Can I take a day off?', 'Yes. Add a date override to close a day or change its hours, without touching your weekly schedule.'],
            ['Can different services use different hours?', 'Yes, on Growth. Create more than one schedule and choose which one each service uses.'],
            ['What does it cost?', `Every plan includes the calendar and online booking. Starter covers up to ${STARTER_LIMITS.manualBookingsPerMonth} bookings a month and one schedule. Growth (${GROWTH_PRICE}) is unlimited.`],
        ],
        related: ['/features/website-builder', '/features/reminders', '/for/natural-hair'],
    },

    'website-builder': {
        slug: 'website-builder',
        kind: 'feature',
        metaTitle: 'Booking Website Builder for Stylists | Templates & Drag-and-Drop Editor | AfroAllure',
        metaDescription: 'A booking site at yourname.afroallure.co with your services, prices and photos. Start from a template, then drag, drop and style every section. Clients book right on it.',
        eyebrow: 'Website builder',
        heroTitle: <>A site that looks like you.<br /><em>And books like one.</em></>,
        heroBody: 'Your services, photos and booking behind one link for your bio. Start from a template, make it yours, and clients book without leaving the page.',
        theme: { accent: '#A3477A', hero: 'centered-dark' },
        heroVisual: {
            slot: 'hero',
            widget: {
                kind: 'booking-site', business: 'Lashed by Tee', slug: 'lashedbytee', services: [
                    { name: 'Classic full set', price: '$120', time: '2h' },
                    { name: 'Hybrid full set', price: '$150', time: '2h 30m' },
                    { name: 'Volume fill', price: 'from $75', time: '1h+' },
                ],
            },
        },
        sections: [
            {
                type: 'demo', title: 'Drag it in. Make it yours.',
                body: 'Drop in a navbar, hero, services, gallery, about and footer, then set your fonts, colors and spacing. What you see is what clients get.',
                visual: { slot: 'demo', widget: { kind: 'dashboard', view: 'editor', business: 'Lashed by Tee' } },
            },
            { type: 'rows' },
            { type: 'benefits', style: 'grid' },
            { type: 'pains', style: 'quotes' },
            { type: 'steps', style: 'timeline' },
        ],
        rows: [
            {
                eyebrow: 'Booking built in', title: 'From your homepage to booked.',
                body: 'Clients choose a service, see the real price, agree to your policies and pay the deposit, all on your site.',
                visual: { slot: 'row-1', widget: { kind: 'checkout', service: 'Hybrid full set', totalCents: 15000, depositCents: 4000 } },
            },
            {
                eyebrow: 'One link', title: 'The only link your bio needs.',
                body: 'Your site lives at yourname.afroallure.co. Share it in your bio, your DMs and your stories.',
                visual: {
                    slot: 'row-2',
                    widget: {
                        kind: 'dm-thread', messages: [
                            { from: 'client', text: 'How do I book with you?' },
                            { from: 'you', text: 'Everything\'s at lashedbytee.afroallure.co 💕 prices, photos and open times' },
                            { from: 'client', text: 'Booked! See you Friday' },
                        ],
                    },
                },
            },
        ],
        painsTitle: 'What clients find instead',
        pains: [
            { title: 'A link tree to nowhere', body: 'Five links, and none of them lets a client actually book.' },
            { title: 'Prices nobody can find', body: '"How much is a full set?" in your DMs, again, because the price list is a story from March.' },
            { title: 'A site that doesn\'t book', body: 'A nice page that ends in "DM me to book."' },
        ],
        benefitsTitle: 'What you can build',
        benefitsIntro: 'Two editors: a simple one for getting started, and a full drag-and-drop editor.',
        benefits: [
            { title: 'Your own address', body: 'yourname.afroallure.co, ready the moment you sign up.' },
            { title: 'Templates for beauty', body: 'Start from a finished design made for hair and beauty, then swap in your photos and words.' },
            { title: 'Drag-and-drop editor', body: '20+ components with full control of layout, fonts, colors and spacing.' },
            { title: 'Section editor', body: 'Prefer simple? Stack text and image blocks and reorder them in a drag.' },
            { title: 'Booking built in', body: 'Your services, prices, deposits and policies live on the same site.' },
            { title: 'Your look on the booking page', body: 'Your colors and fonts carry through to the pages where clients choose a time and pay.' },
        ],
        steps: {
            title: 'Live in three steps',
            steps: [
                { title: 'Pick a template', body: 'Or start from a blank page.' },
                { title: 'Make it yours', body: 'Add your photos, services and words, and set your colors and fonts.' },
                { title: 'Share your link', body: 'Put yourname.afroallure.co in your bio and start taking bookings.' },
            ],
        },
        faq: [
            ['Do I need a website already?', 'No. Your booking site is your website: services, photos, about you and booking in one place.'],
            ['Do I need design skills?', 'No. Start from a template and change the words and photos. The full editor is there when you want more control.'],
            ['Can I use my own domain?', 'Not yet. Your site lives at yourname.afroallure.co, which you can link from anywhere.'],
            ['What does it cost?', `Every plan gets a booking site and the Section Editor. The Drag & Drop Editor and templates are ${ON_GROWTH}.`],
        ],
        related: ['/features/smart-pricing', '/features/calendar', '/for/lashes'],
    },

    'smart-pricing': {
        slug: 'smart-pricing',
        kind: 'feature',
        metaTitle: 'Smart Pricing: Size × Length Pricing for Braids, Locs and Installs | AfroAllure',
        metaDescription: 'Price braids, locs and installs the way you actually price them: by size and length, with hair included, optional or brought, priced add-ons and prep checklists clients agree to.',
        eyebrow: 'Smart pricing',
        heroTitle: <>Priced the way<br /><em>textured hair is priced.</em></>,
        heroBody: 'One service, a grid of prices. Clients choose the size, the length and the hair, see the real price and time, and read your prep before they book.',
        theme: { accent: '#A86B3C', hero: 'split-dark' },
        heroVisual: { slot: 'hero', widget: { kind: 'price-picker' } },
        sections: [
            { type: 'pains', style: 'numbered' },
            {
                type: 'demo', title: 'Build the whole grid in a minute.',
                body: 'Add your sizes and lengths, fill in each price and time, choose how hair works and write your prep. It\'s live on your booking site straight away.',
                visual: { slot: 'demo', widget: { kind: 'dashboard', view: 'services', business: 'Braids by Kayla' } },
            },
            { type: 'menu' },
            { type: 'rows' },
            { type: 'steps', style: 'cards' },
            { type: 'benefits', style: 'grid' },
        ],
        sampleMenus: {
            title: 'One service, every combination',
            intro: 'An example. You set every size, length, price and time.',
            menus: [
                {
                    service: 'Knotless braids',
                    note: 'Hair optional, +$30 if supplied.',
                    columns: ['Shoulder', 'Mid-back', 'Waist'],
                    rows: [
                        { label: 'Large', cells: ['$160 · 3h', '$180 · 3.5h', '$210 · 4h'] },
                        { label: 'Medium', cells: ['$200 · 4.5h', '$230 · 5h', '$260 · 6h'] },
                        { label: 'Small', cells: ['$260 · 6h', '$300 · 7h', '$340 · 8h'] },
                    ],
                    extras: ['Curly ends +$25', 'Boho pieces +$40'],
                },
            ],
        },
        rows: [
            {
                eyebrow: 'On your booking site', title: 'Your whole menu, with real prices.',
                body: 'Every service shows its starting price on yourname.afroallure.co, and the exact price as clients choose. No DMs to ask.',
                visual: {
                    slot: 'row-1',
                    widget: {
                        kind: 'booking-site', business: 'Braids by Kayla', slug: 'braidsbykayla', services: [
                            { name: 'Knotless braids', price: 'from $160', time: '3h+' },
                            { name: 'Boho knotless', price: 'from $200', time: '4h+' },
                            { name: 'Feed-in cornrows', price: 'from $90', time: '2h+' },
                        ],
                    },
                },
            },
            {
                eyebrow: 'Prep & agreement', title: 'Read and agreed before they pay.',
                body: 'Prep instructions and your policies sit right above the pay button, with a box they have to tick.',
                visual: { slot: 'row-2', widget: { kind: 'checkout', service: 'Medium knotless · Mid-back', totalCents: 23000, depositCents: 5000 } },
            },
        ],
        painsTitle: 'Why one price doesn\'t work',
        pains: [
            { title: 'Too many services', body: 'Twelve listings for one style, one for each size and length, and clients still pick the wrong one.' },
            { title: 'The wrong time block', body: 'A waist-length booking in a shoulder-length slot runs into your next client.' },
            { title: 'Surprises at the chair', body: 'No hair, the wrong hair, or hair that isn\'t ready.' },
        ],
        benefitsTitle: 'What you can set',
        benefitsIntro: 'Set it once per service. It shows on your booking site straight away.',
        benefits: [
            { title: 'Sizes × lengths', body: 'Add the sizes and lengths you offer. Every combination gets its own price and extra time, and you can turn off the ones you don\'t do.' },
            { title: 'Hair options', body: 'Included, optional for a price, or brought by the client, with a note of exactly what to buy.' },
            { title: 'Priced add-ons', body: 'Extras like curly ends, beads or a treatment, each with a price and time.' },
            { title: 'Prep instructions and checklist', body: 'What to do before the appointment, as instructions and a checklist shown when booking and in reminders.' },
            { title: 'Required agreement', body: 'Make clients tick that they\'ve read your prep and policies before they can book.' },
            { title: 'Locked at booking', body: 'The style, price and options are saved with the appointment, so later menu changes never change a booking.' },
        ],
        steps: {
            title: 'Setting up a style',
            steps: [
                { title: 'Create the service', body: 'Name, photo, description and the base time.' },
                { title: 'Add sizes and lengths', body: 'Fill in the grid with a price and extra time for each combination.' },
                { title: 'Set hair, add-ons and prep', body: 'Choose how hair works, add extras, and write the prep and checklist.' },
            ],
        },
        faq: [
            ['Do I have to use sizes and lengths?', 'No. Use just sizes, just lengths, both, or neither for simple services.'],
            ['Does the time change with the size and length?', 'Yes. Each combination adds its own time, so the booking blocks the right amount of your calendar.'],
            ['Can clients see the price before booking?', 'Yes. The price updates as they choose, including add-ons and hair, before they pay a deposit.'],
            ['If I change prices, what happens to existing bookings?', 'Nothing. Each booking keeps the price and options it was made with.'],
        ],
        related: ['/for/braiders', '/features/website-builder', '/for/wigs-and-installs'],
    },

    reminders: {
        slug: 'reminders',
        kind: 'feature',
        metaTitle: 'Appointment Reminders, SMS & Rebook Nudges for Stylists | AfroAllure',
        metaDescription: `Automatic email reminders 24 hours and 1 hour before, text reminders with the SMS add-on (${dollars(SMS_MONTHLY_CENTS)}/mo for ${SMS_MONTHLY_TEXTS} texts), rebook nudges and a waitlist for cancellations.`,
        eyebrow: 'Reminders & SMS',
        heroTitle: <>Clients remember.<br /><em>Regulars come back.</em></>,
        heroBody: 'Reminders before each visit, a nudge when it\'s time to rebook, and a waitlist that fills the gaps, all sent for you.',
        theme: { accent: '#3B6FD9', hero: 'centered-dark' },
        heroVisual: { slot: 'hero', widget: { kind: 'texts', business: 'Locs by Nia', service: 'Retwist & style' } },
        facts: [
            ['24h + 1h', 'email reminders before every visit'],
            [String(SMS_MONTHLY_TEXTS), 'texts a month with the SMS add-on'],
            [dollars(SMS_MONTHLY_CENTS), 'a month for SMS, on Growth'],
        ],
        sections: [
            { type: 'pains', style: 'cards' },
            { type: 'facts' },
            { type: 'rows' },
            { type: 'steps', style: 'timeline' },
            { type: 'benefits', style: 'bento' },
        ],
        rows: [
            {
                eyebrow: 'Rebooking', title: 'A nudge when it\'s time again.',
                body: 'Set how often each service should be redone. Clients who are due and haven\'t rebooked get a reminder with a link straight to your calendar.',
                visual: { slot: 'row-1', widget: { kind: 'rebook', business: 'Locs by Nia', service: 'Retwist', weeks: 6 } },
            },
            {
                eyebrow: 'Waitlist', title: 'Openings announce themselves.',
                body: 'Clients join your waitlist for the dates they want and hear the moment a fitting slot opens.',
                visual: { slot: 'row-2', widget: { kind: 'calendar' } },
            },
        ],
        painsTitle: 'What slips through',
        pains: [
            { title: 'Forgotten appointments', body: 'Booked three weeks ago, gone from memory by the day.' },
            { title: 'Regulars who go quiet', body: 'They meant to rebook, then didn\'t, and now they\'re overdue.' },
            { title: 'Reminding everyone yourself', body: 'Texting each client the night before is an hour you don\'t get paid for.' },
        ],
        benefitsTitle: 'Everything that goes out for you',
        benefitsIntro: 'Turn each one on or off in your settings.',
        benefits: [
            { title: 'Booking confirmations', body: 'Clients get a confirmation with the service, time and your address as soon as they\'re booked.' },
            { title: 'Reminders 24 hours and 1 hour before', body: 'By email, for clients and for you. Each can be switched on or off.' },
            { title: 'SMS add-on', body: `On Growth, add text reminders for ${dollars(SMS_MONTHLY_CENTS)}/mo with ${SMS_MONTHLY_TEXTS} texts a month: confirmations, reminders and pay links, to clients who agree to texts.` },
            { title: 'Rebook reminders', body: 'Set how often a service should be redone. Clients who are due and haven\'t rebooked get a nudge with a link to your calendar.' },
            { title: 'Waitlist alerts', body: 'When someone cancels, clients on your waitlist whose dates fit get an email right away.' },
            { title: 'Pay links', body: 'Near the end of the appointment, the client gets a link to pay what\'s left.' },
        ],
        steps: {
            title: 'A client\'s messages, start to finish',
            steps: [
                { title: 'Booked', body: 'Confirmation by email, and by text with the SMS add-on.' },
                { title: 'A day before, an hour before', body: 'Reminders with the time, service and anything they need to bring.' },
                { title: 'At the end', body: 'A link to pay the balance.' },
                { title: 'When it\'s time again', body: 'A rebook reminder when the service is due, with a link to book.' },
            ],
        },
        faq: [
            ['Do reminders cost extra?', 'Email reminders are included. Text reminders are the SMS add-on on Growth.'],
            ['Who gets texts?', 'Only clients who tick "Text me about this appointment" when they book. Every text says how to opt out, and anyone who replies STOP is never texted again.'],
            ['What happens if I use all 400 texts?', 'Texts stop until next month and reminders keep going out by email.'],
            ['Do reminders show the right time zone?', 'Yes. Times in reminders use your business\'s time zone.'],
        ],
        related: ['/features/no-show-protection', '/features/loyalty', '/for/locticians'],
    },

    payments: {
        slug: 'payments',
        kind: 'feature',
        metaTitle: 'Payments with 0% Platform Fee for Hair Stylists | AfroAllure',
        metaDescription: `Take deposits, card payments and pay links with no AfroAllure fee on Growth (${GROWTH_PRICE}). Stripe processing at cost, cash with no fees, free payouts to your bank.`,
        eyebrow: 'Payments',
        heroTitle: <>Your money stays yours.<br /><em>0% platform fee on Growth.</em></>,
        heroBody: `On Growth, AfroAllure takes nothing from your bookings. You pay one flat price, ${GROWTH_PRICE}, and Stripe's card processing at cost. That's it.`,
        theme: { accent: '#2F7D5B', hero: 'centered-dark' },
        heroVisual: { slot: 'hero', widget: { kind: 'dashboard', view: 'appointments', business: 'Studio Amara' } },
        facts: [
            ['0%', 'AfroAllure fee on your payments, on Growth'],
            [dollars(GROWTH_MONTHLY_CENTS), 'a month, flat. Or ' + dollars(GROWTH_YEARLY_CENTS) + ' a year'],
            ['2.9% + 30¢', 'Stripe card processing, passed through at cost'],
        ],
        sections: [
            { type: 'facts' },
            { type: 'rows' },
            { type: 'steps', style: 'timeline' },
            { type: 'benefits', style: 'grid' },
        ],
        rows: [
            {
                eyebrow: 'Deposits', title: 'Paid before they ever sit down.',
                body: 'A deposit by card confirms the booking, and it comes off the final balance if you choose. No screenshots, no "did you get it?"',
                visual: { slot: 'row-1', widget: { kind: 'checkout', service: 'Boho knotless · Waist', totalCents: 28000, depositCents: 7000 } },
            },
            {
                eyebrow: 'Pay links', title: 'The balance, settled in a tap.',
                body: 'Near the end of the appointment, the client gets a link to pay what\'s left, and can add a tip. Add the SMS add-on and it arrives by text too.',
                bullets: ['Sent automatically near the end', 'Send one any time from the appointment', 'Refunds in full or in part from the dashboard'],
                visual: { slot: 'row-2', widget: { kind: 'texts', business: 'Studio Amara', service: 'Silk press' } },
            },
            {
                eyebrow: 'What you keep', title: 'No cut. Just Stripe at cost.',
                body: 'On Growth, the only thing taken from a card payment is Stripe\'s standard processing. AfroAllure\'s share is zero.',
                visual: { slot: 'row-3', widget: { kind: 'payout', amountCents: 20000 } },
            },
        ],
        painsTitle: 'Where the money leaks',
        pains: [
            { title: 'A cut of every booking', body: 'Percentage fees look small until you add them up across a month of $200 appointments.' },
            { title: 'Chasing the balance', body: 'The appointment is done, the client is at the door, and the payment still has to happen.' },
            { title: 'Deposits by app-to-app transfer', body: 'Screenshots, "did you get it?", and no record tied to the appointment.' },
        ],
        benefitsTitle: 'How payments work',
        benefitsIntro: 'Built on Stripe, connected in a few minutes, paid out to your bank.',
        benefits: [
            { title: 'No AfroAllure fee on Growth', body: `Growth is ${GROWTH_PRICE}, flat. On the free Starter plan, AfroAllure takes 1% per card payment instead of a monthly price.` },
            { title: 'Stripe at cost', body: 'Card payments go through Stripe at its standard 2.9% + 30¢, passed through with nothing added.' },
            { title: 'Deposits when they book', body: 'A flat or percentage deposit, paid by card to confirm the booking, and taken off the final balance if you choose.' },
            { title: 'Pay links and tips', body: 'Near the end of the appointment, the client gets a link to pay what\'s left and add a tip. AfroAllure takes no cut of tips.' },
            { title: 'Cash with no fees', body: 'Mark an appointment paid in cash and it\'s recorded with no fee from anyone.' },
            { title: 'Payouts your way', body: `Standard payouts to your bank are free and usually arrive in 2 business days. Instant payouts arrive in about 30 minutes for ${INSTANT_PAYOUT_FEE_LABEL}.` },
        ],
        steps: {
            title: 'From booking to paid',
            steps: [
                { title: 'Connect Stripe', body: 'Add your bank details once in your dashboard. Payouts go straight to your account.' },
                { title: 'Client pays the deposit to book', body: 'The booking is confirmed when the deposit goes through, and the amount owed is shown on the appointment.' },
                { title: 'Balance at the end', body: 'A pay link goes out near the end of the appointment, or the client pays cash and you mark it paid.' },
            ],
        },
        faq: [
            ['What does "0% fee" mean exactly?', `On Growth, AfroAllure doesn't take a percentage of your payments. You pay the plan price (${GROWTH_PRICE}) and Stripe charges its standard card processing, which every card processor charges.`],
            ['What does Starter cost?', 'Starter has no monthly price. AfroAllure takes 1% of each card payment, on top of Stripe\'s processing. Cash payments have no fee.'],
            ['When do I get paid?', `Standard payouts to your bank are free and usually arrive in 2 business days. Need it sooner? Instant payouts arrive in about 30 minutes, any day of the week, for ${INSTANT_PAYOUT_FEE_LABEL} of the amount. They're always optional.`],
            ['Can clients pay the full amount up front?', 'Clients pay the deposit to book, and the balance by pay link or in person. You can send a pay link at any time from the appointment.'],
        ],
        related: ['/features/no-show-protection', '/for/braiders', '/switch/styleseat'],
    },

    'no-show-protection': {
        slug: 'no-show-protection',
        kind: 'feature',
        metaTitle: 'No-Show Protection for Hair Stylists | Deposits, No-Show & Late Fees | AfroAllure',
        metaDescription: 'Protect your time with deposits, a saved card for agreed no-show fees, late fees with a grace period, policies clients agree to, and a ban list for clients you don\'t want back.',
        eyebrow: 'No-show protection',
        heroTitle: <>No deposit, no appointment.<br /><em>No show, no problem.</em></>,
        heroBody: 'Deposits hold the chair, the card is saved for an agreed no-show fee, late fees cover the clients who run behind, and repeat offenders can be banned.',
        theme: { accent: '#FC6161', hero: 'split-dark' },
        heroVisual: { slot: 'hero', widget: { kind: 'checkout', service: 'Small knotless · Waist', totalCents: 34000, depositCents: 8500, noShowFeeCents: 8500 } },
        sections: [
            { type: 'pains', style: 'quotes' },
            { type: 'rows' },
            {
                type: 'demo', title: 'From no-show to fee charged, in two taps.',
                body: 'An unpaid appointment is flagged Incomplete. Mark it a no-show and charge the fee the client agreed to, right from the appointment.',
                visual: { slot: 'demo', widget: { kind: 'dashboard', view: 'no-show', business: 'Braids by Kayla' } },
            },
            { type: 'steps', style: 'cards' },
            { type: 'benefits', style: 'checklist' },
        ],
        rows: [
            {
                eyebrow: 'Reminders', title: 'Most no-shows just forgot.',
                body: 'A confirmation when they book, then reminders a day and an hour before. With the SMS add-on, they land as texts too.',
                visual: { slot: 'row-1', widget: { kind: 'texts', business: 'Braids by Kayla', service: 'Small knotless' } },
            },
            {
                eyebrow: 'Ban list', title: 'Some clients don\'t get a second chance.',
                body: 'Ban a client and they can\'t book online again with the same email or phone number. Lift the ban any time from your Banned List.',
                visual: { slot: 'row-2', widget: { kind: 'dashboard', view: 'clients', business: 'Braids by Kayla' } },
            },
        ],
        painsTitle: 'What a no-show costs',
        pains: [
            { title: 'Hours you can\'t sell twice', body: 'A long service blocked out, the client never comes, and it\'s too late to fill the slot.' },
            { title: 'Awkward conversations', body: 'Asking a client to pay for a missed appointment, with nothing agreed in writing.' },
            { title: 'The client who\'s always late', body: 'Twenty minutes behind pushes the rest of your day back, every time.' },
        ],
        benefitsTitle: 'Every layer of protection',
        benefitsIntro: 'Turn on what you need in Booking Settings. Clients see your terms before they pay.',
        benefits: [
            { title: 'Deposits to book', body: 'A flat amount or a percentage of the service, paid by card to confirm the booking.' },
            { title: 'No-show fees on a saved card', body: 'The deposit card is saved and the agreed fee is shown before the client pays. If they don\'t come, charge it from the appointment in one tap. Nothing is charged automatically.' },
            { title: 'Late fees with a grace period', body: 'Choose the fee and how many minutes late counts. If a client runs late, add it to their balance from the appointment.' },
            { title: 'Policies clients agree to', body: 'Your cancellation, refund and prep policies, with a box clients must tick before they can book.' },
            { title: 'Reminders before every visit', body: 'Email reminders 24 hours and 1 hour before, and text reminders with the SMS add-on.' },
            { title: 'A ban list', body: 'Ban a client and they can\'t book online again with that email or phone number.' },
        ],
        steps: {
            title: 'How a missed appointment plays out',
            steps: [
                { title: 'Client books and agrees', body: 'They see your deposit, no-show fee and policies, tick that they agree, and pay the deposit.' },
                { title: 'Reminders go out', body: 'A day before and an hour before, by email, and by text if you have the SMS add-on.' },
                { title: 'They don\'t come', body: 'Thirty minutes after the end time, an unpaid appointment is flagged so you can decide: mark it paid, or mark it a no-show.' },
                { title: 'Charge the agreed fee', body: 'On a no-show with a saved card, charge the no-show fee in one tap. The client agreed to it when they booked.' },
            ],
        },
        faq: [
            ['Is the no-show fee charged automatically?', 'No. You decide, appointment by appointment, and charge it with one tap from the appointment. The client agreed to the amount when they booked.'],
            ['Do I need deposits to charge a no-show fee?', 'Yes. The card is saved when the client pays the deposit, which is what lets you charge the fee later.'],
            ['Can I give a grace period for lateness?', 'Yes. Choose how many minutes late counts as late, and a flat or percentage fee.'],
            ['Can I stop a client from booking again?', 'Yes. Ban them from your client list and they can\'t book online with that email or phone number. They\'re told you aren\'t taking bookings from them, not why.'],
            ['What does it cost?', `Deposits, no-show fees, late fees and the ban list come with every plan. On Starter, AfroAllure takes 1% of card payments; on Growth (${GROWTH_PRICE}) it takes nothing.`],
        ],
        related: ['/features/payments', '/features/client-management', '/for/wigs-and-installs'],
    },

    loyalty: {
        slug: 'loyalty',
        kind: 'feature',
        metaTitle: 'Loyalty Program for Stylists & Beauty Pros | Rewards by Visits or Spend | AfroAllure',
        metaDescription: 'Reward your regulars automatically: they earn by visits or by spend, get $ or % off, receive their progress by email after every visit, and earn a bonus for rebooking on time.',
        eyebrow: 'Loyalty program',
        heroTitle: <>Regulars feel it.<br /><em>Rewards that run themselves.</em></>,
        heroBody: 'Clients earn toward a reward every time they come in, see their progress by email, and get a code when they\'ve earned it. No punch cards, no spreadsheet.',
        theme: { accent: '#C9974A', hero: 'split-light' },
        heroVisual: { slot: 'hero', widget: { kind: 'loyalty', business: 'Coils by Dani', visits: 5, reward: '$20 off' } },
        facts: [
            ['Visits or spend', 'how clients earn, your choice'],
            ['$ or %', 'off their next appointment'],
            ['Automatic', 'progress emailed after every visit'],
        ],
        sections: [
            { type: 'facts' },
            { type: 'rows' },
            { type: 'pains', style: 'numbered' },
            { type: 'steps', style: 'timeline' },
            { type: 'benefits', style: 'bento' },
        ],
        rows: [
            {
                eyebrow: 'Rebook bonus', title: 'Reward them for coming back on time.',
                body: 'Turn on the rebook bonus and clients who book their next visit within your window earn an extra visit toward their reward.',
                visual: { slot: 'row-1', widget: { kind: 'rebook', business: 'Coils by Dani', service: 'Wash & twist-out', weeks: 4 } },
            },
            {
                eyebrow: 'Redeem', title: 'Applied at the appointment.',
                body: 'Open the appointment, pick the reward or enter the client\'s code, and it comes off what they owe.',
                visual: { slot: 'row-2', widget: { kind: 'dashboard', view: 'appointments', business: 'Coils by Dani' } },
            },
        ],
        painsTitle: 'Why regulars drift',
        pains: [
            { title: 'Nothing to come back for', body: 'Your best clients get the same experience as someone you\'ll never see again.' },
            { title: 'Paper punch cards', body: 'Lost in a bag, forgotten at home, and impossible to check.' },
            { title: 'Discounts you forget you promised', body: '"You said my sixth one was free," and you have no way to know.' },
        ],
        benefitsTitle: 'How your program works',
        benefitsIntro: 'Set it up once in Rewards. Every completed appointment counts.',
        benefits: [
            { title: 'Earn by visits or spend', body: 'A reward every few visits, or every time a client spends a set amount with you.' },
            { title: 'Dollars or percent off', body: 'A set amount or a percentage off their next appointment.' },
            { title: 'Expiry if you want it', body: 'Rewards can expire after a number of days, or never.' },
            { title: 'Rebook bonus', body: 'An extra visit for clients who book again within your window.' },
            { title: 'Progress emails', body: 'After every visit, clients see how close they are, with a link to book again.' },
            { title: 'You stay in control', body: 'Add or remove progress, give a reward yourself, or void one from the Rewards page.' },
        ],
        steps: {
            title: 'From first visit to reward',
            steps: [
                { title: 'Set your rules', body: 'Visits or spend, the reward, and whether it expires.' },
                { title: 'Clients earn automatically', body: 'Each completed appointment counts once, however it was paid.' },
                { title: 'They get a code', body: 'When they earn a reward, the code arrives by email.' },
                { title: 'Applied at their next visit', body: 'You apply it to the appointment and it comes off the balance.' },
            ],
        },
        faq: [
            ['Do clients need an app or an account?', 'No. Progress and reward codes come by email.'],
            ['What counts as a visit?', 'A completed appointment. Each one counts once, however it was paid.'],
            ['Can I give someone a reward myself?', 'Yes. Add or remove progress, give a reward, or void one from the Rewards page.'],
            ['Do rewards expire?', 'Only if you want them to. Set an expiry in days, or let rewards never expire.'],
            ['What does it cost?', `Loyalty is ${ON_GROWTH}.`],
        ],
        related: ['/features/client-management', '/features/reminders', '/for/locticians'],
    },

    'client-management': {
        slug: 'client-management',
        kind: 'feature',
        metaTitle: 'Client Management for Stylists | Client List, Import & Ban List | AfroAllure',
        metaDescription: 'Every client in one list, saved when they book. Import your list from StyleSeat, GlossGenius or Acuity, see who your regulars are, and ban clients so they can\'t book again.',
        eyebrow: 'Client management',
        heroTitle: <>Know every client.<br /><em>Keep out the ones who cost you.</em></>,
        heroBody: 'Clients are saved the moment they book. Bring your list from another app, see who keeps coming back, and ban anyone you don\'t want back.',
        theme: { accent: '#B5523B', hero: 'split-dark' },
        heroVisual: { slot: 'hero', widget: { kind: 'dashboard', view: 'clients', business: 'Studio Amara' } },
        facts: [
            ['Saved automatically', 'every client who books'],
            ['CSV import', 'from StyleSeat, GlossGenius, Acuity and more'],
            ['Email + phone', 'checked against your ban list on every online booking'],
        ],
        sections: [
            { type: 'pains', style: 'cards' },
            { type: 'rows' },
            { type: 'facts' },
            { type: 'benefits', style: 'checklist' },
            { type: 'steps', style: 'timeline' },
        ],
        rows: [
            {
                eyebrow: 'Regulars', title: 'See who keeps coming back.',
                body: 'Each client\'s visits and what they\'ve spent, in one place. Clients due for their next service get a rebook reminder.',
                visual: { slot: 'row-1', widget: { kind: 'rebook', business: 'Studio Amara', service: 'Silk press', weeks: 3 } },
            },
            {
                eyebrow: 'Loyalty', title: 'Reward the ones who stay.',
                body: 'Your regulars earn toward a reward with every visit and see their progress by email.',
                visual: { slot: 'row-2', widget: { kind: 'loyalty', business: 'Studio Amara', visits: 4, reward: '15% off' } },
            },
        ],
        painsTitle: 'Where client lists fall apart',
        pains: [
            { title: 'Clients scattered everywhere', body: 'Some in your DMs, some in your phone, some in the app you\'re leaving.' },
            { title: 'No idea who your regulars are', body: 'You know them by face, but not how often they come or what they spend.' },
            { title: 'The client you never want back', body: 'They no-showed twice, and there\'s nothing stopping them booking again.' },
        ],
        benefitsTitle: 'Everything in your client list',
        benefitsIntro: 'Open Clients in your dashboard.',
        benefits: [
            { title: 'Saved when they book', body: 'Name, email and phone are added the first time a client books, online or by you.' },
            { title: 'Import from other apps', body: 'Upload a CSV from StyleSeat, GlossGenius, Acuity, Square, Vagaro, Booksy or a spreadsheet.' },
            { title: 'Visits and spend', body: 'See each client\'s appointments and what they\'ve paid you.' },
            { title: 'A ban list', body: 'Ban a client and they can\'t book online again with that email or phone number. Lift it any time.' },
            { title: 'Client analytics', body: 'Returning clients, retention rate and average lifetime value, on Growth.' },
            { title: 'Add and edit by hand', body: 'Add a client yourself, fix a typo, or remove someone from your list.' },
        ],
        steps: {
            title: 'Your list, set up in minutes',
            steps: [
                { title: 'Import your list', body: 'Export a CSV from your old app and upload it. We show you where to find it.' },
                { title: 'New clients add themselves', body: 'Everyone who books is saved to your list automatically.' },
                { title: 'Ban who you need to', body: 'One tap, and they can\'t book online with you again.' },
            ],
        },
        faq: [
            ['How do I bring my clients over?', 'Export your client list as a CSV from your old app, then upload it in Clients → Import. We show where the export lives in StyleSeat, GlossGenius, Acuity and others.'],
            ['What happens when I ban someone?', 'They can\'t book online with that email or phone number. They\'re told you aren\'t taking bookings from them, not why.'],
            ['Can I unban someone?', 'Yes. Open your Banned List and lift the ban any time.'],
            ['What does it cost?', `The client list, import and ban list come with every plan. Client analytics are ${ON_GROWTH}.`],
        ],
        related: ['/features/loyalty', '/features/no-show-protection', '/switch/styleseat'],
    },
}
