'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

/** First visit to the website builder: a three-step tour. */
export function WebsiteBuilderTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('websiteBuilder') && isOnboarded) {
            const t = setTimeout(() => startTour('websiteBuilder'), 1200)
            return () => clearTimeout(t)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return null
}
