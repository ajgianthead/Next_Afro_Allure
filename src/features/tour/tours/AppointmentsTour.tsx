'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function AppointmentsTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('appointments') && isOnboarded) {
            const t = setTimeout(() => startTour('appointments'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
