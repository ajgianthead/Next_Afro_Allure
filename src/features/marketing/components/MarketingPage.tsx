// Template for /for/<specialty> and /features/<feature>. Same visual
// language as /for-businesses and /switch. Copy lives in ../specialties.tsx
// and ../features.tsx.
import '../../../app/for-businesses/forBusinesses.css'
import './marketing.css'
import { TRIAL_DAYS } from '../../billing/plans'
import type { MarketingPageContent, SampleMenu } from '../content'
import { FEATURE_LINKS, SPECIALTY_LINKS, SWITCH_LINKS } from '../menu'
import { MarketingNav } from './MarketingNav'
import { StylistShowcase } from './StylistShowcase'

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

const ALL_LINKS = [...SPECIALTY_LINKS, ...FEATURE_LINKS, ...SWITCH_LINKS]

const Eyebrow = ({ children, color = RED }: { children: React.ReactNode; color?: string }) => (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color, marginBottom: 18, fontWeight: 600 }}>
        {children}
    </div>
)

const H2 = ({ children }: { children: React.ReactNode }) => (
    <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.05, letterSpacing: '-.025em', margin: '0 0 16px', color: INK }}>
        {children}
    </h2>
)

const PrimaryCta = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} style={{
        fontFamily: SANS, fontWeight: 600, fontSize: 15, background: RED, color: '#fff',
        padding: '15px 26px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>{children} →</a>
)

function Hero({ c, isLoggedIn }: { c: MarketingPageContent; isLoggedIn: boolean }) {
    return (
        <section className="aa-section" style={{ background: DARK, color: WARM, padding: '110px 56px 100px', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse 60% 80% at 85% 20%, rgba(252,97,97,.2), transparent 60%),
                             radial-gradient(ellipse 70% 60% at 5% 100%, rgba(201,151,74,.16), transparent 55%)`,
            }} />
            <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
                <Eyebrow color={GOLD}>{c.eyebrow}</Eyebrow>
                <h1 className="aa-mkt-h1" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(42px, 6vw, 80px)', lineHeight: 1, letterSpacing: '-.03em', margin: '0 0 26px' }}>
                    {c.heroTitle}
                </h1>
                <p style={{ fontFamily: SANS, fontSize: 18, lineHeight: 1.55, color: 'rgba(250,247,242,.75)', maxWidth: 640, margin: '0 0 36px' }}>
                    {c.heroBody}
                </p>
                <PrimaryCta href={isLoggedIn ? '/dashboard' : '/register'}>
                    {isLoggedIn ? 'Go to your dashboard' : `Start free for ${TRIAL_DAYS} days`}
                </PrimaryCta>
                {!isLoggedIn && (
                    <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(250,247,242,.55)', margin: '18px 0 0' }}>
                        No credit card · No percentage fee on Growth · Bring your client list
                    </p>
                )}
            </div>
        </section>
    )
}

function Pains({ c }: { c: MarketingPageContent }) {
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

function Benefits({ c }: { c: MarketingPageContent }) {
    return (
        <section className="aa-section" style={{ background: '#fff', padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <Eyebrow>How AfroAllure helps</Eyebrow>
                <H2>{c.benefitsTitle}</H2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 640, lineHeight: 1.55, margin: '0 0 48px' }}>{c.benefitsIntro}</p>
                <div className="aa-mkt-grid3">
                    {c.benefits.map(b => (
                        <div key={b.title} style={{ background: WARM, border: `1px solid ${LINE}`, borderRadius: 20, padding: '28px 26px' }}>
                            <div style={{ width: 28, height: 3, background: GOLD, borderRadius: 2, marginBottom: 18 }} />
                            <div style={{ fontFamily: SERIF, fontSize: 21, color: INK, marginBottom: 10, letterSpacing: '-.01em' }}>{b.title}</div>
                            <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{b.body}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

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

function Example({ c }: { c: MarketingPageContent }) {
    if (c.sampleMenus) {
        return (
            <section className="aa-section" style={{ background: WARM, padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <Eyebrow>Your menu</Eyebrow>
                    <H2>{c.sampleMenus.title}</H2>
                    <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, lineHeight: 1.55, margin: '0 0 32px' }}>{c.sampleMenus.intro}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {c.sampleMenus.menus.map(m => <MenuTable key={m.service} menu={m} />)}
                    </div>
                </div>
            </section>
        )
    }
    if (c.steps) {
        return (
            <section className="aa-section" style={{ background: WARM, padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
                <div style={{ maxWidth: 860, margin: '0 auto' }}>
                    <Eyebrow>How it works</Eyebrow>
                    <H2>{c.steps.title}</H2>
                    <ol style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {c.steps.steps.map((s, i) => (
                            <li key={s.title} className="aa-mkt-step" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 18, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 20, padding: 24 }}>
                                <span style={{ width: 40, height: 40, borderRadius: '50%', background: i === 0 ? RED : DARK, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 18 }}>{i + 1}</span>
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
    return null
}

function Faq({ c }: { c: MarketingPageContent }) {
    return (
        <section className="aa-section" style={{ background: WARM, padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
                <Eyebrow>Questions</Eyebrow>
                <H2>Good to know.</H2>
                <div style={{ marginTop: 32, borderTop: `1px solid ${LINE}` }}>
                    {c.faq.map(([q, a]) => (
                        <details key={q} className="aa-mkt-faq" style={{ borderBottom: `1px solid ${LINE}`, padding: '20px 0' }}>
                            <summary style={{ fontFamily: SERIF, fontSize: 19, color: INK, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                {q}<span aria-hidden style={{ color: RED, fontFamily: SANS }}>+</span>
                            </summary>
                            <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.65, margin: '12px 0 0' }}>{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}

function FinalCta({ c, isLoggedIn }: { c: MarketingPageContent; isLoggedIn: boolean }) {
    const related = c.related.map(href => ALL_LINKS.find(l => l.href === href)).filter((l): l is NonNullable<typeof l> => !!l)
    return (
        <section className="aa-section" style={{ background: WARM, padding: '0 56px 100px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', background: '#fff', border: `2px solid ${GOLD}`, borderRadius: 28, padding: '64px 32px' }}>
                <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(30px, 4vw, 50px)', letterSpacing: '-.02em', margin: '0 0 14px', color: INK }}>
                    Your clients, your brand, your booking site.
                </h2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, margin: '0 0 30px' }}>
                    {TRIAL_DAYS} days free, no card needed. Questions? Email{' '}
                    <a href="mailto:abijahnesbitt@afroallure.co" style={{ color: INK }}>abijahnesbitt@afroallure.co</a>.
                </p>
                <PrimaryCta href={isLoggedIn ? '/dashboard' : '/register'}>{isLoggedIn ? 'Go to your dashboard' : 'Start free'}</PrimaryCta>
            </div>
            {related.length > 0 && (
                <div style={{ maxWidth: 1000, margin: '28px auto 0', textAlign: 'center', fontFamily: SANS, fontSize: 13, color: MUTED }}>
                    Keep reading:{' '}
                    {related.map((l, i) => (
                        <span key={l.href}>{i > 0 && ' · '}<a href={l.href} style={{ color: INK }}>{l.label}</a></span>
                    ))}
                </div>
            )}
        </section>
    )
}

export function MarketingPage({ content, isLoggedIn }: { content: MarketingPageContent; isLoggedIn: boolean }) {
    return (
        <div className="aa-business-root" style={{ background: WARM, color: INK, fontFamily: SANS, width: '100%' }}>
            <MarketingNav isLoggedIn={isLoggedIn} />
            <Hero c={content} isLoggedIn={isLoggedIn} />
            <Pains c={content} />
            <Benefits c={content} />
            <Example c={content} />
            <StylistShowcase slug={content.slug} eyebrow={content.kind === 'specialty' ? 'Real work' : 'From the community'} />
            <Faq c={content} />
            <FinalCta c={content} isLoggedIn={isLoggedIn} />
        </div>
    )
}
