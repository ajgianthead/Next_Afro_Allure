'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function BookingSettingsTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('bookingSettings') && isOnboarded) {
            const t = setTimeout(() => startTour('bookingSettings'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
