import { createClient } from '@/app/utils/supabase/server'
import Image from 'next/image'
import LOGO from '../../../public/images/logo_transparent_background.png'

const GOLD = '#C9974A'
const INK = '#1A1818'
const WARM = '#FAF7F2'
const MUTED = '#6F6863'
const LINE = '#E8E2D6'
const DARK = '#0F0E0E'
const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS = "'Inter', system-ui, sans-serif"
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace"

interface FoundingMember {
    business_name: string
    url_name: string
    founding_member_number: number
    founding_member_since: string | null
    account_settings: { business_address?: { city?: string; state?: string } } | null
}

async function getFoundingMembers(): Promise<FoundingMember[]> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('business_users')
        .select('business_name, url_name, founding_member_number, founding_member_since, account_settings')
        .eq('founding_member', true)
        .order('founding_member_number', { ascending: true })
    return (data ?? []) as FoundingMember[]
}

export default async function FoundingMembersPage() {
    const members = await getFoundingMembers()

    return (
        <div style={{ background: WARM, minHeight: '100vh', fontFamily: SANS }}>
            {/* Nav */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 56px',
                borderBottom: `1px solid ${LINE}`,
                background: WARM,
            }}>
                <a href="/" style={{ display: 'flex' }}>
                    <Image src={LOGO} alt="AfroAllure" width={130} />
                </a>
                <a href="/for-businesses" style={{
                    fontFamily: SANS, fontWeight: 600, fontSize: 13,
                    color: INK, border: `1.5px solid ${LINE}`,
                    padding: '9px 18px', borderRadius: 999, textDecoration: 'none',
                }}>
                    For Businesses →
                </a>
            </nav>

            {/* Header */}
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px 56px', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(201,151,74,0.12)', color: GOLD,
                    fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
                    padding: '7px 14px', borderRadius: 999, fontWeight: 700, marginBottom: 28,
                }}>
                    ✦ Founding Members
                </div>

                <h1 style={{
                    fontFamily: SERIF, fontWeight: 400,
                    fontSize: 'clamp(42px, 6vw, 72px)', lineHeight: 1,
                    letterSpacing: '-.03em', margin: '0 0 20px', color: INK,
                }}>
                    The first 250.
                </h1>

                <p style={{
                    fontFamily: SANS, fontSize: 17, lineHeight: 1.6,
                    color: MUTED, margin: '0 auto', maxWidth: 520,
                }}>
                    These professionals joined AfroAllure before there was a crowd.
                    Their rate is locked forever. Their spot in the marketplace is first.
                </p>

                <div style={{
                    display: 'inline-flex', alignItems: 'baseline', gap: 6,
                    marginTop: 32,
                    fontFamily: MONO, fontSize: 13, color: MUTED, letterSpacing: '.08em',
                }}>
                    <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 500, color: INK }}>
                        {members.length}
                    </span>
                    <span>/ 250 spots claimed</span>
                </div>
            </div>

            {/* Members grid */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
                {members.length === 0 ? (
                    <p style={{ textAlign: 'center', color: MUTED, fontFamily: SANS, fontSize: 15 }}>
                        No founding members yet. Be the first.
                    </p>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 16,
                    }}>
                        {members.map((m) => {
                            const padded = String(m.founding_member_number).padStart(3, '0')
                            const city = m.account_settings?.business_address?.city
                            const state = m.account_settings?.business_address?.state
                            const location = city && state ? `${city}, ${state}` : city ?? state ?? null

                            return (
                                <a
                                    key={m.founding_member_number}
                                    href={`/business/${m.url_name}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div style={{
                                        background: '#fff',
                                        border: `1px solid ${LINE}`,
                                        borderRadius: 16,
                                        padding: '24px 24px 20px',
                                        display: 'flex', flexDirection: 'column', gap: 10,
                                        transition: 'box-shadow .15s',
                                        cursor: 'pointer',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(15,14,14,.14)')}
                                        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{
                                                fontFamily: MONO, fontSize: 10, letterSpacing: '.16em',
                                                textTransform: 'uppercase', color: GOLD, fontWeight: 700,
                                            }}>
                                                #{padded}
                                            </span>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                background: 'rgba(201,151,74,0.1)', color: GOLD,
                                                fontFamily: MONO, fontSize: 9, letterSpacing: '.14em',
                                                textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999,
                                                fontWeight: 700,
                                            }}>
                                                ✦ Founding
                                            </span>
                                        </div>

                                        <div>
                                            <p style={{
                                                fontFamily: SERIF, fontSize: 18, fontWeight: 500,
                                                color: INK, margin: 0, lineHeight: 1.2,
                                            }}>
                                                {m.business_name}
                                            </p>
                                            {location && (
                                                <p style={{
                                                    fontFamily: SANS, fontSize: 12, color: MUTED,
                                                    margin: '4px 0 0',
                                                }}>
                                                    {location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </a>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer style={{
                background: DARK, color: WARM, padding: '40px 56px',
                borderTop: '1px solid rgba(250,247,242,.08)',
                textAlign: 'center',
            }}>
                <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(250,247,242,.5)', margin: 0 }}>
                    © {new Date().getFullYear()} AfroAllure, Inc. · Built with care · Atlanta &amp; everywhere
                </p>
            </footer>
        </div>
    )
}
