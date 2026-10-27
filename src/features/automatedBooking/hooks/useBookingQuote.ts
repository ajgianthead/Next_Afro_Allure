'use client'

import { useMemo } from 'react'
import { describeSelectedOptions, parsePrep, parseStyleOptions, quoteBooking, QuoteError, startingPrice, type Quote } from '@/features/services/pricing'
import type { BookingData } from '../context/BookingDataContext'
import { useBooking } from './useBookingData'

/**
 * Live price and duration for the client's current choices — the same
 * calculation the server charges. Display only; the server re-prices.
 */
export function quoteForBooking(data: Pick<BookingData, 'services' | 'selectedService' | 'selectedAddons' | 'styleSelection'>) {
    const service = data.services.find(s => s.id === data.selectedService) ?? null
    if (!service) return { service: null, quote: null as Quote | null, error: null as string | null, hasOptions: false, prep: null }
    const addons = ((service.addons as any[]) ?? [])
        .filter(a => a && data.selectedAddons.includes(a.id))
        .map(a => ({ id: a.id, name: a.name, price: Number(a.price ?? 0) }))
    const hasOptions = !!parseStyleOptions(service.style_options)
    const prep = parsePrep(service.prep)
    try {
        return { service, quote: quoteBooking(service, data.styleSelection, addons), error: null, hasOptions, prep }
    } catch (err) {
        return { service, quote: null, error: err instanceof QuoteError ? err.message : 'This service can’t be priced right now.', hasOptions, prep }
    }
}

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

/**
 * Price and choices for the selected service, as shown in the booking flow:
 * "$195" once it's priced (size/length price, hair and add-ons, from cents),
 * "from $160" while a size or length still has to be picked.
 */
export function selectedServiceText(data: Pick<BookingData, 'services' | 'selectedService' | 'selectedAddons' | 'styleSelection'>): { price: string; options: string } | null {
    const { service, quote } = quoteForBooking(data)
    if (!service) return null
    if (!quote) return { price: `from ${money(startingPrice(service))}`, options: '' }
    return { price: money(quote.totalCents), options: describeSelectedOptions(quote.selectedOptions) }
}

export function useBookingQuote() {
    const { data }: { data: BookingData } = useBooking()
    return useMemo(
        () => quoteForBooking(data),
        [data.services, data.selectedService, data.selectedAddons, data.styleSelection]
    )
}

/** Choices kept across page reloads alongside the booking session id. */
export const BOOKING_SELECTION_KEY = 'bookingSelection'
