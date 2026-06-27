'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function ManualBookingTour() {
    const { startTour } = useTour()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('tour') !== 'manual-booking') return

        window.history.replaceState({}, '', '/dashboard/appointments')
        setTimeout(() => startTour('manualBooking'), 900)
    }, [])

    return null
}
