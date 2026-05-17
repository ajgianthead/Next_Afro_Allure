'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function AvailabilityTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('availability') && isOnboarded) {
            const t = setTimeout(() => startTour('availability'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
