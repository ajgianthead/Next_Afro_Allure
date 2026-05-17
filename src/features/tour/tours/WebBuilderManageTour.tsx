'use client'

import { useEffect } from 'react'
import { useTour } from '../useTour'

export function WebBuilderManageTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    useEffect(() => {
        if (!isTourComplete('webBuilderManage') && isOnboarded) {
            const t = setTimeout(() => startTour('webBuilderManage'), 800)
            return () => clearTimeout(t)
        }
    }, [])

    return null
}
