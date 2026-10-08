// Layout for /for/<specialty> and /features/<feature>. Each page chooses its
// hero, accent color, section order and section styles in its content entry,
// so pages share a visual language without sharing one shape.
import '../../../app/for-businesses/forBusinesses.css'
import './marketing.css'
import { TRIAL_DAYS } from '../../billing/plans'
import type { MarketingPageContent, Row, SampleMenu, Section, Visual } from '../content'
import { FEATURE_LINKS, SPECIALTY_LINKS, SWITCH_LINKS } from '../menu'
import { MarketingNav } from './MarketingNav'
import { StylistShowcase } from './StylistShowcase'
import { VisualSlot } from './VisualSlot'

const RED = '#FC6161'
const DARK = '#0F0E0E'
const WARM = '#FAF7F2'
const GOLD = '#C9974A'
const INK = '#1A1818'
const MUTED = '#6F6863'
const LINE = '#E8E2D6'
const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS = "'Inter', system-ui, sans-serif"
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace"
const ACC = 'var(--acc)'

const ALL_LINKS = [...SPECIALTY_LINKS, ...FEATURE_LINKS, ...SWITCH_LINKS]

type Ctx = { c: MarketingPageContent; isLoggedIn: boolean; menu?: SampleMenu }

const Eyebrow = ({ children, color = ACC }: { children: React.ReactNode; color?: string }) => (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color, marginBottom: 18, fontWeight: 600 }}>
        {children}
    </div>
)

const H2 = ({ children, color = INK }: { children: React.ReactNode; color?: string }) => (
    <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.05, letterSpacing: '-.025em', margin: '0 0 16px', color }}>
        {children}
    </h2>
)

const Cta = ({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) => (
    <a href={href} style={{
        fontFamily: SANS, fontWeight: 600, fontSize: 15, background: light ? '#fff' : RED, color: light ? INK : '#fff',
        padding: '15px 26px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>{children} →</a>
)

const Shot = ({ c, v, menu }: { c: MarketingPageContent; v: Visual; menu?: SampleMenu }) => <VisualSlot slug={c.slug} visual={v} menu={menu} />

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero({ c, isLoggedIn, menu }: Ctx) {
    const style = c.theme.hero
    const dark = style !== 'split-light'
    const bg = style === 'split-light' ? WARM
        : style === 'split-accent' ? `linear-gradient(135deg, color-mix(in srgb, ${c.theme.accent} 88%, #0F0E0E), color-mix(in srgb, ${c.theme.accent} 40%, #0F0E0E))`
            : DARK
    const text = (
        <div>
            <Eyebrow color={style === 'split-accent' ? 'rgba(255,255,255,.8)' : style === 'split-light' ? ACC : GOLD}>{c.eyebrow}</Eyebrow>
            <h1 className="aa-mkt-h1" style={{
                fontFamily: SERIF, fontWeight: 400, fontSize: style === 'centered-dark' ? 'clamp(44px, 6.4vw, 86px)' : 'clamp(40px, 5vw, 70px)',
                lineHeight: 1, letterSpacing: '-.03em', margin: '0 0 24px', color: dark ? WARM : INK,
            }}>
                {c.heroTitle}
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 18, lineHeight: 1.55, color: dark ? 'rgba(250,247,242,.78)' : MUTED, maxWidth: 560, margin: style === 'centered-dark' ? '0 auto 34px' : '0 0 34px' }}>
                {c.heroBody}
            </p>
            <Cta href={isLoggedIn ? '/dashboard' : '/register'} light={style === 'split-accent'}>
                {isLoggedIn ? 'Go to your dashboard' : `Start free for ${TRIAL_DAYS} days`}
            </Cta>
            {!isLoggedIn && (
                <p style={{ fontFamily: SANS, fontSize: 13, color: dark ? 'rgba(250,247,242,.6)' : MUTED, margin: '16px 0 0' }}>
                    No credit card · No percentage fee on Growth
                </p>
            )}
        </div>
    )
    return (
        <section className={`aa-section aa-mkt-hero ${style === 'split-accent' ? 'aa-mkt-on-accent' : ''}`} style={{ background: bg, padding: '90px 56px', position: 'relative', overflow: 'hidden' }}>
            {style !== 'split-light' && style !== 'split-accent' && (
                <div aria-hidden style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(ellipse 55% 75% at 85% 25%, color-mix(in srgb, ${c.theme.accent} 28%, transparent), transparent 60%),
                                 radial-gradient(ellipse 70% 60% at 5% 100%, rgba(201,151,74,.14), transparent 55%)`,
                }} />
            )}
            {style === 'centered-dark' ? (
                <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
                    {text}
                    <div style={{ marginTop: 56 }}><Shot c={c} v={c.heroVisual} menu={menu} /></div>
                </div>
            ) : (
                <div className="aa-mkt-split" style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
                    {text}
                    <div className="aa-w-float"><Shot c={c} v={c.heroVisual} menu={menu} /></div>
                </div>
            )}
        </section>
    )
}

// ─── Pains ───────────────────────────────────────────────────────────────────

function Pains({ c, style }: { c: MarketingPageContent; style: 'cards' | 'numbered' | 'quotes' }) {
    if (style === 'numbered') {
        return (
            <section className="aa-section" style={{ background: WARM, padding: '100px 56px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <Eyebrow>{c.painsTitle}</Eyebrow>
                    {c.pains.map((p, i) => (
                        <div key={p.title} className="aa-mkt-numbered" style={{ borderTop: `1px solid ${LINE}`, padding: '28px 0' }}>
                            <span style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, color: ACC }}>0{i + 1}</span>
                            <div style={{ fontFamily: SERIF, fontSize: 28, color: INK, letterSpacing: '-.01em' }}>{p.title}</div>
                            <div style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>{p.body}</div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }
    if (style === 'quotes') {
        return (
            <section className="aa-section" style={{ background: '#fff', padding: '100px 56px', borderBottom: `1px solid ${LINE}` }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 44 }}>
                        <Eyebrow>{c.painsTitle}</Eyebrow>
                    </div>
                    <div className="aa-mkt-grid3">
                        {c.pains.map((p, i) => (
                            <div key={p.title} style={{
                                position: 'relative', background: WARM, borderRadius: 24, padding: '30px 26px',
                                transform: `rotate(${[-1.2, .8, -.6][i]}deg)`,
                            }}>
                                <div style={{ fontFamily: SERIF, fontSize: 56, lineHeight: .6, color: ACC, height: 22 }}>&ldquo;</div>
                                <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: INK, marginBottom: 12, letterSpacing: '-.01em' }}>{p.title}</div>
                                <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{p.body}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }
    return (
        <section className="aa-section" style={{ background: WARM, padding: '100px 56px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <Eyebrow>{c.painsTitle}</Eyebrow>
                <div className="aa-mkt-grid3">
                    {c.pains.map(p => (
                        <div key={p.title} style={{ borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
                            <div style={{ fontFamily: SERIF, fontSize: 24, color: INK, marginBottom: 10, letterSpacing: '-.01em' }}>{p.title}</div>
                            <div style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>{p.body}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Feature rows ────────────────────────────────────────────────────────────

function FeatureRow({ c, row, flip, menu }: { c: MarketingPageContent; row: Row; flip: boolean; menu?: SampleMenu }) {
    return (
        <div className={`aa-mkt-row ${flip ? 'aa-mkt-row-flip' : ''}`}>
            <div>
                {row.eyebrow && <Eyebrow>{row.eyebrow}</Eyebrow>}
                <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(28px, 3.2vw, 42px)', lineHeight: 1.08, letterSpacing: '-.02em', margin: '0 0 16px', color: INK }}>
                    {row.title}
                </h3>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, lineHeight: 1.65, margin: '0 0 18px', maxWidth: 480 }}>{row.body}</p>
                {row.bullets && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {row.bullets.map(b => (
                            <li key={b} style={{ display: 'flex', gap: 10, fontFamily: SANS, fontSize: 14, color: INK, lineHeight: 1.5 }}>
                                <span aria-hidden style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: `color-mix(in srgb, ${c.theme.accent} 16%, #fff)`, color: ACC, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>✓</span>
                                {b}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div><Shot c={c} v={row.visual} menu={menu} /></div>
        </div>
    )
}

function Rows({ c, menu }: { c: MarketingPageContent; menu?: SampleMenu }) {
    return (
        <section className="aa-section" style={{ background: '#fff', padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 110 }}>
                {c.rows.map((row, i) => <FeatureRow key={row.title} c={c} row={row} flip={i % 2 === 1} menu={menu} />)}
            </div>
        </section>
    )
}

// ─── Benefits ────────────────────────────────────────────────────────────────

function Benefits({ c, style }: { c: MarketingPageContent; style: 'grid' | 'bento' | 'checklist' }) {
    if (style === 'checklist') {
        return (
            <section className="aa-section" style={{ background: DARK, color: WARM, padding: '110px 56px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <Eyebrow color={GOLD}>Everything included</Eyebrow>
                    <H2 color={WARM}>{c.benefitsTitle}</H2>
                    <p style={{ fontFamily: SANS, fontSize: 16, color: 'rgba(250,247,242,.7)', maxWidth: 620, lineHeight: 1.55, margin: '0 0 44px' }}>{c.benefitsIntro}</p>
                    <div className="aa-mkt-checklist">
                        {c.benefits.map(b => (
                            <div key={b.title} style={{ display: 'flex', gap: 16, padding: '22px 0', borderTop: '1px solid rgba(250,247,242,.12)' }}>
                                <span aria-hidden style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: ACC, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>✓</span>
                                <div>
                                    <div style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 6 }}>{b.title}</div>
                                    <div style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(250,247,242,.68)', lineHeight: 1.6 }}>{b.body}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }
    if (style === 'bento') {
        return (
            <section className="aa-section" style={{ background: WARM, padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
                <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <Eyebrow>How AfroAllure helps</Eyebrow>
                    <H2>{c.benefitsTitle}</H2>
                    <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 620, lineHeight: 1.55, margin: '0 0 44px' }}>{c.benefitsIntro}</p>
                    <div className="aa-mkt-bento">
                        {c.benefits.map((b, i) => {
                            // Wide tiles at 0, 3 and 5 fill three full rows of three columns.
                            const big = i === 0 || i === 3 || i === 5
                            const hot = i === 0
                            return (
                                <div key={b.title} className={big ? 'aa-mkt-bento-wide' : ''} style={{
                                    borderRadius: 24, padding: big ? '36px 34px' : '28px 26px',
                                    background: hot ? `linear-gradient(135deg, ${c.theme.accent}, color-mix(in srgb, ${c.theme.accent} 55%, #0F0E0E))` : '#fff',
                                    border: hot ? 'none' : `1px solid ${LINE}`, color: hot ? '#fff' : INK,
                                }}>
                                    <div style={{ fontFamily: SERIF, fontSize: big ? 30 : 21, marginBottom: 10, letterSpacing: '-.015em', lineHeight: 1.1 }}>{b.title}</div>
                                    <div style={{ fontFamily: SANS, fontSize: big ? 16 : 14, color: hot ? 'rgba(255,255,255,.85)' : MUTED, lineHeight: 1.6, maxWidth: 520 }}>{b.body}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
        )
    }
    return (
        <section className="aa-section" style={{ background: '#fff', padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <Eyebrow>How AfroAllure helps</Eyebrow>
                <H2>{c.benefitsTitle}</H2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 640, lineHeight: 1.55, margin: '0 0 48px' }}>{c.benefitsIntro}</p>
                <div className="aa-mkt-grid3">
                    {c.benefits.map(b => (
                        <div key={b.title} style={{ background: WARM, border: `1px solid ${LINE}`, borderRadius: 20, padding: '28px 26px' }}>
                            <div style={{ width: 28, height: 3, background: ACC, borderRadius: 2, marginBottom: 18 }} />
                            <div style={{ fontFamily: SERIF, fontSize: 21, color: INK, marginBottom: 10, letterSpacing: '-.01em' }}>{b.title}</div>
                            <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{b.body}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Example menu ────────────────────────────────────────────────────────────

function MenuTable({ menu }: { menu: SampleMenu }) {
    const cols = `1.4fr ${menu.columns.map(() => '1fr').join(' ')}`
    return (
        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '18px 18px 12px' }}>
                <div style={{ fontFamily: SERIF, fontSize: 22, color: INK }}>{menu.service}</div>
                {menu.note && <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginTop: 4 }}>{menu.note}</div>}
            </div>
            <div className="aa-mkt-menu-row" style={{ gridTemplateColumns: cols, background: WARM, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
                <span />
                {menu.columns.map(col => (
                    <span key={col} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: MUTED, fontWeight: 600 }}>{col}</span>
                ))}
            </div>
            {menu.rows.map((row, i) => (
                <div key={row.label} className="aa-mkt-menu-row" style={{ gridTemplateColumns: cols, borderBottom: i < menu.rows.length - 1 ? `1px solid ${LINE}` : 'none', fontFamily: SANS, fontSize: 14 }}>
                    <span style={{ color: INK, fontWeight: 600 }}>{row.label}</span>
                    {row.cells.map((cell, j) => <span key={j} style={{ color: INK }}>{cell}</span>)}
                </div>
            ))}
            {menu.extras && menu.extras.length > 0 && (
                <div style={{ padding: '14px 18px', borderTop: `1px solid ${LINE}`, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {menu.extras.map(x => (
                        <span key={x} style={{ fontFamily: SANS, fontSize: 12, color: INK, background: WARM, border: `1px solid ${LINE}`, borderRadius: 999, padding: '5px 12px' }}>{x}</span>
                    ))}
                </div>
            )}
        </div>
    )
}

function Menu({ c, withPicker }: { c: MarketingPageContent; withPicker?: boolean }) {
    if (!c.sampleMenus) return null
    const tables = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {c.sampleMenus.menus.map(m => <MenuTable key={m.service} menu={m} />)}
        </div>
    )
    return (
        <section className="aa-section" style={{ background: WARM, padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: withPicker ? 1180 : 900, margin: '0 auto' }}>
                <Eyebrow>Your menu</Eyebrow>
                <H2>{c.sampleMenus.title}</H2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, lineHeight: 1.55, margin: '0 0 36px' }}>{c.sampleMenus.intro}</p>
                {withPicker ? (
                    <div className="aa-mkt-split" style={{ alignItems: 'start' }}>
                        {tables}
                        <VisualSlot slug={c.slug} visual={{ widget: { kind: 'price-picker' }, slot: 'menu' }} menu={c.sampleMenus.menus[0]} />
                    </div>
                ) : tables}
            </div>
        </section>
    )
}

// ─── Steps ───────────────────────────────────────────────────────────────────

function Steps({ c, style }: { c: MarketingPageContent; style: 'timeline' | 'cards' }) {
    if (!c.steps) return null
    if (style === 'timeline') {
        return (
            <section className="aa-section" style={{ background: '#fff', padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
                <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <Eyebrow>How it works</Eyebrow>
                    <H2>{c.steps.title}</H2>
                    <ol className="aa-mkt-timeline" style={{ listStyle: 'none', padding: 0, margin: '48px 0 0' }}>
                        {c.steps.steps.map((s, i) => (
                            <li key={s.title} style={{ position: 'relative' }}>
                                <div className="aa-mkt-timeline-dot" style={{ width: 44, height: 44, borderRadius: '50%', background: i === 0 ? ACC : DARK, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 19, position: 'relative', zIndex: 1 }}>{i + 1}</div>
                                <div style={{ fontFamily: SERIF, fontSize: 21, color: INK, margin: '18px 0 8px', letterSpacing: '-.01em' }}>{s.title}</div>
                                <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{s.body}</div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        )
    }
    return (
        <section className="aa-section" style={{ background: WARM, padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <Eyebrow>How it works</Eyebrow>
                <H2>{c.steps.title}</H2>
                <ol style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {c.steps.steps.map((s, i) => (
                        <li key={s.title} className="aa-mkt-step" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 18, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 20, padding: 24 }}>
                            <span style={{ width: 40, height: 40, borderRadius: '50%', background: i === 0 ? ACC : DARK, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 18 }}>{i + 1}</span>
                            <div>
                                <div style={{ fontFamily: SERIF, fontSize: 20, color: INK, marginBottom: 6, letterSpacing: '-.01em' }}>{s.title}</div>
                                <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.65 }}>{s.body}</div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}

// ─── Demo, facts ─────────────────────────────────────────────────────────────

function Demo({ c, s, menu }: { c: MarketingPageContent; s: Extract<Section, { type: 'demo' }>; menu?: SampleMenu }) {
    return (
        <section className="aa-section" style={{ background: `linear-gradient(180deg, ${WARM}, color-mix(in srgb, ${c.theme.accent} 10%, ${WARM}))`, padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
                <Eyebrow>See it in action</Eyebrow>
                <H2>{s.title}</H2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, lineHeight: 1.55, maxWidth: 600, margin: '0 auto 52px' }}>{s.body}</p>
                <Shot c={c} v={s.visual} menu={menu} />
            </div>
        </section>
    )
}

function Facts({ c }: { c: MarketingPageContent }) {
    if (!c.facts) return null
    return (
        <section className="aa-section" style={{ background: DARK, color: WARM, padding: '70px 56px' }}>
            <div className="aa-mkt-grid3" style={{ maxWidth: 1100, margin: '0 auto' }}>
                {c.facts.map(([big, small]) => (
                    <div key={big + small} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: SERIF, fontSize: 'clamp(44px, 5vw, 64px)', color: ACC, letterSpacing: '-.03em', lineHeight: 1 }}>{big}</div>
                        <div style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(250,247,242,.7)', marginTop: 10 }}>{small}</div>
                    </div>
                ))}
            </div>
        </section>
    )
}

// ─── FAQ and close ───────────────────────────────────────────────────────────

function Faq({ c }: { c: MarketingPageContent }) {
    return (
        <section className="aa-section" style={{ background: WARM, padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
            <div className="aa-mkt-faq-wrap" style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div>
                    <Eyebrow>Questions</Eyebrow>
                    <H2>Good to know.</H2>
                    <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
                        Something else? Email <a href="mailto:abijahnesbitt@afroallure.co" style={{ color: INK }}>abijahnesbitt@afroallure.co</a>.
                    </p>
                </div>
                <div style={{ borderTop: `1px solid ${LINE}` }}>
                    {c.faq.map(([q, a]) => (
                        <details key={q} className="aa-mkt-faq" style={{ borderBottom: `1px solid ${LINE}`, padding: '20px 0' }}>
                            <summary style={{ fontFamily: SERIF, fontSize: 19, color: INK, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                {q}<span aria-hidden style={{ color: ACC, fontFamily: SANS }}>+</span>
                            </summary>
                            <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.65, margin: '12px 0 0' }}>{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}

function FinalCta({ c, isLoggedIn }: Ctx) {
    const related = c.related.map(href => ALL_LINKS.find(l => l.href === href)).filter((l): l is NonNullable<typeof l> => !!l)
    return (
        <section className="aa-section" style={{ background: WARM, padding: '0 56px 100px' }}>
            <div style={{
                maxWidth: 1100, margin: '0 auto', textAlign: 'center', borderRadius: 32, padding: '72px 32px', color: WARM,
                background: `radial-gradient(ellipse 70% 90% at 80% 0%, color-mix(in srgb, ${c.theme.accent} 45%, transparent), transparent 60%), ${DARK}`,
            }}>
                <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(32px, 4.4vw, 56px)', letterSpacing: '-.02em', margin: '0 0 14px' }}>
                    Your clients, your brand,<br />your booking site.
                </h2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: 'rgba(250,247,242,.7)', margin: '0 0 30px' }}>{TRIAL_DAYS} days free, no card needed.</p>
                <Cta href={isLoggedIn ? '/dashboard' : '/register'}>{isLoggedIn ? 'Go to your dashboard' : 'Start free'}</Cta>
            </div>
            {related.length > 0 && (
                <div style={{ maxWidth: 1100, margin: '28px auto 0', textAlign: 'center', fontFamily: SANS, fontSize: 13, color: MUTED }}>
                    Keep reading:{' '}
                    {related.map((l, i) => <span key={l.href}>{i > 0 && ' · '}<a href={l.href} style={{ color: INK }}>{l.label}</a></span>)}
                </div>
            )}
        </section>
    )
}

function SectionView({ s, ctx }: { s: Section; ctx: Ctx }) {
    const { c, menu } = ctx
    switch (s.type) {
        case 'pains': return <Pains c={c} style={s.style} />
        case 'rows': return <Rows c={c} menu={menu} />
        case 'benefits': return <Benefits c={c} style={s.style} />
        case 'menu': return <Menu c={c} withPicker={s.withPicker} />
        case 'steps': return <Steps c={c} style={s.style} />
        case 'demo': return <Demo c={c} s={s} menu={menu} />
        case 'facts': return <Facts c={c} />
        case 'showcase': return <StylistShowcase slug={c.slug} eyebrow={c.kind === 'specialty' ? 'Real work' : 'From the community'} />
    }
}

export function MarketingPage({ content, isLoggedIn }: { content: MarketingPageContent; isLoggedIn: boolean }) {
    const ctx: Ctx = { c: content, isLoggedIn, menu: content.sampleMenus?.menus[0] }
    return (
        <div className="aa-business-root" style={{ background: WARM, color: INK, fontFamily: SANS, width: '100%', ['--acc' as string]: content.theme.accent }}>
            <MarketingNav isLoggedIn={isLoggedIn} />
            <Hero {...ctx} />
            {content.sections.map((s, i) => <SectionView key={i} s={s} ctx={ctx} />)}
            <Faq c={content} />
            <FinalCta {...ctx} />
        </div>
    )
}
