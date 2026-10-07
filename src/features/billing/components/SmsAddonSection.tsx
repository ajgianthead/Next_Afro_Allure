'use client'

import { useEffect, useState } from 'react'
import { Loader2, Lock, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { dollars, SMS_MONTHLY_CENTS, SMS_MONTHLY_TEXTS, SMS_YEARLY_CENTS } from '../plans'
import { addSmsAddon, getSmsAddonStatus, removeSmsAddon, updateSmsSettings, type SmsAddonStatus } from '../server/smsActions'

const INK = '#1A1818'
const MUTED = '#6F6863'

/** Settings → Subscription: add or remove SMS Reminders, see usage, set the business's own number. */
export function SmsAddonSection({ onUpgrade }: { onUpgrade: () => void }) {
    const [status, setStatus] = useState<SmsAddonStatus | null>(null)
    const [busy, setBusy] = useState<'add' | 'remove' | 'save' | null>(null)
    const [phone, setPhone] = useState('')
    const [businessTexts, setBusinessTexts] = useState(true)
    const [confirmRemove, setConfirmRemove] = useState(false)

    const load = async () => {
        try {
            const s = await getSmsAddonStatus()
            setStatus(s)
            setPhone(s.smsPhone ?? '')
            setBusinessTexts(s.smsBusinessTexts)
        } catch {
            setStatus(null)
        }
    }
    useEffect(() => { load() }, [])

    const price = status?.interval === 'year' ? `${dollars(SMS_YEARLY_CENTS)}/yr` : `${dollars(SMS_MONTHLY_CENTS)}/mo`

    const handleAdd = async () => {
        setBusy('add')
        const res = await addSmsAddon().catch(() => ({ ok: false as const, error: 'Could not add SMS Reminders. Please try again.' }))
        if (res.ok) { toast.success('SMS Reminders added.'); await load() } else toast.error(res.error)
        setBusy(null)
    }

    const handleRemove = async () => {
        setBusy('remove')
        const res = await removeSmsAddon().catch(() => ({ ok: false as const, error: 'Could not remove SMS Reminders. Please try again.' }))
        if (res.ok) { toast.success('SMS Reminders removed.'); await load() } else toast.error(res.error)
        setBusy(null)
        setConfirmRemove(false)
    }

    const handleSave = async () => {
        setBusy('save')
        const res = await updateSmsSettings({ smsPhone: phone, smsBusinessTexts: businessTexts })
            .catch(() => ({ ok: false as const, error: 'Could not save. Please try again.' }))
        if (res.ok) { toast.success('Text settings saved.'); await load() } else toast.error(res.error)
        setBusy(null)
    }

    const used = status ? Math.min(status.sentThisMonth, status.limit) : 0
    const pct = status ? Math.round((used / status.limit) * 100) : 0

    return (
        <div className="py-5 flex flex-col gap-3 sm:flex-row sm:gap-8" style={{ borderTop: '1px solid #F0EBE3' }}>
            <div className="sm:w-48 shrink-0">
                <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: INK }}>
                    <MessageSquare size={14} /> SMS Reminders
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: MUTED }}>
                    Text your clients their booking confirmation, reminders and payment link, and get a text for each new booking.
                </p>
            </div>

            <div className="flex-1 flex flex-col gap-2.5">
                {!status ? (
                    <Loader2 size={14} className="animate-spin" style={{ color: MUTED }} />
                ) : status.enabled ? (
                    <>
                        <p className="text-xs" style={{ color: MUTED }}>
                            <strong style={{ color: INK }}>On</strong> · {price} · {SMS_MONTHLY_TEXTS} texts a month. Texts go to clients who agree when they book.
                        </p>
                        <div>
                            <div className="flex justify-between text-xs mb-1" style={{ color: MUTED }}>
                                <span>This month</span>
                                <span>{used} of {status.limit} texts</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F0EBE3' }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 90 ? '#FC6161' : '#0F0E0E' }} />
                            </div>
                            {used >= status.limit && (
                                <p className="text-xs mt-1" style={{ color: '#FC6161' }}>
                                    Limit reached. Reminders go out by email until next month.
                                </p>
                            )}
                        </div>

                        <label className="text-xs font-medium mt-1" style={{ color: INK }} htmlFor="sms-phone">Your mobile number</label>
                        <input
                            id="sms-phone"
                            type="tel"
                            placeholder="(404) 555-0123"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="text-sm px-3 py-2 rounded-xl outline-none"
                            style={{ border: '1px solid #E8E2D6', color: INK }}
                        />
                        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: INK }}>
                            <input type="checkbox" checked={businessTexts} onChange={e => setBusinessTexts(e.target.checked)} />
                            Text me about new bookings and upcoming appointments (these count toward the {SMS_MONTHLY_TEXTS})
                        </label>

                        <div className="flex gap-2 flex-wrap">
                            <Button onClick={handleSave} disabled={!!busy} className="rounded-xl px-4" style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}>
                                {busy === 'save' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                                Save
                            </Button>
                            {confirmRemove ? (
                                <>
                                    <Button onClick={handleRemove} disabled={!!busy} variant="outline" className="rounded-xl px-4" style={{ fontSize: '13px', color: '#FC6161' }}>
                                        {busy === 'remove' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                                        Yes, remove now
                                    </Button>
                                    <Button onClick={() => setConfirmRemove(false)} disabled={!!busy} variant="ghost" className="rounded-xl px-3" style={{ fontSize: '13px' }}>
                                        Keep it
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setConfirmRemove(true)} disabled={!!busy} variant="outline" className="rounded-xl px-4" style={{ fontSize: '13px' }}>
                                    Remove SMS Reminders
                                </Button>
                            )}
                        </div>
                        {confirmRemove && (
                            <p className="text-xs" style={{ color: MUTED }}>
                                Texts stop right away. The rest of this billing period isn&apos;t refunded.
                            </p>
                        )}
                    </>
                ) : status.reason === 'not_growth' ? (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'rgba(201,151,74,0.08)', border: '1px solid rgba(201,151,74,0.2)' }}>
                        <Lock size={13} className="shrink-0" style={{ color: '#C9974A' }} />
                        <p className="text-xs flex-1" style={{ color: MUTED }}>
                            SMS Reminders are a <strong style={{ color: INK }}>Growth plan</strong> add-on.
                        </p>
                        <button onClick={onUpgrade} className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: '#FC6161', color: 'white' }}>
                            Upgrade →
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-xs" style={{ color: MUTED }}>
                            {dollars(SMS_MONTHLY_CENTS)}/mo ({dollars(SMS_YEARLY_CENTS)}/yr on yearly Growth) for up to {SMS_MONTHLY_TEXTS} texts a month,
                            added to your Growth bill. Every text counts, to clients and to you.
                        </p>
                        {status.reason === 'trialing' && (
                            <p className="text-xs" style={{ color: MUTED }}>You can add SMS Reminders once your free trial ends.</p>
                        )}
                        {status.reason === 'no_subscription' && (
                            <p className="text-xs" style={{ color: MUTED }}>Subscribe to Growth to add SMS Reminders.</p>
                        )}
                        <div>
                            <Button onClick={handleAdd} disabled={!!busy || !status.canAdd} className="rounded-xl px-5" style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}>
                                {busy === 'add' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                                Add SMS Reminders · {price}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
