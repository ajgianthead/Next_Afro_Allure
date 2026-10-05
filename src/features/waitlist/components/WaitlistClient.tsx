'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TIME_OF_DAY_LABELS, type WaitlistEntry } from '../waitlist'
import { setWaitlistEnabled, setWaitlistStatus } from '../server/actions'

const C = { text: '#1A1818', muted: '#6F6863', border: '#E8E2D6', bg: '#FAF7F2', card: '#FFFFFF' }

const range = (from: string, to: string) => {
    const a = DateTime.fromISO(from)
    const b = DateTime.fromISO(to)
    return from === to ? a.toFormat('ccc, LLL d') : `${a.toFormat('LLL d')} – ${b.toFormat('LLL d')}`
}

export default function WaitlistClient({ enabled: initialEnabled, entries: initialEntries, bookingLink }: {
    enabled: boolean
    entries: WaitlistEntry[]
    bookingLink: string
}) {
    const [enabled, setEnabled] = useState(initialEnabled)
    const [entries, setEntries] = useState(initialEntries)
    const [busy, setBusy] = useState<string | null>(null)

    const toggle = async () => {
        setBusy('toggle')
        const res = await setWaitlistEnabled(!enabled)
        setBusy(null)
        if (!res.ok) { toast.error(res.error); return }
        setEnabled(!enabled)
        toast.success(!enabled ? 'Waitlist turned on' : 'Waitlist turned off')
    }

    const resolve = async (id: string, status: 'booked' | 'removed') => {
        setBusy(id)
        const res = await setWaitlistStatus(id, status)
        setBusy(null)
        if (!res.ok) { toast.error(res.error); return }
        setEntries(list => list.filter(e => e.id !== id))
    }

    return (
        <div className="px-4 sm:px-6 pb-16">
            <div className="w-full mt-5 flex justify-between items-start gap-4 flex-wrap">
                <div>
                    <h2 className="text-lg font-semibold">Waitlist</h2>
                    <p className="text-sm max-w-xl" style={{ color: C.muted }}>
                        Clients who couldn&apos;t find a time can join from your booking page. When an appointment is cancelled,
                        the first few whose dates fit get an email with a link to book it.
                    </p>
                </div>
                <Button variant={enabled ? 'outline' : 'default'} disabled={busy === 'toggle'} onClick={toggle}>
                    {busy === 'toggle' ? <Loader2 className="size-4 animate-spin" /> : enabled ? 'Turn off' : 'Turn on'}
                </Button>
            </div>
            <Separator className="my-3" />

            {!enabled && (
                <p className="text-sm rounded-lg px-3 py-2 mb-3" style={{ backgroundColor: C.bg, color: C.muted }}>
                    The waitlist is off — clients won&apos;t see the option on your booking page and nobody is emailed about cancellations.
                </p>
            )}

            <div className="rounded-xl" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                {entries.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                        <p className="text-sm" style={{ color: C.text }}>No one is waiting right now.</p>
                        <p className="text-xs mt-1" style={{ color: C.muted }}>
                            Clients see &ldquo;Join the waitlist&rdquo; when they pick a date on <span className="underline">{bookingLink}</span>.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y">
                        {entries.map(e => (
                            <div key={e.id} className="flex items-start gap-3 p-4 flex-wrap sm:flex-nowrap">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium" style={{ color: C.text }}>{e.firstName} {e.lastName}</p>
                                    <p className="text-xs truncate" style={{ color: C.muted }}>{[e.email, e.phone].filter(Boolean).join(' · ')}</p>
                                    {e.note && <p className="text-xs mt-1" style={{ color: C.text }}>&ldquo;{e.note}&rdquo;</p>}
                                </div>
                                <div className="text-xs sm:text-right" style={{ color: C.text }}>
                                    <p className="font-medium">{range(e.fromDate, e.toDate)}</p>
                                    <p style={{ color: C.muted }}>{TIME_OF_DAY_LABELS[e.timeOfDay]}{e.serviceName ? ` · ${e.serviceName}` : ''}</p>
                                    {e.notifiedCount > 0 && (
                                        <p style={{ color: C.muted }}>Emailed about {e.notifiedCount} opening{e.notifiedCount === 1 ? '' : 's'}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" disabled={busy === e.id} onClick={() => resolve(e.id, 'booked')}>Booked</Button>
                                    <Button size="sm" variant="ghost" disabled={busy === e.id} onClick={() => resolve(e.id, 'removed')}>Remove</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
