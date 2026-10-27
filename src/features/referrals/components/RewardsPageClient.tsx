'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import type { RewardsPageData } from '../server/loadRewardsPage'

const SERIF = 'var(--font-fraunces, "Fraunces", Georgia, serif)'
const C = { bg: '#FAF7F2', card: '#FFFFFF', ink: '#1A1818', warm: '#6F6863', border: '#E8E2D6', dark: '#0F0E0E', gold: '#C9974A' }

function CopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            type="button"
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(text)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                } catch { /* clipboard blocked: the text is on screen to copy */ }
            }}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold"
            style={{ backgroundColor: C.dark, color: '#FFFFFF' }}
            aria-label={label}
        >
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}
        </button>
    )
}

/** A client's rewards and referral link at one business (opened from their email). */
export function RewardsPageClient({ data }: { data: RewardsPageData }) {
    // Known only in the browser; checked after load so server and client render the same.
    const [canShare, setCanShare] = useState(false)
    useEffect(() => { setCanShare(typeof navigator.share === 'function') }, [])
    return (
        <main className="min-h-dvh px-4 py-8 sm:py-12" style={{ backgroundColor: C.bg, color: C.ink }}>
            <div className="mx-auto flex max-w-md flex-col gap-5">
                <header>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: C.gold }}>{data.businessName}</p>
                    <h1 className="mt-2 text-3xl leading-tight" style={{ fontFamily: SERIF }}>Hi {data.clientFirstName}, here are your rewards</h1>
                </header>

                <section className="rounded-2xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                    <h2 className="text-sm font-semibold">Ready to use</h2>
                    {data.rewards.length ? (
                        <ul className="mt-3 flex flex-col gap-3">
                            {data.rewards.map(r => (
                                <li key={r.code} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ border: `1px dashed ${C.border}`, backgroundColor: C.bg }}>
                                    <div className="min-w-0">
                                        <p className="text-base font-semibold">{r.text}</p>
                                        <p className="font-mono text-lg tracking-widest">{r.code}</p>
                                        <p className="text-xs" style={{ color: C.warm }}>
                                            {r.source === 'referral' ? 'For referring a friend' : 'Loyalty reward'}{r.expiresOn ? ` · use by ${r.expiresOn}` : ''}
                                        </p>
                                    </div>
                                    <CopyButton text={r.code} label={`Copy code ${r.code}`} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-sm" style={{ color: C.warm }}>No rewards yet. Share your link below to earn one.</p>
                    )}
                    {data.rewards.length > 0 && (
                        <p className="mt-3 text-xs leading-relaxed" style={{ color: C.warm }}>
                            Enter your code when you book online, or give it to {data.businessName} at your appointment. One code per appointment.
                        </p>
                    )}
                    <a href={data.bookUrl} className="mt-4 flex h-11 items-center justify-center rounded-full text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.ink }}>
                        Book an appointment
                    </a>
                </section>

                {data.programOn && (
                    <section className="rounded-2xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                        <h2 className="text-lg" style={{ fontFamily: SERIF }}>{data.offer}</h2>
                        <p className="mt-1 text-sm leading-relaxed" style={{ color: C.warm }}>
                            Share your link. When a friend new to {data.businessName} books through it and comes in, you&apos;ll get an email with your reward.
                        </p>
                        <div className="mt-4 flex items-center gap-2 rounded-xl py-1.5 pl-3 pr-1.5" style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                            <span className="min-w-0 flex-1 truncate text-sm">{data.shareUrl.replace(/^https?:\/\//, '')}</span>
                            <CopyButton text={data.shareUrl} label="Copy your referral link" />
                        </div>
                        {canShare && (
                            <button
                                type="button"
                                onClick={() => navigator.share({ title: data.businessName, text: `${data.offer} at ${data.businessName}`, url: data.shareUrl }).catch(() => { })}
                                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold"
                                style={{ backgroundColor: C.dark, color: '#FFFFFF' }}
                            >
                                <Share2 size={15} /> Share
                            </button>
                        )}
                        {(data.completedReferrals > 0 || data.pendingReferrals > 0) && (
                            <p className="mt-4 text-sm" style={{ color: C.warm }}>
                                {data.completedReferrals} friend{data.completedReferrals === 1 ? '' : 's'} came in
                                {data.pendingReferrals > 0 ? ` · ${data.pendingReferrals} booked and coming up` : ''}
                            </p>
                        )}
                    </section>
                )}

                <p className="text-center text-xs" style={{ color: C.warm }}>Booking by AfroAllure · keep this link private, it shows your codes.</p>
            </div>
        </main>
    )
}
