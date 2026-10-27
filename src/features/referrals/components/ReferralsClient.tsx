'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, Copy, Loader2, Mail, Search } from 'lucide-react'
import { PlanGateCard } from '@/components/dashboard/PlanGate'
import {
    describeOffer, referralProgramProblems, type ReferralProgram, type Recipients,
} from '../referrals'
import {
    emailReferralLinkAction, getReferralLinkAction, saveReferralProgram,
    type ReferralOverview,
} from '../server/actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const B = { bg: '#FAF7F2', card: '#FFFFFF', border: '#E8E2D6', ink: '#1A1818', warm: '#6F6863', dark: '#0F0E0E', gold: '#C9974A', coral: '#FC6161', green: '#15803D' }
const money = (cents: number) => `${cents < 0 ? '−' : ''}$${(Math.abs(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const EXPIRY_OPTIONS: { label: string; value: number | null }[] = [
    { label: '30 days', value: 30 }, { label: '90 days', value: 90 }, { label: '6 months', value: 180 },
    { label: '1 year', value: 365 }, { label: 'Never', value: null },
]

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <section className={`rounded-2xl p-4 sm:p-6 ${className}`} style={{ backgroundColor: B.card, border: `1px solid ${B.border}` }}>{children}</section>
}

function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
    return (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
            {options.map(o => (
                <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={value === o.value}
                    onClick={() => onChange(o.value)}
                    className="min-h-11 rounded-full px-4 text-sm font-medium"
                    style={value === o.value ? { backgroundColor: B.dark, color: '#FFFFFF' } : { border: `1px solid ${B.border}`, color: B.ink }}
                >
                    {o.label}
                </button>
            ))}
        </div>
    )
}

function ProgramCard({ initial }: { initial: ReferralProgram }) {
    const [p, setP] = useState(initial)
    const [saving, setSaving] = useState(false)
    const set = (patch: Partial<ReferralProgram>) => setP(prev => ({ ...prev, ...patch }))
    const problems = referralProgramProblems(p)
    const dollarsValue = p.rewardType === 'amount_off' ? (p.rewardValue / 100).toString() : String(p.rewardValue)

    const save = async (next = p) => {
        setSaving(true)
        const res = await saveReferralProgram(next)
        setSaving(false)
        if (!res.ok) return toast.error(res.error)
        setP(res.program)
        toast.success(res.program.enabled ? 'Referral program saved' : 'Referral program paused')
    }

    return (
        <Card>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg" style={{ fontFamily: SERIF, color: B.ink }}>Your referral program</h2>
                    <p className="mt-1 text-sm" style={{ color: B.warm }}>
                        Clients share a personal link. When someone new books through it and comes in, rewards go out automatically.
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={p.enabled}
                    aria-label="Referral program on"
                    onClick={() => { const next = { ...p, enabled: !p.enabled }; setP(next); if (!referralProgramProblems(next).length) save(next) }}
                    className="relative h-8 w-14 shrink-0 rounded-full transition-colors"
                    style={{ backgroundColor: p.enabled ? B.green : B.border }}
                >
                    <span className="absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all" style={{ left: p.enabled ? 28 : 4 }} />
                </button>
            </div>

            <div className="mt-5 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold" style={{ color: B.ink }}>Reward</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <Choice label="Reward type" value={p.rewardType} onChange={rewardType => set({ rewardType, rewardValue: rewardType === 'amount_off' ? 1000 : 10 })}
                            options={[{ value: 'amount_off', label: '$ off' }, { value: 'percent_off', label: '% off' }]} />
                        <label className="flex h-11 items-center gap-1 rounded-xl px-3" style={{ border: `1px solid ${B.border}` }}>
                            {p.rewardType === 'amount_off' && <span style={{ color: B.warm }}>$</span>}
                            <input
                                type="number"
                                inputMode="decimal"
                                min={1}
                                value={dollarsValue}
                                onChange={e => {
                                    const n = parseFloat(e.target.value)
                                    set({ rewardValue: Number.isFinite(n) ? Math.round(p.rewardType === 'amount_off' ? n * 100 : n) : 0 })
                                }}
                                className="w-20 bg-transparent text-base outline-none"
                                aria-label="Reward amount"
                            />
                            {p.rewardType === 'percent_off' && <span style={{ color: B.warm }}>%</span>}
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold" style={{ color: B.ink }}>Who gets it</p>
                    <Choice<Recipients> label="Who gets the reward" value={p.recipients} onChange={recipients => set({ recipients })}
                        options={[{ value: 'both', label: 'Both' }, { value: 'referrer', label: 'Client who shared' }, { value: 'friend', label: 'New friend' }]} />
                    <p className="text-xs" style={{ color: B.warm }}>
                        The friend&apos;s reward comes off their first booking. The client who shared gets a code by email once the friend&apos;s visit is completed.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold" style={{ color: B.ink }}>Codes last</span>
                        <select
                            value={p.rewardExpiryDays ?? 'never'}
                            onChange={e => set({ rewardExpiryDays: e.target.value === 'never' ? null : Number(e.target.value) })}
                            className="h-11 rounded-xl px-3 text-base sm:text-sm"
                            style={{ border: `1px solid ${B.border}`, backgroundColor: B.card }}
                        >
                            {EXPIRY_OPTIONS.map(o => <option key={o.label} value={o.value ?? 'never'}>{o.label}</option>)}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold" style={{ color: B.ink }}>Rewards per client</span>
                        <select
                            value={p.maxRewardsPerReferrer ?? 'none'}
                            onChange={e => set({ maxRewardsPerReferrer: e.target.value === 'none' ? null : Number(e.target.value) })}
                            className="h-11 rounded-xl px-3 text-base sm:text-sm"
                            style={{ border: `1px solid ${B.border}`, backgroundColor: B.card }}
                        >
                            <option value="none">No limit</option>
                            {[1, 3, 5, 10, 20].map(n => <option key={n} value={n}>Up to {n}</option>)}
                        </select>
                    </label>
                </div>

                <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: B.bg, color: B.ink }}>
                    Clients will see: <strong>{p.rewardValue > 0 ? describeOffer(p) : '…'}</strong>. New clients only, one referral per person.
                </div>

                {problems.length > 0 && <p className="text-xs" style={{ color: '#DC2626' }}>{problems[0]}</p>}
                <button
                    type="button"
                    onClick={() => save()}
                    disabled={saving || problems.length > 0}
                    className="flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold disabled:opacity-50 sm:self-start sm:px-8"
                    style={{ backgroundColor: B.dark, color: '#FFFFFF' }}
                >
                    {saving && <Loader2 size={14} className="animate-spin" />} Save
                </button>
            </div>
        </Card>
    )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="rounded-xl p-3 sm:p-4" style={{ backgroundColor: B.bg }}>
            <p className="text-xs" style={{ color: B.warm }}>{label}</p>
            <p className="mt-1 text-xl sm:text-2xl" style={{ fontFamily: SERIF, color: B.ink }}>{value}</p>
            {hint && <p className="text-[11px]" style={{ color: B.warm }}>{hint}</p>}
        </div>
    )
}

function ShareLinks({ clients, enabled }: { clients: ReferralOverview['clients']; enabled: boolean }) {
    const [query, setQuery] = useState('')
    const [busy, setBusy] = useState<string | null>(null)
    const [copied, setCopied] = useState<string | null>(null)
    const shown = useMemo(() => {
        const q = query.trim().toLowerCase()
        return (q ? clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) : clients).slice(0, 30)
    }, [clients, query])

    const copy = async (clientId: string) => {
        setBusy(`copy-${clientId}`)
        const res = await getReferralLinkAction(clientId)
        setBusy(null)
        if (!res.ok) return toast.error(res.error)
        try {
            await navigator.clipboard.writeText(res.link.shareUrl)
            setCopied(clientId)
            setTimeout(() => setCopied(null), 2000)
            toast.success('Link copied. Send it to your client.')
        } catch {
            toast.message(res.link.shareUrl)
        }
    }
    const email = async (clientId: string) => {
        setBusy(`email-${clientId}`)
        const res = await emailReferralLinkAction(clientId)
        setBusy(null)
        if (!res.ok) return toast.error(res.error)
        toast.success('Sent! They can share their link from that email.')
    }

    return (
        <Card>
            <h2 className="text-lg" style={{ fontFamily: SERIF, color: B.ink }}>Send clients their link</h2>
            <p className="mt-1 text-sm" style={{ color: B.warm }}>Each client gets their own link. Email it, or copy it to text or DM.</p>
            <label className="mt-4 flex h-11 items-center gap-2 rounded-xl px-3" style={{ border: `1px solid ${B.border}` }}>
                <Search size={15} color={B.warm} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clients" className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm" />
            </label>
            {clients.length === 0 ? (
                <p className="mt-4 text-sm" style={{ color: B.warm }}>Your clients appear here once they&apos;ve booked or been added.</p>
            ) : (
                <ul className="mt-3 flex flex-col">
                    {shown.map(c => (
                        <li key={c.clientId} className="flex items-center gap-3 py-3" style={{ borderTop: `1px solid ${B.border}` }}>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium" style={{ color: B.ink }}>{c.name}</p>
                                <p className="truncate text-xs" style={{ color: B.warm }}>
                                    {c.code ? c.code : 'No link yet'}{c.completedReferrals ? ` · ${c.completedReferrals} referral${c.completedReferrals === 1 ? '' : 's'}` : ''}
                                </p>
                            </div>
                            <button type="button" onClick={() => copy(c.clientId)} disabled={!!busy} aria-label={`Copy ${c.name}'s link`}
                                className="flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-50" style={{ border: `1px solid ${B.border}` }}>
                                {busy === `copy-${c.clientId}` ? <Loader2 size={15} className="animate-spin" /> : copied === c.clientId ? <Check size={15} /> : <Copy size={15} />}
                            </button>
                            <button type="button" onClick={() => email(c.clientId)} disabled={!!busy || !enabled || !c.email} aria-label={`Email ${c.name} their link`}
                                className="flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40" style={{ backgroundColor: B.dark, color: '#FFFFFF' }}>
                                {busy === `email-${c.clientId}` ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {!enabled && clients.length > 0 && <p className="mt-2 text-xs" style={{ color: B.warm }}>Turn on your program to email links.</p>}
        </Card>
    )
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
    booked: { label: 'Booked', color: '#B45309', bg: 'rgba(245,158,11,.12)' },
    completed: { label: 'Came in', color: B.green, bg: 'rgba(34,197,94,.12)' },
    void: { label: 'Didn’t count', color: B.warm, bg: B.bg },
}

export default function ReferralsClient({ overview, gatable }: { overview: ReferralOverview; gatable: { hadTrial?: boolean; stripeCustomerId?: string | null; businessId?: string } }) {
    const s = overview.stats
    if (!overview.allowed) {
        return (
            <div className="mx-auto max-w-md px-4 py-10">
                <PlanGateCard featureName="Referrals" description="Turn happy clients into new bookings: give them a personal link, and reward them when friends come in. Available on Growth." businessData={gatable} />
            </div>
        )
    }
    return (
        <div className="min-h-screen px-4 pb-16 pt-6 sm:px-6" style={{ backgroundColor: B.bg }}>
            <div className="mx-auto flex max-w-5xl flex-col gap-5">
                <header>
                    <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: SERIF, color: B.ink }}>Referrals</h1>
                    <p className="mt-1 text-sm" style={{ color: B.warm }}>New clients from the clients you already have.</p>
                </header>

                <ProgramCard initial={overview.program} />

                <Card>
                    <h2 className="text-lg" style={{ fontFamily: SERIF, color: B.ink }}>How it&apos;s going</h2>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                        <Stat label="Referred clients" value={String(s.referredClients)} />
                        <Stat label="Referred bookings" value={String(s.referredBookings)} />
                        <Stat label="Came in" value={String(s.completedReferrals)} hint={`${Math.round(s.conversionRate * 100)}% of bookings`} />
                        <Stat label="Revenue" value={money(s.revenueCents)} hint="From referred visits" />
                        <Stat label="Rewards earned" value={String(s.rewardsEarned)} />
                        <Stat label="Rewards used" value={String(s.rewardsRedeemed)} />
                        <Stat label="Discounts given" value={money(s.redeemedValueCents)} />
                        <Stat label="Net" value={money(s.roiCents)} hint="Revenue minus discounts" />
                    </div>
                    {s.topReferrers.length > 0 && (
                        <div className="mt-5">
                            <p className="text-sm font-semibold" style={{ color: B.ink }}>Top referrers</p>
                            <ol className="mt-2 flex flex-col">
                                {s.topReferrers.map((t, i) => (
                                    <li key={t.clientId} className="flex items-center justify-between gap-3 py-2 text-sm" style={{ borderTop: i ? `1px solid ${B.border}` : undefined }}>
                                        <span className="min-w-0 truncate" style={{ color: B.ink }}>{i + 1}. {t.name}</span>
                                        <span className="shrink-0" style={{ color: B.warm }}>{t.completed} friend{t.completed === 1 ? '' : 's'} · {money(t.revenueCents)}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </Card>

                <div className="grid gap-5 lg:grid-cols-2">
                    <ShareLinks clients={overview.clients} enabled={overview.program.enabled} />
                    <Card>
                        <h2 className="text-lg" style={{ fontFamily: SERIF, color: B.ink }}>Recent referrals</h2>
                        {overview.referrals.length === 0 ? (
                            <p className="mt-2 text-sm" style={{ color: B.warm }}>No referrals yet. Send a few clients their link to get started.</p>
                        ) : (
                            <ul className="mt-3 flex flex-col">
                                {overview.referrals.map(r => {
                                    const st = STATUS_STYLE[r.status]
                                    return (
                                        <li key={r.id} className="flex items-center gap-3 py-3" style={{ borderTop: `1px solid ${B.border}` }}>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm" style={{ color: B.ink }}><strong>{r.referredName}</strong> via {r.referrerName}</p>
                                                <p className="text-xs" style={{ color: B.warm }}>
                                                    {r.appointmentStart ? new Date(r.appointmentStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                                                    {r.friendDiscountCents ? ` · ${money(r.friendDiscountCents)} off` : ''}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
