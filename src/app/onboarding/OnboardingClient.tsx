'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './actions'

const RED   = '#FC6161'
const WARM  = '#FAF7F2'
const INK   = '#1A1818'
const MUTED = '#6F6863'
const LINE  = '#E8E2D6'
const DARK  = '#0F0E0E'
const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS  = "'Inter', system-ui, sans-serif"
const MONO  = "ui-monospace, 'SF Mono', Menlo, monospace"

const SPECIALTIES = [
    'Box Braids', 'Knotless Braids', 'Locs', 'Twists',
    'Natural Hair', 'Wigs & Extensions', 'Relaxed Hair',
    'Makeup', 'Eyelashes', 'Nails', 'Skincare', 'Other',
]

const DURATIONS = [
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
    { label: '4 hours', value: 240 },
    { label: '5 hours', value: 300 },
    { label: '6 hours', value: 360 },
    { label: '8 hours', value: 480 },
]

interface Props {
    businessId: string
    businessName: string
}

function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
            {Array.from({ length: total }, (_, i) => (
                <div key={i} style={{
                    height: 4, flex: 1, borderRadius: 99,
                    background: i < current ? RED : LINE,
                    opacity: i < current ? 1 : 0.3,
                }} />
            ))}
        </div>
    )
}

export default function OnboardingClient({ businessId, businessName }: Props) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [specialty, setSpecialty] = useState('')
    const [city, setCity] = useState('')
    const [serviceName, setServiceName] = useState('')
    const [servicePrice, setServicePrice] = useState('')
    const [serviceDuration, setServiceDuration] = useState(120)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function finishOnboarding() {
        setError(null)
        const price = parseFloat(servicePrice)
        if (!serviceName.trim() || isNaN(price) || price <= 0) {
            setError('Please fill in all service details.')
            return
        }

        setLoading(true)
        const result = await completeOnboarding(
            businessId,
            specialty,
            city,
            serviceName.trim(),
            price,
            serviceDuration
        )

        if ('error' in result) {
            setError(result.error)
            setLoading(false)
            return
        }

        router.push('/dashboard/appointments?tour=manual-booking')
    }

    const firstName = businessName.split(' ')[0]

    return (
        <div style={{
            minHeight: '100vh', background: WARM, fontFamily: SANS,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '48px 24px',
        }}>
            <div style={{
                fontFamily: SERIF, fontSize: 20, color: INK, letterSpacing: '-.02em',
                marginBottom: 56, fontWeight: 400,
            }}>
                AfroAllure
            </div>

            <div style={{ width: '100%', maxWidth: 480 }}>
                <StepIndicator current={step} total={3} />

                {/* ── Step 1: Specialty ── */}
                {step === 1 && (
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.18em',
                            textTransform: 'uppercase', color: MUTED, marginBottom: 12,
                        }}>
                            Step 1 of 3
                        </div>
                        <h1 style={{
                            fontFamily: SERIF, fontSize: 'clamp(28px, 5vw, 38px)',
                            fontWeight: 400, color: INK, margin: '0 0 8px', lineHeight: 1.1,
                        }}>
                            What do you specialize in, {firstName}?
                        </h1>
                        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: '0 0 32px', lineHeight: 1.5 }}>
                            Pick your main service. You can add more later.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                            {SPECIALTIES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSpecialty(s)}
                                    style={{
                                        fontFamily: SANS, fontSize: 14, fontWeight: 500,
                                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                                        border: specialty === s ? `2px solid ${RED}` : `1.5px solid ${LINE}`,
                                        background: specialty === s ? 'rgba(252,97,97,.06)' : '#fff',
                                        color: specialty === s ? RED : INK,
                                        textAlign: 'left', transition: 'all .12s',
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!specialty}
                            style={{
                                marginTop: 28, width: '100%',
                                background: specialty ? RED : '#ccc', color: '#fff',
                                border: 'none', cursor: specialty ? 'pointer' : 'default',
                                fontFamily: SANS, fontWeight: 600, fontSize: 16,
                                padding: '15px', borderRadius: 999,
                            }}
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {/* ── Step 2: City ── */}
                {step === 2 && (
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.18em',
                            textTransform: 'uppercase', color: MUTED, marginBottom: 12,
                        }}>
                            Step 2 of 3
                        </div>
                        <h1 style={{
                            fontFamily: SERIF, fontSize: 'clamp(28px, 5vw, 38px)',
                            fontWeight: 400, color: INK, margin: '0 0 8px', lineHeight: 1.1,
                        }}>
                            Where are you based?
                        </h1>
                        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: '0 0 32px', lineHeight: 1.5 }}>
                            Clients will see this on your booking page.
                        </p>

                        <input
                            type="text"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && city.trim()) setStep(3) }}
                            placeholder="Miami, FL"
                            autoFocus
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                border: `1.5px solid ${LINE}`, borderRadius: 12,
                                padding: '16px 18px', fontFamily: SANS, fontSize: 16, color: INK,
                                outline: 'none', background: '#fff', marginBottom: 24,
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = RED }}
                            onBlur={e => { e.currentTarget.style.borderColor = LINE }}
                        />

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    flex: 1, background: 'none', color: MUTED,
                                    border: `1.5px solid ${LINE}`, cursor: 'pointer',
                                    fontFamily: SANS, fontWeight: 600, fontSize: 15,
                                    padding: '14px', borderRadius: 999,
                                }}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!city.trim()}
                                style={{
                                    flex: 2, background: city.trim() ? RED : '#ccc', color: '#fff',
                                    border: 'none', cursor: city.trim() ? 'pointer' : 'default',
                                    fontFamily: SANS, fontWeight: 600, fontSize: 16,
                                    padding: '14px', borderRadius: 999,
                                }}
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: First Service ── */}
                {step === 3 && (
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.18em',
                            textTransform: 'uppercase', color: MUTED, marginBottom: 12,
                        }}>
                            Step 3 of 3
                        </div>
                        <h1 style={{
                            fontFamily: SERIF, fontSize: 'clamp(28px, 5vw, 38px)',
                            fontWeight: 400, color: INK, margin: '0 0 8px', lineHeight: 1.1,
                        }}>
                            Add your first service.
                        </h1>
                        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: '0 0 32px', lineHeight: 1.5 }}>
                            You can edit and add more from the dashboard.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{
                                    display: 'block', fontFamily: SANS, fontSize: 12,
                                    fontWeight: 600, color: INK, marginBottom: 8, letterSpacing: '.04em',
                                }}>
                                    Service name
                                </label>
                                <input
                                    type="text"
                                    value={serviceName}
                                    onChange={e => setServiceName(e.target.value)}
                                    placeholder={specialty || 'Box Braids'}
                                    autoFocus
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        border: `1.5px solid ${LINE}`, borderRadius: 12,
                                        padding: '14px 16px', fontFamily: SANS, fontSize: 15, color: INK,
                                        outline: 'none', background: '#fff',
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = RED }}
                                    onBlur={e => { e.currentTarget.style.borderColor = LINE }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block', fontFamily: SANS, fontSize: 12,
                                    fontWeight: 600, color: INK, marginBottom: 8, letterSpacing: '.04em',
                                }}>
                                    Price (USD)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                                        fontFamily: SANS, fontSize: 15, color: MUTED, pointerEvents: 'none',
                                    }}>$</span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={servicePrice}
                                        onChange={e => setServicePrice(e.target.value)}
                                        placeholder="150"
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            border: `1.5px solid ${LINE}`, borderRadius: 12,
                                            padding: '14px 16px 14px 30px', fontFamily: SANS, fontSize: 15, color: INK,
                                            outline: 'none', background: '#fff',
                                        }}
                                        onFocus={e => { e.currentTarget.style.borderColor = RED }}
                                        onBlur={e => { e.currentTarget.style.borderColor = LINE }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block', fontFamily: SANS, fontSize: 12,
                                    fontWeight: 600, color: INK, marginBottom: 8, letterSpacing: '.04em',
                                }}>
                                    Duration
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {DURATIONS.map(d => (
                                        <button
                                            key={d.value}
                                            onClick={() => setServiceDuration(d.value)}
                                            style={{
                                                fontFamily: SANS, fontSize: 13, fontWeight: 500,
                                                padding: '9px 16px', borderRadius: 99, cursor: 'pointer',
                                                border: serviceDuration === d.value ? `2px solid ${RED}` : `1.5px solid ${LINE}`,
                                                background: serviceDuration === d.value ? 'rgba(252,97,97,.07)' : '#fff',
                                                color: serviceDuration === d.value ? RED : INK,
                                            }}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p style={{
                                fontFamily: SANS, fontSize: 13, color: RED,
                                margin: '20px 0 0', padding: '10px 14px',
                                background: 'rgba(252,97,97,.08)', borderRadius: 8,
                            }}>
                                {error}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                            <button
                                onClick={() => setStep(2)}
                                style={{
                                    flex: 1, background: 'none', color: MUTED,
                                    border: `1.5px solid ${LINE}`, cursor: 'pointer',
                                    fontFamily: SANS, fontWeight: 600, fontSize: 15,
                                    padding: '14px', borderRadius: 999,
                                }}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={finishOnboarding}
                                disabled={loading || !serviceName.trim() || !servicePrice}
                                style={{
                                    flex: 2,
                                    background: loading || !serviceName.trim() || !servicePrice ? '#ccc' : DARK,
                                    color: '#fff', border: 'none',
                                    cursor: loading ? 'wait' : 'pointer',
                                    fontFamily: SANS, fontWeight: 600, fontSize: 16,
                                    padding: '14px', borderRadius: 999,
                                }}
                            >
                                {loading ? 'Saving…' : 'Take me to my dashboard →'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
