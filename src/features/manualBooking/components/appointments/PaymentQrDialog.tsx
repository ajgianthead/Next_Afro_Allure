'use client'

import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { getPaymentQrAction } from '../../server'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
/** How often the open QR checks whether the client has paid. */
const POLL_MS = 4000

const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

type QrState =
    | { kind: 'loading' }
    | { kind: 'ready'; url: string; amountCents: number }
    | { kind: 'paid' }
    | { kind: 'error'; message: string }

interface Props {
    appointmentId: string
    clientName: string
    open: boolean
    onClose: () => void
    /** The client paid while the QR was open. */
    onPaid: () => void
}

/** A large QR the business shows a client in person; it switches to "Paid" once the client pays. */
export function PaymentQrDialog({ appointmentId, clientName, open, onClose, onPaid }: Props) {
    const [state, setState] = useState<QrState>({ kind: 'loading' })

    useEffect(() => {
        if (!open) return
        let stopped = false
        let timer: ReturnType<typeof setTimeout> | undefined
        setState({ kind: 'loading' })

        const check = async (first: boolean) => {
            const res = await getPaymentQrAction(appointmentId)
            if (stopped) return
            if (!res.ok) {
                // A failed background check keeps the code on screen; only the first load shows the error.
                if (first) setState({ kind: 'error', message: res.error })
                else timer = setTimeout(() => check(false), POLL_MS)
                return
            }
            if (res.data.paid) {
                setState({ kind: 'paid' })
                onPaid()
                return
            }
            setState({ kind: 'ready', url: res.data.url, amountCents: res.data.amountCents })
            timer = setTimeout(() => check(false), POLL_MS)
        }
        check(true)

        return () => {
            stopped = true
            if (timer) clearTimeout(timer)
        }
        // onPaid is a fresh closure each render; polling restarts only when the dialog opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, appointmentId])

    return (
        <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
            <DialogContent className="sm:max-w-sm" style={{ backgroundColor: '#FFFFFF' }}>
                <DialogTitle style={{ fontFamily: SERIF, color: '#1A1818' }}>Scan to pay</DialogTitle>
                <DialogDescription style={{ color: '#6F6863' }}>
                    {clientName ? `Show this to ${clientName}. ` : ''}They scan it with their phone camera to pay by card.
                </DialogDescription>

                <div className="flex flex-col items-center gap-4 pt-2 pb-1">
                    {state.kind === 'loading' && (
                        <div className="flex items-center justify-center" style={{ height: 260 }}>
                            <Loader2 size={24} className="animate-spin" style={{ color: '#6F6863' }} />
                        </div>
                    )}

                    {state.kind === 'ready' && (
                        <>
                            <p className="text-3xl font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                                {fmt(state.amountCents)}
                            </p>
                            {/* White quiet zone around the code so phone cameras pick it up reliably. */}
                            <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}>
                                <QRCode value={state.url} size={240} level="M" style={{ display: 'block', width: '100%', maxWidth: 240, height: 'auto' }} />
                            </div>
                            <p className="flex items-center gap-1.5 text-xs" style={{ color: '#6F6863' }}>
                                <Loader2 size={11} className="animate-spin" /> Waiting for payment…
                            </p>
                            <p className="text-[11px] break-all text-center" style={{ color: '#9A9088' }}>{state.url}</p>
                        </>
                    )}

                    {state.kind === 'paid' && (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CheckCircle2 size={44} style={{ color: '#16a34a' }} />
                            <p className="text-lg font-semibold" style={{ color: '#1A1818' }}>Paid</p>
                            <p className="text-sm" style={{ color: '#6F6863' }}>This appointment is paid in full.</p>
                        </div>
                    )}

                    {state.kind === 'error' && (
                        <p className="text-sm text-center py-8" style={{ color: '#DC2626' }}>{state.message}</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
