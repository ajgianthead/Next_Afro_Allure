'use client'

import { useEffect } from 'react'
import { clearBookingProgress } from '../hooks/useBookingQuote'

/** On the "booked" page: the finished booking must not be picked up by the next one made in this browser. */
export function ClearBookingProgress() {
    useEffect(() => { clearBookingProgress() }, [])
    return null
}
