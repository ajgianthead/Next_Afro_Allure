'use client'

import { useTour } from '../useTour'

// Starts the guided page-editor setup tour the first time a stylist applies
// a template. Call `trigger()` from the template-apply success handler(s) —
// it no-ops if the tour has already been completed.
export function useWebBuilderEditorTour() {
    const { startTour, isTourComplete, isOnboarded } = useTour()

    const trigger = () => {
        if (isTourComplete('webBuilderEditor') || !isOnboarded) return
        setTimeout(() => startTour('webBuilderEditor'), 600)
    }

    return { trigger }
}
