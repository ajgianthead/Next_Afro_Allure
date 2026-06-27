'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function AppointmentsTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        // Yield to ManualBookingTour when it's explicitly requested via URL param
        const params = new URLSearchParams(window.location.search)
        if (params.get('tour') === 'manual-booking') return

        if (!isTourComplete('appointments') && isOnboarded) {
            const t = setTimeout(() => startTour('appointments'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
