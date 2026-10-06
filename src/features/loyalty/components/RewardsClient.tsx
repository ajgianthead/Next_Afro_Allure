'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Gift, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    describeEarning, describeRemaining, describeReward, programProblems,
    type LoyaltyProgram, type LoyaltyReward,
} from '../loyalty'
import {
    adjustLoyaltyProgress, getLoyaltyOverview, giveReward, saveLoyaltyProgram, voidReward,
    type LoyaltyMember, type LoyaltyOverview,
} from '../server/actions'

const C = { text: '#1A1818', muted: '#6F6863', border: '#E8E2D6', bg: '#FAF7F2', card: '#FFFFFF', dark: '#0F0E0E', green: '#16a34a', red: '#FC6161' }
const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`
const shortDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—')

export default function RewardsClient({ initial }: { initial: LoyaltyOverview }) {
    const [overview, setOverview] = useState(initial)
    const [query, setQuery] = useState('')

    const refresh = async () => {
        const res = await getLoyaltyOverview()
        if (res.ok) setOverview(res.overview)
    }

    const members = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return overview.members
        return overview.members.filter(m => `${m.name} ${m.email} ${m.phone}`.toLowerCase().includes(q))
    }, [overview.members, query])

    return (
        <div className="px-4 sm:px-6 pb-16">
            <div className="w-full mt-5 flex justify-between items-center gap-6">
                <div>
                    <h2 className="text-lg font-semibold">Rewards</h2>
                    <p className="text-sm" style={{ color: C.muted }}>Bring clients back with a loyalty card that fills itself in.</p>
                </div>
            </div>
            <Separator className="my-3" />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                <ProgramSettings
                    program={overview.program}
                    allowed={overview.allowed}
                    onSaved={program => setOverview(o => ({ ...o, program }))}
                    onAfterSave={refresh}
                />

                <div className="flex flex-col gap-4 min-w-0">
                    <Stats overview={overview} />

                    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <p className="font-semibold" style={{ color: C.text }}>Members</p>
                            <div className="relative w-full sm:w-64">
                                <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                                <Input className="pl-8" placeholder="Search clients" value={query} onChange={e => setQuery(e.target.value)} />
                            </div>
                        </div>
                        {overview.members.length === 0 ? (
                            <p className="text-sm py-8 text-center" style={{ color: C.muted }}>
                                {overview.program.enabled
                                    ? 'Clients show up here after their first completed visit.'
                                    : 'Turn on your rewards program and clients show up here after their next completed visit.'}
                            </p>
                        ) : members.length === 0 ? (
                            <p className="text-sm py-6 text-center" style={{ color: C.muted }}>No clients match “{query}”.</p>
                        ) : (
                            <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
                                {members.map(m => (
                                    <MemberRow key={m.clientId} member={m} program={overview.program} onChanged={refresh} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Settings ───────────────────────────────────────────────────────────────

function ProgramSettings({ program, allowed, onSaved, onAfterSave }: {
    program: LoyaltyProgram
    allowed: boolean
    onSaved: (p: LoyaltyProgram) => void
    onAfterSave: () => void
}) {
    const [draft, setDraft] = useState(program)
    const [saving, setSaving] = useState(false)
    const set = (patch: Partial<LoyaltyProgram>) => setDraft(d => ({ ...d, ...patch }))
    const dirty = JSON.stringify(draft) !== JSON.stringify(program)

    // Dollar inputs are edited as dollars; the program stores cents.
    const dollars = (cents: number) => String(Math.round(cents) / 100)
    const toCents = (v: string) => Math.round(Number(v || 0) * 100)
    const whole = (v: string) => (v === '' ? 0 : Math.floor(Number(v)))

    const save = async (next: LoyaltyProgram) => {
        const problems = programProblems(next)
        if (problems.length) { toast.error(problems[0]); return }
        setSaving(true)
        const res = await saveLoyaltyProgram(next)
        setSaving(false)
        if (!res.ok) { toast.error(res.error); return }
        setDraft(res.program)
        onSaved(res.program)
        toast.success(res.program.enabled ? 'Rewards saved' : 'Rewards turned off')
        onAfterSave()
    }

    return (
        <div className="rounded-xl p-4 flex flex-col gap-4 h-fit" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold" style={{ color: C.text }}>Your program</p>
                    <p className="text-sm" style={{ color: C.muted }}>
                        {draft.enabled ? `${describeReward(draft)} ${describeEarning(draft)}` : 'Off'}
                    </p>
                </div>
                <Button
                    size="sm"
                    variant={draft.enabled ? 'outline' : 'default'}
                    disabled={saving || (!allowed && !draft.enabled)}
                    onClick={() => save({ ...draft, enabled: !draft.enabled })}
                >
                    {saving ? <Loader2 className="size-4 animate-spin" /> : draft.enabled ? 'Turn off' : 'Turn on'}
                </Button>
            </div>
            {!allowed && (
                <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: C.bg, color: C.muted }}>
                    Rewards are part of the Growth plan.
                </p>
            )}

            <Field label="Clients earn rewards by">
                <Select value={draft.earnType} onValueChange={v => set({ earnType: v as LoyaltyProgram['earnType'] })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="visits">Visits — a punch card</SelectItem>
                        <SelectItem value="spend">Spending — every $X paid</SelectItem>
                    </SelectContent>
                </Select>
            </Field>

            {draft.earnType === 'visits' ? (
                <Field label="Visits for a reward" hint="Every completed appointment counts, paid in cash or online.">
                    <Input type="number" min={1} max={50} value={draft.visitsRequired || ''} onChange={e => set({ visitsRequired: whole(e.target.value) })} />
                </Field>
            ) : (
                <Field label="Spend for a reward ($)" hint="What clients pay you, deposits included, after refunds.">
                    <Input type="number" min={1} step="1" value={dollars(draft.spendThresholdCents)} onChange={e => set({ spendThresholdCents: toCents(e.target.value) })} />
                </Field>
            )}

            <div className="grid grid-cols-2 gap-3">
                <Field label="Reward">
                    <Select value={draft.rewardType} onValueChange={v => set({ rewardType: v as LoyaltyProgram['rewardType'], rewardValue: v === 'percent_off' ? 10 : 2000 })}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="amount_off">$ off</SelectItem>
                            <SelectItem value="percent_off">% off</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label={draft.rewardType === 'percent_off' ? 'Percent' : 'Amount ($)'}>
                    {draft.rewardType === 'percent_off' ? (
                        <Input type="number" min={1} max={100} value={draft.rewardValue || ''} onChange={e => set({ rewardValue: whole(e.target.value) })} />
                    ) : (
                        <Input type="number" min={1} step="1" value={dollars(draft.rewardValue)} onChange={e => set({ rewardValue: toCents(e.target.value) })} />
                    )}
                </Field>
            </div>

            <Field label="Rewards expire after">
                <Select
                    value={draft.rewardExpiryDays == null ? 'never' : String(draft.rewardExpiryDays)}
                    onValueChange={v => set({ rewardExpiryDays: v === 'never' ? null : Number(v) })}
                >
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {[30, 60, 90, 180, 365].map(d => (
                            <SelectItem key={d} value={String(d)}>{d === 365 ? '1 year' : `${d} days`}</SelectItem>
                        ))}
                        {draft.rewardExpiryDays != null && ![30, 60, 90, 180, 365].includes(draft.rewardExpiryDays) && (
                            <SelectItem value={String(draft.rewardExpiryDays)}>{draft.rewardExpiryDays} days</SelectItem>
                        )}
                        <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                </Select>
            </Field>

            {draft.earnType === 'visits' && (
                <div className="flex flex-col gap-2 rounded-lg p-3" style={{ backgroundColor: C.bg }}>
                    <label className="flex items-start gap-2 text-sm cursor-pointer" style={{ color: C.text }}>
                        <Checkbox className="mt-0.5" checked={draft.rebookBonusEnabled} onCheckedChange={v => set({ rebookBonusEnabled: v === true })} />
                        <span>
                            <span className="font-medium">Rebook bonus</span>
                            <span className="block text-xs" style={{ color: C.muted }}>
                                An extra visit when a client comes back on schedule — keeps maintenance appointments on track.
                            </span>
                        </span>
                    </label>
                    {draft.rebookBonusEnabled && (
                        <div className="flex items-center gap-2 text-sm pl-6" style={{ color: C.text }}>
                            <span>Within</span>
                            <Input className="w-20 h-8" type="number" min={1} max={365} value={draft.rebookWithinDays || ''} onChange={e => set({ rebookWithinDays: whole(e.target.value) })} />
                            <span>days of their last visit</span>
                        </div>
                    )}
                </div>
            )}

            {dirty && (
                <Button disabled={saving} onClick={() => save(draft)}>
                    {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save changes'}
                </Button>
            )}
            <p className="text-xs" style={{ color: C.muted }}>
                Clients get an email after each completed visit with their progress, and their code when they earn a reward.
                Changes apply going forward — rewards already earned keep their value.
            </p>
        </div>
    )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium" style={{ color: C.text }}>{label}</p>
            {children}
            {hint && <p className="text-xs" style={{ color: C.muted }}>{hint}</p>}
        </div>
    )
}

// ─── Stats ──────────────────────────────────────────────────────────────────

function Stats({ overview }: { overview: LoyaltyOverview }) {
    const s = overview.stats
    const items = [
        { label: 'Members', value: String(s.members) },
        { label: 'Repeat visits', value: String(s.returningVisits) },
        { label: 'Rewards earned', value: String(s.rewardsIssued) },
        { label: 'Redeemed', value: s.rewardsRedeemed ? `${s.rewardsRedeemed} · ${money(s.discountGivenCents)}` : '0' },
    ]
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {items.map(i => (
                <div key={i.label} className="rounded-xl p-3" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                    <p className="text-xs" style={{ color: C.muted }}>{i.label}</p>
                    <p className="text-lg font-semibold" style={{ color: C.text }}>{i.value}</p>
                </div>
            ))}
        </div>
    )
}

// ─── Members ────────────────────────────────────────────────────────────────

function MemberRow({ member, program, onChanged }: { member: LoyaltyMember; program: LoyaltyProgram; onChanged: () => void }) {
    const [open, setOpen] = useState(false)
    const [busy, setBusy] = useState<string | null>(null)
    const [amount, setAmount] = useState('')
    const available = member.rewards.filter(r => r.status === 'available')
    const spendProgram = program.earnType === 'spend'

    const run = async (key: string, fn: () => Promise<{ ok: boolean; error?: string }>, success: string) => {
        setBusy(key)
        const res = await fn()
        setBusy(null)
        if (!res.ok) { toast.error((res as any).error ?? 'Something went wrong'); return }
        toast.success(success)
        onChanged()
    }

    const adjust = (sign: 1 | -1) => {
        const n = spendProgram ? Math.round(Number(amount || 0)) : Math.round(Number(amount || 1))
        if (!n || n < 0) { toast.error(spendProgram ? 'Enter a dollar amount.' : 'Enter a number of visits.'); return }
        run(`adjust${sign}`, () => adjustLoyaltyProgress(member.clientId, sign * n, sign > 0 ? 'Added by business' : 'Removed by business'), 'Progress updated')
        setAmount('')
    }

    return (
        <div className="py-3">
            <button type="button" className="w-full flex items-center gap-3 text-left" onClick={() => setOpen(o => !o)}>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: C.text }}>{member.name}</p>
                    <p className="text-xs truncate" style={{ color: C.muted }}>
                        {member.visits} visit{member.visits === 1 ? '' : 's'} · last {shortDate(member.lastVisit)}
                    </p>
                </div>
                <div className="hidden sm:block w-40">
                    <ProgressBar fraction={member.progress.fraction} />
                    <p className="text-[11px] mt-1" style={{ color: C.muted }}>{describeRemaining(program, member.progress)} to go</p>
                </div>
                {available.length > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1" style={{ backgroundColor: '#ECFDF3', color: C.green }}>
                        <Gift className="size-3.5" /> {available.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="mt-3 flex flex-col gap-3 rounded-lg p-3" style={{ backgroundColor: C.bg }}>
                    <div className="sm:hidden">
                        <ProgressBar fraction={member.progress.fraction} />
                        <p className="text-[11px] mt-1" style={{ color: C.muted }}>{describeRemaining(program, member.progress)} to go</p>
                    </div>
                    <p className="text-xs" style={{ color: C.muted }}>
                        {[member.email, member.phone].filter(Boolean).join(' · ')}
                        {spendProgram ? ` · ${money(member.spendCents)} spent` : ''}
                    </p>

                    {member.rewards.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            {member.rewards.map(r => (
                                <RewardLine key={r.id} reward={r} busy={busy === r.id}
                                    onVoid={() => run(r.id, () => voidReward(r.id), 'Reward cancelled')} />
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            className="w-24 h-8 bg-white"
                            type="number"
                            min={1}
                            placeholder={spendProgram ? '$' : '1'}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        <Button size="sm" variant="outline" disabled={!!busy} onClick={() => adjust(1)}>
                            {busy === 'adjust1' ? <Loader2 className="size-4 animate-spin" /> : spendProgram ? 'Add $' : 'Add visits'}
                        </Button>
                        <Button size="sm" variant="outline" disabled={!!busy} onClick={() => adjust(-1)}>
                            {busy === 'adjust-1' ? <Loader2 className="size-4 animate-spin" /> : 'Remove'}
                        </Button>
                        <Button size="sm" disabled={!!busy} onClick={() => run('give', () => giveReward(member.clientId), 'Reward added')}>
                            {busy === 'give' ? <Loader2 className="size-4 animate-spin" /> : <><Gift className="size-4" /> Give reward</>}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function RewardLine({ reward, busy, onVoid }: { reward: LoyaltyReward; busy: boolean; onVoid: () => void }) {
    const statusText = {
        available: reward.expiresAt ? `Use by ${shortDate(reward.expiresAt)}` : 'Available',
        used: `Used ${shortDate(reward.usedAt)}${reward.usedAmountCents ? ` · ${money(reward.usedAmountCents)} off` : ''}`,
        expired: 'Expired',
        void: 'Cancelled',
    }[reward.status]
    return (
        <div className="flex items-center gap-3 rounded-md px-3 py-2 bg-white" style={{ border: `1px solid ${C.border}`, opacity: reward.status === 'available' ? 1 : 0.6 }}>
            <span className="font-mono text-sm font-semibold" style={{ color: C.text }}>{reward.code}</span>
            <span className="text-xs" style={{ color: C.text }}>{describeReward(reward)}</span>
            <span className="text-xs flex-1 text-right" style={{ color: C.muted }}>{statusText}</span>
            {reward.status === 'available' && (
                <button type="button" className="text-xs underline" style={{ color: C.muted }} disabled={busy} onClick={onVoid}>
                    {busy ? '…' : 'Cancel'}
                </button>
            )}
        </div>
    )
}

function ProgressBar({ fraction }: { fraction: number }) {
    return (
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#EFE9DF' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round(Math.min(1, Math.max(0, fraction)) * 100)}%`, backgroundColor: C.dark }} />
        </div>
    )
}
