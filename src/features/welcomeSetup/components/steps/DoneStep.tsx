'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { IconConfetti } from '@tabler/icons-react'
import { bookingUrl } from '@/lib/bookingUrl'
import type { BookedAppointment } from './FirstAppointmentStep'
import { BRAND, StepHeader } from '../shared'

export function DoneStep({ urlName, booked }: { urlName: string; booked: BookedAppointment | null }) {
    const [copied, setCopied] = useState(false)
    // The booking page works before the site is designed or published.
    const link = urlName ? bookingUrl(urlName, '/book') : ''

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard can be blocked; the link is still shown to copy by hand.
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <StepHeader icon={IconConfetti} eyebrow="All set" title="You're ready to take bookings">
                {booked
                    ? `${booked.clientName} is booked for ${booked.serviceName} on ${booked.when}. They'll get a confirmation email.`
                    : 'Your services, hours and policies are saved.'}
            </StepHeader>

            {link && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium" style={{ color: BRAND.warm }}>
                        Share your booking link in your bio and DMs. Clients can book you right now.
                    </p>
                    <div
                        className="flex items-center gap-2 rounded-xl pl-3 pr-1.5 py-1.5"
                        style={{ border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.cream }}
                    >
                        <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 flex-1 truncate text-sm underline-offset-2 hover:underline"
                            style={{ color: BRAND.ink }}
                        >
                            {link.replace(/^https?:\/\//, '')}
                        </a>
                        <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Open booking page"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{ color: BRAND.warm }}
                        >
                            <ExternalLink size={15} />
                        </a>
                        <button
                            type="button"
                            onClick={copy}
                            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium"
                            style={{ backgroundColor: BRAND.dark, color: '#FFFFFF' }}
                        >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}

            <ul className="flex flex-col gap-2 text-sm" style={{ color: BRAND.ink }}>
                {[
                    'Design your booking site in Booking Site',
                    'Connect payments in Monetization to take deposits',
                    'Turn on reminders in Notifications to cut no-shows',
                ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                        <Check size={15} className="mt-0.5 shrink-0" color={BRAND.gold} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}
