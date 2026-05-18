'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function MonetizationTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('monetization') && isOnboarded) {
            const t = setTimeout(() => startTour('monetization'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
