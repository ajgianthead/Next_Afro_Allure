'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, RotateCcw } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { useTour } from './useTour'
import { TOUR_DISPLAY_NAMES, TOUR_DESCRIPTIONS, TOUR_ROUTES, TOUR_STEPS } from './tourSteps'

const TOUR_ORDER = [
    'dashboard',
    'appointments',
    'services',
    'addons',
    'availability',
    'bookingSettings',
    'analytics',
    'monetization',
    'webBuilder',
    'webBuilderManage',
]

interface HelpSheetProps {
    open: boolean
    onClose: () => void
}

export function HelpSheet({ open, onClose }: HelpSheetProps) {
    const router = useRouter()
    const { toursCompleted, startTour } = useTour()

    const handleReplay = (tourName: string) => {
        onClose()
        const route = TOUR_ROUTES[tourName]
        router.push(route)
        setTimeout(() => {
            // Both booking-site tours share the same route but render different
            // components depending on whether the site is live. After navigation,
            // check which one is actually in the DOM and start the right tour.
            if (tourName === 'webBuilder' || tourName === 'webBuilderManage') {
                const siteIsLive = !!document.querySelector('[data-tour="builder-publish"]')
                startTour(siteIsLive ? 'webBuilderManage' : 'webBuilder')
                return
            }
            startTour(tourName)
        }, 1200)
    }

    const completedCount = TOUR_ORDER.filter(t => toursCompleted[t]).length

    return (
        <Sheet open={open} onOpenChange={o => { if (!o) onClose() }}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
                <div className="p-6 border-b" style={{ borderColor: '#E8E2D6' }}>
                    <SheetHeader>
                        <SheetTitle
                            style={{
                                fontFamily: 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)',
                                fontSize: 22,
                                color: '#1A1818',
                                fontWeight: 500,
                            }}
                        >
                            Help & Tours
                        </SheetTitle>
                        <SheetDescription style={{ color: '#6F6863', fontSize: 13, marginTop: 4 }}>
                            {completedCount} of {TOUR_ORDER.length} tours completed
                        </SheetDescription>
                    </SheetHeader>

                    {/* progress bar */}
                    <div className="mt-4 h-1.5 rounded-full" style={{ backgroundColor: '#E8E2D6' }}>
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${(completedCount / TOUR_ORDER.length) * 100}%`,
                                backgroundColor: '#FC6161',
                            }}
                        />
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-1">
                    {TOUR_ORDER.map((tourName) => {
                        const done = !!toursCompleted[tourName]
                        const stepCount = TOUR_STEPS[tourName]?.length ?? 0
                        return (
                            <div
                                key={tourName}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
                                style={{ backgroundColor: done ? '#FAF7F2' : 'transparent' }}
                            >
                                {done
                                    ? <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                                    : <Circle size={18} style={{ color: '#E8E2D6', flexShrink: 0 }} />
                                }
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium" style={{ color: '#1A1818' }}>
                                        {TOUR_DISPLAY_NAMES[tourName]}
                                    </p>
                                    <p className="text-xs mt-0.5 truncate" style={{ color: '#6F6863' }}>
                                        {TOUR_DESCRIPTIONS[tourName]}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleReplay(tourName)}
                                    className="shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-75"
                                    style={{
                                        border: '1.5px solid #FC6161',
                                        color: '#FC6161',
                                        backgroundColor: 'transparent',
                                    }}
                                >
                                    <RotateCcw size={11} />
                                    {done ? 'Replay' : 'Start'}
                                </button>
                            </div>
                        )
                    })}
                </div>

                <div className="mx-4 my-2 border-t pt-4" style={{ borderColor: '#E8E2D6' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6F6863' }}>Need more help?</p>
                    <a
                        href="mailto:support@afroallure.co"
                        className="text-xs font-medium hover:opacity-75"
                        style={{ color: '#FC6161' }}
                    >
                        support@afroallure.co
                    </a>
                </div>
            </SheetContent>
        </Sheet>
    )
}
