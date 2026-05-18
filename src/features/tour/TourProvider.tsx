'use client'

import React, { createContext, useCallback, useRef, useState } from 'react'
import { Joyride, EVENTS, STATUS, ACTIONS } from 'react-joyride'
import type { Step, EventData } from 'react-joyride'
import { markTourComplete } from './actions'
import { TOUR_STEPS } from './tourSteps'
import { TourTooltip } from './TourTooltip'
import { toast } from 'sonner'

// Extracts the data-tour key from a Joyride target selector
// e.g. '[data-tour="appointments-list"]' → 'appointments-list'
function extractTourKey(target: string | HTMLElement | undefined): string {
    if (!target || typeof target !== 'string') return ''
    const match = target.match(/data-tour="([^"]+)"/)
    return match?.[1] ?? ''
}

interface TourContextValue {
    toursCompleted: Record<string, boolean>
    isOnboarded: boolean
    businessId: string
    startTour: (name: string) => void
    endTour: (name: string, skipped?: boolean) => void
    isTourComplete: (name: string) => boolean
    // Register a setup function to run before (or when retrying) a step.
    // key = the data-tour attribute value of the step's target element.
    // The fn may return a Promise — TourProvider waits for it before resuming.
    registerStepSetup: (key: string, fn: () => Promise<void> | void) => void
    unregisterStepSetup: (key: string) => void
}

export const TourContext = createContext<TourContextValue>({
    toursCompleted: {},
    isOnboarded: false,
    businessId: '',
    startTour: () => {},
    endTour: () => {},
    isTourComplete: () => false,
    registerStepSetup: () => {},
    unregisterStepSetup: () => {},
})

interface TourProviderProps {
    children: React.ReactNode
    toursCompleted: Record<string, boolean>
    businessId: string
    isOnboarded: boolean
}

export function TourProvider({ children, toursCompleted: initial, businessId, isOnboarded }: TourProviderProps) {
    const [toursCompleted, setToursCompleted] = useState<Record<string, boolean>>(initial)
    const [run, setRun] = useState(false)
    const [steps, setSteps] = useState<Step[]>([])
    const [stepIndex, setStepIndex] = useState(0)

    // Refs: avoid stale closures in event callbacks
    const activeTourRef = useRef<string | null>(null)
    const stepsRef = useRef<Step[]>([])
    const setupRegistry = useRef<Map<string, () => Promise<void> | void>>(new Map())

    const isTourComplete = useCallback((name: string) => {
        return !!(toursCompleted?.[name])
    }, [toursCompleted])

    const registerStepSetup = useCallback((key: string, fn: () => Promise<void> | void) => {
        setupRegistry.current.set(key, fn)
    }, [])

    const unregisterStepSetup = useCallback((key: string) => {
        setupRegistry.current.delete(key)
    }, [])

    const startTour = useCallback((name: string) => {
        const tourSteps = TOUR_STEPS[name]
        if (!tourSteps || tourSteps.length === 0) return
        setRun(false)
        setTimeout(() => {
            activeTourRef.current = name
            stepsRef.current = tourSteps
            setSteps(tourSteps)
            setStepIndex(0)
            setRun(true)
        }, 50)
    }, [])

    const endTour = useCallback((name: string, skipped = false) => {
        setRun(false)
        setStepIndex(0)
        activeTourRef.current = null
        setToursCompleted(prev => ({ ...prev, [name]: true }))
        markTourComplete(businessId, name).catch(() => {})
        if (!skipped && name === 'dashboard') {
            const allOthers = Object.keys(TOUR_STEPS).filter(k => k !== 'dashboard')
            const noneComplete = allOthers.every(k => !toursCompleted[k])
            if (noneComplete) {
                toast('Dashboard tour complete. Explore the rest from Help anytime.', {
                    duration: 4000,
                    position: 'bottom-right',
                })
            }
        }
    }, [businessId, toursCompleted])

    // Pause Joyride, run the setup fn, then resume after the DOM has settled.
    const runSetupAndResume = useCallback((fn: () => Promise<void> | void, nextIndex?: number) => {
        setRun(false)
        if (nextIndex !== undefined) setStepIndex(nextIndex)
        Promise.resolve(fn()).then(() => {
            // Two frames + 400ms lets React re-render and animations complete
            setTimeout(() => setRun(true), 400)
        })
    }, [])

    const handleEvent = useCallback((data: EventData) => {
        const { action, index, status, type } = data
        const active = activeTourRef.current
        if (!active) return

        // Terminal states
        if (status === STATUS.FINISHED) {
            endTour(active, false)
            return
        }
        if (status === STATUS.SKIPPED) {
            endTour(active, true)
            return
        }

        // Target element not found in DOM — the step requires a modal/panel to be open first.
        if (type === EVENTS.TARGET_NOT_FOUND) {
            const key = extractTourKey(data.step?.target as string)
            const setupFn = key ? setupRegistry.current.get(key) : undefined

            if (setupFn) {
                // Setup fn registered: pause → open required UI → resume at same step so Joyride retries
                runSetupAndResume(setupFn)
            } else {
                // No setup fn: skip this step entirely
                setStepIndex(prev => prev + 1)
            }
            return
        }

        if (type === EVENTS.STEP_AFTER) {
            if (action === ACTIONS.NEXT || action === ACTIONS.START) {
                const nextIndex = index + 1
                const nextStep = stepsRef.current[nextIndex]

                if (nextStep) {
                    const key = extractTourKey(nextStep.target as string)
                    const setupFn = key ? setupRegistry.current.get(key) : undefined

                    if (setupFn) {
                        // Proactively run setup before showing the next step —
                        // handles collapsed sections, inactive tabs, etc. even when
                        // the target wrapper is technically in the DOM.
                        runSetupAndResume(setupFn, nextIndex)
                        return
                    }
                }

                setStepIndex(nextIndex)

            } else if (action === ACTIONS.PREV) {
                setStepIndex(prev => Math.max(0, prev - 1))

            } else if (action === ACTIONS.CLOSE || action === ACTIONS.SKIP) {
                endTour(active, true)
            }
        }
    }, [endTour, runSetupAndResume])

    return (
        <TourContext.Provider value={{
            toursCompleted,
            isOnboarded,
            businessId,
            startTour,
            endTour,
            isTourComplete,
            registerStepSetup,
            unregisterStepSetup,
        }}>
            {children}
            <Joyride
                run={run}
                steps={steps}
                stepIndex={stepIndex}
                continuous={true}
                tooltipComponent={TourTooltip}
                scrollToFirstStep={true}
                onEvent={handleEvent}
                options={{
                    overlayColor: 'rgba(15,14,14,0.5)',
                    zIndex: 10000,
                    spotlightPadding: 6,
                    skipBeacon: true,
                    primaryColor: '#FC6161',
                    scrollOffset: 80,
                }}
            />
        </TourContext.Provider>
    )
}
