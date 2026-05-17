'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function AddonsTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (isTourComplete('services') && !isTourComplete('addons') && isOnboarded) {
            const t = setTimeout(() => startTour('addons'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
