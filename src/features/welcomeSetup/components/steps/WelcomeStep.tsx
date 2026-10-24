'use client'

import { Check, PlayCircle } from 'lucide-react'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { BRAND, SERIF } from '../shared'

/**
 * Set this to the welcome video's embed URL (e.g. a YouTube/Vimeo/Loom
 * "embed" link) to replace the placeholder.
 */
const WELCOME_VIDEO_EMBED_URL: string | null = null

const SETUP_STEPS = [
    'Where clients meet you',
    'The hours you take bookings',
    'Your services and prices',
    'Your cancellation and booking rules',
    'Your first appointment (optional)',
]

export function WelcomeStep({ businessName }: { businessName: string }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="w-8 h-1 rounded-full" style={{ backgroundColor: BRAND.gold }} />
            <div>
                <DialogTitle style={{ fontFamily: SERIF, fontSize: 26, color: BRAND.ink, lineHeight: 1.2 }}>
                    Welcome to AfroAllure{businessName ? `, ${businessName}` : ''}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed" style={{ color: BRAND.warm }}>
                    Let&apos;s get you ready to take bookings. It takes about 3 minutes, and you can change
                    anything later.
                </DialogDescription>
            </div>
            <div
                className="relative w-full overflow-hidden rounded-xl"
                style={{ aspectRatio: '16 / 9', backgroundColor: BRAND.dark }}
            >
                {WELCOME_VIDEO_EMBED_URL ? (
                    <iframe
                        src={WELCOME_VIDEO_EMBED_URL}
                        title="Welcome to AfroAllure"
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                    />
                ) : (
                    // Placeholder until the welcome video is embedded (see WELCOME_VIDEO_EMBED_URL).
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <PlayCircle size={44} strokeWidth={1.25} color="rgba(255,255,255,0.85)" />
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Welcome video coming soon</p>
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: BRAND.warm }}>
                    You&apos;ll set up
                </p>
                <ul className="flex flex-col gap-2">
                    {SETUP_STEPS.map(step => (
                        <li key={step} className="flex items-start gap-2 text-sm" style={{ color: BRAND.ink }}>
                            <Check size={15} className="mt-0.5 shrink-0" color={BRAND.gold} />
                            {step}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
