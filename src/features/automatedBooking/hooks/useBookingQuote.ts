'use client'

import { useMemo } from 'react'
import { parsePrep, parseStyleOptions, quoteBooking, QuoteError, type Quote } from '@/features/services/pricing'
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

export function useBookingQuote() {
    const { data }: { data: BookingData } = useBooking()
    return useMemo(
        () => quoteForBooking(data),
        [data.services, data.selectedService, data.selectedAddons, data.styleSelection]
    )
}

/** Choices kept across page reloads alongside the booking session id. */
export const BOOKING_SELECTION_KEY = 'bookingSelection'
