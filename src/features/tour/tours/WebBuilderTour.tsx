'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function WebBuilderTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('webBuilder') && isOnboarded) {
            const t = setTimeout(() => startTour('webBuilder'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
