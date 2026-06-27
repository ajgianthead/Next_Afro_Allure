'use client'

import './dmBooking.css'
import { useEffect, useState } from 'react'
import { DmInboxDemo, AppointmentCreationDemo, DepositLinkDemo, ConfirmationDemo } from '@/components/marketing/demos'
import SignupModal from '@/components/marketing/SignupModal'

const RED   = '#FC6161'
const WARM  = '#FAF7F2'
const INK   = '#1A1818'
const MUTED = '#6F6863'
const LINE  = '#E8E2D6'
const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS  = "'Inter', system-ui, sans-serif"

const STEPS = [
    { n: '01', label: 'Client DMs you',             demo: <DmInboxDemo /> },
    { n: '02', label: 'You create the appointment', demo: <AppointmentCreationDemo /> },
    { n: '03', label: 'Deposit link sends itself',  demo: <DepositLinkDemo /> },
    { n: '04', label: 'Client pays. You\'re done.', demo: <ConfirmationDemo /> },
]

export default function DmBookingLandingClient() {
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('signup') === 'open') setModalOpen(true)
    }, [])

    return (
        <div style={{
            background: WARM, minHeight: '100vh', fontFamily: SANS,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
            <div className="dm-landing-inner" style={{
                width: '100%', maxWidth: 900, margin: '0 auto',
                padding: '48px 32px', textAlign: 'center',
            }}>

                <h1 className="dm-landing-h1" style={{
                    fontFamily: SERIF, fontWeight: 400,
                    fontSize: 'clamp(44px, 7vw, 80px)', lineHeight: .96,
                    letterSpacing: '-.04em', margin: '0 0 20px', color: INK,
                }}>
                    Book by DM.<br />
                    <em style={{ fontStyle: 'italic', color: RED }}>Get paid like a business.</em>
                </h1>

                <p className="dm-landing-sub" style={{
                    fontFamily: SANS, fontSize: 17, lineHeight: 1.55,
                    color: MUTED, margin: '0 auto 56px', maxWidth: 520,
                }}>
                    AfroAllure handles deposits, confirmations, and reminders automatically —
                    so you can stay in your DMs and stay paid.
                </p>

                {/* Steps with mobile scroll-hint arrow */}
                <div className="dm-steps-outer" style={{ position: 'relative', marginBottom: 52 }}>
                    <div
                        className="dm-landing-steps"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 16,
                        }}
                    >
                        {STEPS.map(s => (
                            <div key={s.n} style={{
                                background: '#fff', borderRadius: 16,
                                padding: '20px 16px 18px',
                                border: `1px solid ${LINE}`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                            }}>
                                {s.demo}
                                <div style={{
                                    fontFamily: SANS, fontSize: 12, fontWeight: 600,
                                    color: INK, lineHeight: 1.3, textAlign: 'center',
                                }}>
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Swipe indicator — only visible on mobile via CSS */}
                    <div className="dm-scroll-arrow" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </div>
                </div>

                <button
                    className="dm-landing-cta"
                    onClick={() => setModalOpen(true)}
                    style={{
                        background: RED, color: '#fff', border: 'none', cursor: 'pointer',
                        fontFamily: SANS, fontWeight: 600, fontSize: 17,
                        padding: '18px 44px', borderRadius: 999,
                        boxShadow: '0 8px 32px rgba(252,97,97,.3)',
                    }}
                >
                    Run my business →
                </button>
            </div>

            <SignupModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
    )
}
