// Sample business data for the layout preview page and visual tests.
// Not used on real sites.

import type { SiteInfo } from '@/features/siteBuilder/siteData'
import type { BuilderMetadata } from './render/context'

const photo = (seed: string, w = 900, h = 1100) => ({ url: `https://picsum.photos/seed/${seed}/${w}/${h}`, path: '', kind: 'image' as const })

export const SAMPLE_INFO: SiteInfo = {
    businessName: 'Kay\'s Braid Studio',
    urlName: 'kays-braids',
    place: 'Brooklyn, NY',
    travels: false,
    services: [
        { id: 's1', category: 'Braids', photo: photo('aa-svc-s1', 800, 900).url, name: 'Knotless braids', description: 'Lightweight, natural-looking braids with no tension at the root.', price: 'from $180', duration: '5h+' },
        { id: 's2', category: 'Braids', photo: photo('aa-svc-s2', 800, 900).url, name: 'Boho knotless', description: 'Knotless braids with curly pieces left out for a soft, bohemian look.', price: 'from $220', duration: '6h+' },
        { id: 's3', category: 'Natural hair', photo: photo('aa-svc-s3', 800, 900).url, name: 'Silk press', description: 'Smooth, bouncy straightening with a deep conditioning treatment.', price: '$95', duration: '2h' },
        { id: 's4', category: 'Locs', photo: photo('aa-svc-s4', 800, 900).url, name: 'Loc retwist', description: 'Retwist and style for starter or mature locs.', price: '$85', duration: '1h 30m' },
        { id: 's5', category: 'Braids', photo: photo('aa-svc-s5', 800, 900).url, name: 'Cornrows', description: 'Classic straight-back or designed cornrows.', price: 'from $60', duration: '1h' },
        { id: 's6', category: 'Braids', photo: photo('aa-svc-s6', 800, 900).url, name: 'Kids braids', description: 'Gentle braids for ages 4–12.', price: 'from $70', duration: '2h' },
    ],
    hours: [
        { days: 'Tue – Wed', hours: '9 AM – 6 PM' },
        { days: 'Thu', hours: '10 AM – 8 PM' },
        { days: 'Fri', hours: '9 AM – 6 PM' },
        { days: 'Sat', hours: '8 AM – 4 PM' },
        { days: 'Sun – Mon', hours: 'Closed' },
    ],
    policies: { cancelDays: 2, rescheduleDays: 1, readBeforeBooking: 'Please arrive with hair washed and detangled. Bring a scarf for after. No extra guests, please.', deposit: '$25 deposit to book', lateFee: '$15 if you’re more than 15 minutes late', noShowFee: '$40 if you miss your appointment' },
    reviews: [
        { name: 'Bri', rating: 5, text: 'My knotless braids lasted eight weeks and looked fresh the whole time. Kay is so gentle!' },
        { name: 'Tasha', rating: 5, text: 'Best silk press I have ever had. My hair was bouncy for two weeks.' },
        { name: 'Monique', rating: 5, text: 'On time, clean studio, and she listened to exactly what I wanted.' },
        { name: 'Ade', rating: 4, text: 'Beautiful work on my daughter\'s braids, she sat happily the whole time.' },
    ],
    rating: { average: 4.9, count: 128 },
    fallbackBio: 'Kay has been braiding in Brooklyn for over ten years. She specializes in knotless and boho braids that are gentle on your edges and last for weeks.',
}

export const SAMPLE_PHOTOS = {
    cover: photo('aa-cover'),
    second: photo('aa-two', 800, 800),
    third: photo('aa-three', 800, 800),
    portrait: photo('aa-portrait', 800, 800),
    gallery: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'].map(s => photo(`aa-${s}`, 800, 900)),
}

export const SAMPLE_METADATA: BuilderMetadata = {
    info: SAMPLE_INFO,
    basePath: '/business/kays-braids',
    planType: 'GROWTH',
    openings: [
        { label: 'Thu, Nov 6 · 10 AM' },
        { label: 'Thu, Nov 6 · 2 PM' },
        { label: 'Sat, Nov 8 · 9 AM' },
    ],
    week: [
        { day: 'Today', date: 'Nov 3', open: false },
        { day: 'Tue', date: 'Nov 4', open: true },
        { day: 'Wed', date: 'Nov 5', open: true },
        { day: 'Thu', date: 'Nov 6', open: true },
        { day: 'Fri', date: 'Nov 7', open: false },
        { day: 'Sat', date: 'Nov 8', open: true },
        { day: 'Sun', date: 'Nov 9', open: false },
    ],
    offers: {
        loyalty: { title: 'Loyalty rewards', detail: 'Every 5th visit, $10 off.', visits: 5, rewardText: '$10 off' },
        referral: { title: 'Refer a friend', detail: 'You both get $10 off when a friend books.', rewardText: '$10 off' },
    },
}
