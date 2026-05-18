'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function AnalyticsTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('analytics') && isOnboarded) {
            const t = setTimeout(() => startTour('analytics'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
