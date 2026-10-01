import {
    getBusinessCounts,
    getAllBusinesses,
    getCurrentMRR,
    getPlatformFeeIncome,
    getRecentStripeEvents,
    getFailedPayments,
    getMRRHistory,
    getAllFeedback,
    getAllSupportTickets,
    getActivityFeed,
} from './data'
import CustomersTable from './CustomersTable'
import FeedbackPanel from './FeedbackPanel'
import SupportPanel from './SupportPanel'

export const metadata = { title: 'Admin | AfroAllure' }
export const dynamic = 'force-dynamic'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const RED = '#FC6161'
const GOLD = '#C9974A'
const CREAM = '#FAF7F2'
const MUTED = '#9A9088'
const GREEN = '#4ADE80'
const BG = '#0F0E0E'
const CARD = '#15130F'
const BORDER = '#2C2822'

const NAV = [
    { id: 'pulse', label: 'Pulse' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'goals', label: 'Goals' },
    { id: 'customers', label: 'Customers' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'support', label: 'Support' },
    { id: 'health', label: 'Health' },
]

function money(n: number) {
    return `$${Math.round(n).toLocaleString()}`
}

function timeAgo(dateStr: string | null) {
    if (!dateStr) return '—'
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diffMs / 3_600_000)
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
}

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="rounded-xl p-4 flex-1 min-w-[160px]" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: MUTED }}>{label}</p>
            <p style={{ fontFamily: SERIF, color, fontSize: 28 }}>{value}</p>
        </div>
    )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return <h2 style={{ fontFamily: SERIF, color: CREAM, fontSize: 28 }} className="mb-6">{children}</h2>
}

function MRRChart({ history }: { history: { month: string; mrr: number }[] }) {
    const W = 600, H = 200, PAD = 32
    const max = Math.max(...history.map(h => h.mrr), 1)
    const stepX = (W - PAD * 2) / Math.max(history.length - 1, 1)
    const points = history.map((h, i) => {
        const x = PAD + i * stepX
        const y = H - PAD - (h.mrr / max) * (H - PAD * 2)
        return { x, y, ...h }
    })
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const fillPath = `${linePath} L ${points[points.length - 1]?.x ?? PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`
    const gridLines = [0, 0.25, 0.5, 0.75, 1]

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {gridLines.map(g => {
                const y = H - PAD - g * (H - PAD * 2)
                return <line key={g} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={BORDER} strokeWidth={1} />
            })}
            <path d={fillPath} fill={RED} opacity={0.12} />
            <path d={linePath} fill="none" stroke={RED} strokeWidth={2} />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={RED} />
            ))}
            {points.map((p, i) => (
                <text key={`label-${i}`} x={p.x} y={H - 8} fontSize={10} fill={MUTED} textAnchor="middle">{p.month}</text>
            ))}
            {gridLines.map(g => {
                const y = H - PAD - g * (H - PAD * 2)
                return <text key={`y-${g}`} x={4} y={y + 3} fontSize={9} fill={MUTED}>{money(max * g)}</text>
            })}
        </svg>
    )
}

export default async function AdminPage() {
    const [
        counts, businesses, mrrData, fees, stripeEvents, failedPayments,
        mrrHistory, feedback, supportTickets, activityFeed,
    ] = await Promise.all([
        getBusinessCounts(),
        getAllBusinesses(),
        getCurrentMRR(),
        getPlatformFeeIncome(),
        getRecentStripeEvents(),
        getFailedPayments(),
        getMRRHistory(),
        getAllFeedback(),
        getAllSupportTickets(),
        getActivityFeed(),
    ])

    // ── Revenue derived values ──────────────────────────────────────────────
    const arpu = counts.paying > 0 ? mrrData.mrr / counts.paying : 0
    const now = new Date()
    const remainingMonths = 11 - now.getMonth()
    const ytdTotal = mrrHistory
        .filter(h => h.month.endsWith(String(now.getFullYear())))
        .reduce((sum, h) => sum + h.mrr, 0)
    const projectedYearEnd = remainingMonths * mrrData.mrr + ytdTotal

    const momPrev = mrrHistory[mrrHistory.length - 2]?.mrr ?? 0
    const momCurrent = mrrHistory[mrrHistory.length - 1]?.mrr ?? 0
    const momGrowth = momPrev > 0 ? ((momCurrent - momPrev) / momPrev) * 100 : 0

    // ── Goals ────────────────────────────────────────────────────────────────
    const GOALS = [
        { label: 'First paying customer', target: 1, current: counts.paying, unit: 'businesses' },
        { label: 'Quit Olive Garden threshold', target: 3000, current: mrrData.mrr, unit: 'mrr' },
        { label: '10 paying businesses', target: 10, current: counts.paying, unit: 'businesses' },
        { label: '$10K MRR', target: 10000, current: mrrData.mrr, unit: 'mrr' },
        { label: '50 paying businesses', target: 50, current: counts.paying, unit: 'businesses' },
        { label: '$25K MRR', target: 25000, current: mrrData.mrr, unit: 'mrr' },
        { label: '100 paying businesses', target: 100, current: counts.paying, unit: 'businesses' },
    ]

    // ── Funnel ───────────────────────────────────────────────────────────────
    const activatedCount = businesses.filter((b: any) => b.is_onboarded).length
    const funnelSteps = [
        { label: 'Total Signups', count: counts.total },
        { label: 'Activated', count: activatedCount },
        { label: 'Trial', count: counts.trial },
        { label: 'Paid', count: counts.paying },
    ]

    const churnedBusinesses = businesses.filter(b => b.subscription_status === 'canceled')
    const atRiskBusinesses = businesses.filter(b => b.at_risk)

    return (
        <div style={{ backgroundColor: BG, minHeight: '100vh', color: CREAM, fontFamily: 'Inter, sans-serif' }}>
            {/* Mobile top tab nav */}
            <nav
                className="lg:hidden flex overflow-x-auto gap-1 px-3 py-2 sticky top-0 z-20"
                style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}` }}
            >
                {NAV.map(n => (
                    <a key={n.id} href={`#${n.id}`} className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap shrink-0" style={{ backgroundColor: CARD, color: CREAM }}>
                        {n.label}
                    </a>
                ))}
            </nav>

            <div className="flex">
                {/* Sticky left sidebar (desktop) */}
                <aside
                    className="hidden lg:flex flex-col gap-1 sticky top-0 h-screen px-4 py-8 shrink-0"
                    style={{ width: 200, borderRight: `1px solid ${BORDER}` }}
                >
                    <p style={{ fontFamily: SERIF, color: RED, fontSize: 13, letterSpacing: '0.1em' }} className="uppercase mb-6">AfroAllure</p>
                    {NAV.map(n => (
                        <a
                            key={n.id}
                            href={`#${n.id}`}
                            className="text-sm px-3 py-2 rounded-lg transition-colors"
                            style={{ color: MUTED }}
                        >
                            {n.label}
                        </a>
                    ))}
                </aside>

                {/* Scrollable main content */}
                <main className="flex-1 min-w-0 px-5 py-8 lg:px-10 flex flex-col gap-20">

                    {/* ── SECTION 1: PULSE ───────────────────────────────────── */}
                    <section id="pulse">
                        <SectionHeading>The Pulse</SectionHeading>
                        <div className="flex flex-wrap gap-3 mb-8">
                            <StatTile label="Active Paying Businesses" value={String(counts.paying)} color={RED} />
                            <StatTile label="MRR" value={money(mrrData.mrr)} color={GOLD} />
                            <StatTile label="Platform Fees This Month" value={money(fees.thisMonth)} color={GREEN} />
                            <StatTile label="Total Businesses" value={String(counts.total)} color={MUTED} />
                        </div>

                        <h3 className="text-sm uppercase tracking-widest mb-3" style={{ color: MUTED }}>Activity Feed</h3>
                        <div className="rounded-xl overflow-y-auto" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, maxHeight: 400 }}>
                            {activityFeed.map((a: any) => {
                                const dot = a.subscription_status === 'active' ? GREEN
                                    : a.subscription_status === 'trialing' ? GOLD
                                        : a.subscription_status === 'canceled' ? RED
                                            : MUTED
                                const desc = a.subscription_status === 'active' ? 'Active on Growth plan'
                                    : a.subscription_status === 'trialing' ? 'In trial'
                                        : a.subscription_status === 'canceled' ? 'Canceled'
                                            : 'Joined as beta user'
                                return (
                                    <div key={a.business_id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                                        <span className="shrink-0 rounded-full" style={{ width: 8, height: 8, backgroundColor: dot }} />
                                        <span className="flex-1 min-w-0 truncate" style={{ color: CREAM }}>{a.business_name}</span>
                                        <span className="shrink-0 text-xs" style={{ color: MUTED }}>{desc}</span>
                                        <span className="shrink-0 text-xs w-24 text-right" style={{ color: MUTED }}>{timeAgo(a.created_at)}</span>
                                    </div>
                                )
                            })}
                            {activityFeed.length === 0 && <p className="px-4 py-6 text-sm text-center" style={{ color: MUTED }}>No activity yet.</p>}
                        </div>
                    </section>

                    {/* ── SECTION 2: REVENUE ─────────────────────────────────── */}
                    <section id="revenue">
                        <SectionHeading>Revenue &amp; Financials</SectionHeading>

                        <div className="rounded-xl p-4 mb-8" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
                            <MRRChart history={mrrHistory} />
                        </div>

                        <div className="flex flex-wrap gap-3 mb-8">
                            <StatTile label="MRR" value={money(mrrData.mrr)} color={GOLD} />
                            <StatTile label="ARR" value={money(mrrData.arr)} color={GOLD} />
                            <StatTile label="Platform Fees All Time" value={money(fees.allTime)} color={GREEN} />
                            <StatTile label="ARPU" value={money(arpu)} color={RED} />
                        </div>

                        <h3 className="text-sm uppercase tracking-widest mb-3" style={{ color: MUTED }}>Revenue by Plan</h3>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {Object.keys(mrrData.byPlan).length === 0 && (
                                <p className="text-sm" style={{ color: MUTED }}>No active paid subscriptions yet.</p>
                            )}
                            {Object.entries(mrrData.byPlan).map(([plan, amount]) => (
                                <StatTile key={plan} label={plan} value={money(amount)} color={GOLD} />
                            ))}
                        </div>

                        <div className="rounded-xl p-4" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
                            <p className="text-sm" style={{ color: CREAM }}>
                                On track for <span style={{ color: GOLD, fontWeight: 600 }}>{money(projectedYearEnd)}</span> by Dec 31, {now.getFullYear()}.
                            </p>
                        </div>
                    </section>

                    {/* ── SECTION 3: GOALS ───────────────────────────────────── */}
                    <section id="goals">
                        <SectionHeading>Growth &amp; Goals</SectionHeading>

                        <div className="flex flex-col gap-3 mb-10">
                            {GOALS.map(g => {
                                const pct = Math.min(g.current / g.target, 1) * 100
                                const status = g.current >= g.target ? 'Achieved' : g.current > 0 ? 'In Progress' : 'Not Started'
                                const statusColor = status === 'Achieved' ? GREEN : status === 'In Progress' ? GOLD : MUTED
                                const fmt = (n: number) => g.unit === 'mrr' ? money(n) : String(Math.round(n))
                                return (
                                    <div key={g.label} className="rounded-xl p-4" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <p style={{ color: CREAM }} className="text-sm font-medium">{g.label}</p>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${statusColor}22`, color: statusColor }}>
                                                {status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="rounded-full h-2 mb-2" style={{ backgroundColor: BORDER }}>
                                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: RED }} />
                                        </div>
                                        <p className="text-xs" style={{ color: MUTED }}>{fmt(g.current)} / {fmt(g.target)}</p>
                                    </div>
                                )
                            })}
                        </div>

                        <h3 className="text-sm uppercase tracking-widest mb-3" style={{ color: MUTED }}>Conversion Funnel</h3>
                        <div className="flex flex-col gap-2 mb-10">
                            {funnelSteps.map((s, i) => {
                                const pct = counts.total > 0 ? (s.count / counts.total) * 100 : 0
                                return (
                                    <div key={s.label} className="rounded-xl p-3 flex items-center justify-between" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
                                        <span style={{ color: CREAM }} className="text-sm">{s.label}</span>
                                        <span style={{ color: MUTED }} className="text-sm">{s.count} ({pct.toFixed(0)}%)</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex flex-wrap gap-3 mb-6">
                            <StatTile
                                label="MoM Growth"
                                value={`${momGrowth >= 0 ? '+' : ''}${momGrowth.toFixed(1)}%`}
                                color={momGrowth >= 0 ? GREEN : RED}
                            />
                            <StatTile label="Churned Businesses" value={String(counts.churned)} color={RED} />
                        </div>

                        {churnedBusinesses.length > 0 && (
                            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                                {churnedBusinesses.map(b => (
                                    <div key={b.business_id} className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
                                        <span style={{ color: CREAM }}>{b.business_name}</span>
                                        <span style={{ color: MUTED }} className="text-xs">{b.email}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ── SECTION 4: CUSTOMERS ───────────────────────────────── */}
                    <section id="customers">
                        <SectionHeading>Customers</SectionHeading>
                        <CustomersTable businesses={businesses as any} />
                    </section>

                    {/* ── SECTION 5: FEEDBACK ────────────────────────────────── */}
                    <section id="feedback">
                        <SectionHeading>Feedback</SectionHeading>
                        <FeedbackPanel feedback={feedback as any} />
                    </section>

                    {/* ── SECTION 6: SUPPORT ─────────────────────────────────── */}
                    <section id="support">
                        <SectionHeading>Support Tickets</SectionHeading>
                        <SupportPanel supportTickets={supportTickets as any} />
                    </section>

                    {/* ── SECTION 7: HEALTH ──────────────────────────────────── */}
                    <section id="health" className="pb-20">
                        <SectionHeading>Alerts &amp; Platform Health</SectionHeading>

                        <div className="flex flex-wrap gap-3 mb-8">
                            <StatTile label="At Risk" value={String(atRiskBusinesses.length)} color={RED} />
                            <StatTile label="Open Support Tickets" value={String(supportTickets.filter((t: any) => t.status === 'open').length)} color={GOLD} />
                            <StatTile label="Unresolved Feedback" value={String(feedback.filter((f: any) => f.status === 'new').length)} color={MUTED} />
                            <StatTile label="Failed Payments" value={String(failedPayments.length)} color={RED} />
                        </div>

                        <h3 className="text-sm uppercase tracking-widest mb-3" style={{ color: MUTED }}>At Risk Businesses</h3>
                        <div className="rounded-xl overflow-hidden mb-8" style={{ border: `1px solid ${BORDER}` }}>
                            {atRiskBusinesses.length === 0 && (
                                <p className="px-4 py-4 text-sm" style={{ backgroundColor: CARD, color: MUTED }}>No at-risk businesses right now.</p>
                            )}
                            {atRiskBusinesses.map(b => (
                                <div key={b.business_id} className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
                                    <div>
                                        <p style={{ color: CREAM }}>{b.business_name}</p>
                                        <p style={{ color: MUTED }} className="text-xs">{b.email} · last check-in {timeAgo(b.last_checkin_sent_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-sm uppercase tracking-widest mb-3" style={{ color: MUTED }}>Failed Payments</h3>
                        <div className="rounded-xl overflow-hidden mb-8" style={{ border: `1px solid ${BORDER}` }}>
                            {failedPayments.length === 0 && (
                                <p className="px-4 py-4 text-sm" style={{ backgroundColor: CARD, color: MUTED }}>No failed payments.</p>
                            )}
                            {failedPayments.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
                                    <span style={{ color: CREAM }}>{inv.customer_email ?? inv.id}</span>
                                    <span style={{ color: RED }} className="text-xs">{money((inv.amount_due ?? 0) / 100)} · attempt {inv.attempt_count}</span>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-sm uppercase tracking-widest mb-3" style={{ color: MUTED }}>Platform Health</h3>
                        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                            {[
                                { label: 'Stripe', value: stripeEvents[0]?.created ? new Date(stripeEvents[0].created * 1000).toLocaleString() : 'No recent events' },
                                { label: 'Supabase', value: 'Connected' },
                                { label: 'Resend', value: process.env.RESEND_API_KEY ? 'Configured' : 'Not configured' },
                                { label: 'FOUNDER_EMAIL', value: process.env.FOUNDER_EMAIL ? 'Set' : 'Not set' },
                            ].map(h => (
                                <div key={h.label} className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
                                    <span style={{ color: CREAM }}>{h.label}</span>
                                    <span style={{ color: MUTED }} className="text-xs">{h.value}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}
