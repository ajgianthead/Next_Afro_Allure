// /features/<feature> pages: one feature each, explained in full, for links
// in DMs, ads and posts. Keep every claim true of AfroAllure today.

import type { MarketingPageContent } from './content'
import {
    dollars, GROWTH_MONTHLY_CENTS, GROWTH_YEARLY_CENTS, SMS_MONTHLY_CENTS, SMS_MONTHLY_TEXTS, TRIAL_DAYS,
} from '../billing/plans'

const GROWTH_PRICE = `${dollars(GROWTH_MONTHLY_CENTS)}/mo or ${dollars(GROWTH_YEARLY_CENTS)}/yr`

export type FeatureSlug = 'payments' | 'no-show-protection' | 'reminders' | 'style-menus'

export const FEATURES: Record<FeatureSlug, MarketingPageContent> = {
    payments: {
        slug: 'payments',
        kind: 'feature',
        metaTitle: 'Payments with 0% Platform Fee for Hair Stylists | AfroAllure',
        metaDescription: `Take deposits, card payments and pay links with no AfroAllure fee on Growth (${GROWTH_PRICE}). Stripe processing at cost, cash with no fees, payouts to your bank.`,
        eyebrow: 'Payments',
        heroTitle: <>Your money stays yours.<br /><em>0% platform fee on Growth.</em></>,
        heroBody: `On Growth, AfroAllure takes nothing from your bookings. You pay one flat price, ${GROWTH_PRICE}, and Stripe's card processing at cost. That's it.`,
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
            { title: 'Pay links at the end', body: 'Near the end of the appointment, the client gets an email link to pay what\'s left. You can also send one from the appointment any time.' },
            { title: 'Cash with no fees', body: 'Mark an appointment paid in cash and it\'s recorded with no fee from anyone.' },
            { title: 'Refunds from the dashboard', body: 'Refund a deposit or payment, in full or in part, from the appointment, and the record updates for you.' },
        ],
        steps: {
            title: 'From booking to paid',
            steps: [
                { title: 'Connect Stripe', body: 'Add your bank details once in your dashboard. Payouts go straight to your account on Stripe\'s schedule.' },
                { title: 'Client pays the deposit to book', body: 'The booking is confirmed when the deposit goes through, and the amount owed is shown on the appointment.' },
                { title: 'Balance at the end', body: 'A pay link goes out near the end of the appointment, or the client pays cash and you mark it paid.' },
            ],
        },
        faq: [
            ['What does "0% fee" mean exactly?', `On Growth, AfroAllure doesn't take a percentage of your payments. You pay the plan price (${GROWTH_PRICE}) and Stripe charges its standard card processing, which every card processor charges.`],
            ['What does Starter cost?', 'Starter has no monthly price. AfroAllure takes 1% of each card payment, on top of Stripe\'s processing. Cash payments have no fee.'],
            ['When do I get paid?', 'Stripe pays out to your bank on its normal schedule, usually within a few business days.'],
            ['Can clients pay the full amount up front?', 'Clients pay the deposit to book, and the balance by pay link or in person. You can send a pay link at any time from the appointment.'],
        ],
        related: ['/features/no-show-protection', '/for/braiders', '/switch/styleseat'],
    },

    'no-show-protection': {
        slug: 'no-show-protection',
        kind: 'feature',
        metaTitle: 'No-Show Protection for Hair Stylists | Deposits, No-Show & Late Fees | AfroAllure',
        metaDescription: 'Protect your time with deposits, a saved card for agreed no-show fees, late fees with a grace period, reminders and policies clients agree to before they book. 30 days free.',
        eyebrow: 'No-show protection',
        heroTitle: <>No deposit, no appointment.<br /><em>No show, no problem.</em></>,
        heroBody: 'Deposits hold the chair, the card is saved for an agreed no-show fee, late fees cover the clients who run behind, and reminders make sure they remember.',
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
            { title: 'Cancellations that refill', body: 'When someone cancels, clients on your waitlist whose dates fit get an email right away.' },
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
            ['What do clients see?', 'Your deposit, no-show fee, late fee and policies, before they pay, with a box they tick to agree.'],
            ['What does it cost?', `Included on Growth (${GROWTH_PRICE}) and in the ${TRIAL_DAYS}-day free trial.`],
        ],
        related: ['/features/payments', '/features/reminders', '/for/wigs-and-installs'],
    },

    reminders: {
        slug: 'reminders',
        kind: 'feature',
        metaTitle: 'Appointment Reminders, SMS & Rebook Nudges for Stylists | AfroAllure',
        metaDescription: `Automatic email reminders 24 hours and 1 hour before, text reminders with the SMS add-on (${dollars(SMS_MONTHLY_CENTS)}/mo for ${SMS_MONTHLY_TEXTS} texts), rebook nudges and a waitlist for cancellations.`,
        eyebrow: 'Reminders & SMS',
        heroTitle: <>Clients remember.<br /><em>Regulars come back.</em></>,
        heroBody: 'Reminders before each visit, a nudge when it\'s time to rebook, and a waitlist that fills the gaps, all sent for you.',
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
        related: ['/features/no-show-protection', '/for/locticians', '/for/natural-hair'],
    },

    'style-menus': {
        slug: 'style-menus',
        kind: 'feature',
        metaTitle: 'Size × Length Pricing & Prep Checklists for Braids, Locs and Installs | AfroAllure',
        metaDescription: 'Price braids, locs and installs the way you actually price them: by size and length, with hair included, optional or brought, priced add-ons and prep checklists clients agree to.',
        eyebrow: 'Style menus & prep',
        heroTitle: <>Priced the way<br /><em>textured hair is priced.</em></>,
        heroBody: 'One service, a grid of prices. Clients choose the size, the length and the hair, see the real price and time, and read your prep before they book.',
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
        related: ['/for/braiders', '/for/locticians', '/for/wigs-and-installs'],
    },
}
