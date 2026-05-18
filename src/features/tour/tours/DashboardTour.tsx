'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function DashboardTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('dashboard') && isOnboarded) {
            const t = setTimeout(() => startTour('dashboard'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
