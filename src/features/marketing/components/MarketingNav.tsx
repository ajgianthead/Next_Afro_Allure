'use client'

// The marketing site's top menu: Features, Who it's for, Switch and Pricing,
// with a dropdown per group on desktop and a grouped list on phones.
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Menu, X } from 'lucide-react'
import LOGO from '../../../../public/images/logo_transparent_background.png'
import { MARKETING_MENU, PRICING_HREF } from '../menu'

const RED = '#FC6161'
const DARK = '#0F0E0E'
const WARM = '#FAF7F2'
const INK = '#1A1818'
const MUTED = '#6F6863'
const LINE = '#E8E2D6'
const SANS = "'Inter', system-ui, sans-serif"

/** The desktop dropdown groups and Pricing link. Used inside other navs too (e.g. /for-businesses). */
export function MarketingMenuDesktop({ dark = false }: { dark?: boolean }) {
    const [open, setOpen] = useState<string | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null) }
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
        document.addEventListener('mousedown', close)
        document.addEventListener('keydown', esc)
        return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
    }, [open])

    const color = dark ? 'rgba(250,247,242,.75)' : MUTED
    return (
        <div ref={ref} className="aa-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center', fontFamily: SANS, fontSize: 14, fontWeight: 500 }}>
            {MARKETING_MENU.map(group => (
                <div key={group.label} style={{ position: 'relative' }}
                    onMouseEnter={() => setOpen(group.label)} onMouseLeave={() => setOpen(o => (o === group.label ? null : o))}>
                    <button
                        type="button"
                        aria-expanded={open === group.label}
                        // Hover already opens it on desktop, so a click must not toggle it shut again.
                        // Touch screens have no hover: the tap opens it; tapping outside closes it.
                        onClick={() => setOpen(group.label)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color, font: 'inherit', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 0' }}
                    >
                        {group.label} <ChevronDown size={14} />
                    </button>
                    {open === group.label && (
                        <div style={{ position: 'absolute', top: '100%', left: -16, paddingTop: 8, zIndex: 50 }}>
                            <div style={{
                                background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 8, minWidth: 280,
                                boxShadow: '0 12px 32px rgba(15,14,14,.12)',
                            }}>
                                {group.links.map(link => (
                                    <a key={link.href} href={link.href} onClick={() => setOpen(null)} className="aa-menu-item" style={{
                                        display: 'block', padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                                    }}>
                                        <div style={{ color: INK, fontWeight: 600, fontSize: 14 }}>{link.label}</div>
                                        {link.blurb && <div style={{ color: MUTED, fontSize: 12, marginTop: 2, fontWeight: 400 }}>{link.blurb}</div>}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <a href={PRICING_HREF} style={{ color, textDecoration: 'none' }}>Pricing</a>
        </div>
    )
}

/** The grouped links for a phone menu. */
export function MarketingMenuMobileLinks({ onNavigate, dark = true }: { onNavigate?: () => void; dark?: boolean }) {
    const heading = dark ? 'rgba(250,247,242,.45)' : MUTED
    const link = dark ? 'rgba(250,247,242,.88)' : INK
    const rule = dark ? 'rgba(250,247,242,.08)' : LINE
    return (
        <div style={{ fontFamily: SANS }}>
            {MARKETING_MENU.map(group => (
                <div key={group.label} style={{ padding: '14px 24px 6px', borderBottom: `1px solid ${rule}` }}>
                    <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: heading, fontWeight: 600, marginBottom: 4 }}>
                        {group.label}
                    </div>
                    {group.links.map(l => (
                        <a key={l.href} href={l.href} onClick={onNavigate} style={{ display: 'block', padding: '9px 0', fontSize: 15, color: link, textDecoration: 'none' }}>
                            {l.label}
                        </a>
                    ))}
                </div>
            ))}
            <a href={PRICING_HREF} onClick={onNavigate} style={{ display: 'block', padding: '16px 24px', fontSize: 15, color: link, textDecoration: 'none', borderBottom: `1px solid ${rule}` }}>
                Pricing
            </a>
        </div>
    )
}

/** Full light nav bar for the specialty, feature and switch pages. */
export function MarketingNav({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    return (
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: WARM }}>
            <nav className="aa-nav" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                padding: '18px 56px', borderBottom: `1px solid ${LINE}`,
            }}>
                <a href="/for-businesses" aria-label="AfroAllure for businesses" style={{ display: 'flex' }}>
                    <Image src={LOGO} alt="AfroAllure" width={130} />
                </a>
                <MarketingMenuDesktop />
                <div className="aa-nav-links" style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: SANS, fontSize: 14 }}>
                    {isLoggedIn ? (
                        <a href="/dashboard" style={{ color: INK, fontWeight: 600, textDecoration: 'none' }}>Dashboard →</a>
                    ) : (
                        <>
                            <a href="/login" style={{ color: INK, textDecoration: 'none' }}>Log in</a>
                            <a href="/register" style={{ background: DARK, color: '#fff', padding: '9px 18px', borderRadius: 999, textDecoration: 'none', fontWeight: 600 }}>
                                Start free
                            </a>
                        </>
                    )}
                </div>
                <button
                    type="button"
                    className="aa-menu-toggle"
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen(o => !o)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK, display: 'none' }}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>
            {mobileOpen && (
                <div style={{ background: '#fff', borderBottom: `1px solid ${LINE}`, maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
                    <MarketingMenuMobileLinks dark={false} onNavigate={() => setMobileOpen(false)} />
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: SANS }}>
                        {isLoggedIn ? (
                            <a href="/dashboard" style={{ textAlign: 'center', background: DARK, color: '#fff', padding: 14, borderRadius: 999, textDecoration: 'none', fontWeight: 600 }}>Dashboard →</a>
                        ) : (
                            <>
                                <a href="/register" style={{ textAlign: 'center', background: RED, color: '#fff', padding: 14, borderRadius: 999, textDecoration: 'none', fontWeight: 600 }}>Start free</a>
                                <a href="/login" style={{ textAlign: 'center', border: `1.5px solid ${LINE}`, color: INK, padding: 13, borderRadius: 999, textDecoration: 'none', fontWeight: 600 }}>Log in</a>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
