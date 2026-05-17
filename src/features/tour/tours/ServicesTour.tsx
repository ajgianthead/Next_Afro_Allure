'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function ServicesTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('services') && isOnboarded) {
            const t = setTimeout(() => startTour('services'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
