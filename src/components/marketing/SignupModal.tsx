'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createAdFunnelUser } from '@/app/(marketing)/dm-booking/signupActions'

const RED   = '#FC6161'
const WARM  = '#FAF7F2'
const INK   = '#1A1818'
const MUTED = '#6F6863'
const LINE  = '#E8E2D6'
const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS  = "'Inter', system-ui, sans-serif"

interface Props {
    open: boolean
    onClose: () => void
}

export default function SignupModal({ open, onClose }: Props) {
    const [businessName, setBusinessName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (open) {
            setError(null)
            setTimeout(() => nameRef.current?.focus(), 60)
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', h)
        return () => document.removeEventListener('keydown', h)
    }, [open, onClose])

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    if (!open) return null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const result = await createAdFunnelUser(email, businessName)

        if ('error' in result) {
            setError(result.error)
            setLoading(false)
            return
        }

        router.push('/onboarding')
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(15,14,14,.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px',
                backdropFilter: 'blur(4px)',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 24,
                    padding: '48px 44px',
                    width: '100%', maxWidth: 440,
                    boxShadow: '0 24px 80px rgba(15,14,14,.24)',
                    position: 'relative',
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: 'absolute', top: 18, right: 18,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: MUTED, fontSize: 22, lineHeight: 1, padding: 4,
                    }}
                >×</button>

                <div style={{
                    fontFamily: SERIF, fontSize: 28, fontWeight: 400,
                    color: INK, lineHeight: 1.15, marginBottom: 8,
                }}>
                    Your business, managed.
                </div>
                <p style={{
                    fontFamily: SANS, fontSize: 14, color: MUTED,
                    margin: '0 0 32px', lineHeight: 1.5,
                }}>
                    Deposits, confirmations, and reminders — all handled for you.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{
                            display: 'block', fontFamily: SANS, fontSize: 12,
                            fontWeight: 600, color: INK, marginBottom: 6,
                            letterSpacing: '.04em',
                        }}>
                            Business name
                        </label>
                        <input
                            ref={nameRef}
                            type="text"
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            placeholder="Imani's Beauty Studio"
                            required
                            disabled={loading}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                border: `1.5px solid ${LINE}`, borderRadius: 10,
                                padding: '12px 14px', fontFamily: SANS, fontSize: 15, color: INK,
                                outline: 'none', background: WARM,
                                transition: 'border-color .15s',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = RED }}
                            onBlur={e => { e.currentTarget.style.borderColor = LINE }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block', fontFamily: SANS, fontSize: 12,
                            fontWeight: 600, color: INK, marginBottom: 6,
                            letterSpacing: '.04em',
                        }}>
                            Email address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                border: `1.5px solid ${LINE}`, borderRadius: 10,
                                padding: '12px 14px', fontFamily: SANS, fontSize: 15, color: INK,
                                outline: 'none', background: WARM,
                                transition: 'border-color .15s',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = RED }}
                            onBlur={e => { e.currentTarget.style.borderColor = LINE }}
                        />
                    </div>

                    {error && (
                        <p style={{
                            fontFamily: SANS, fontSize: 13, color: RED,
                            margin: 0, padding: '10px 14px',
                            background: 'rgba(252,97,97,.08)', borderRadius: 8,
                        }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !businessName.trim() || !email.trim()}
                        style={{
                            background: loading || !businessName.trim() || !email.trim() ? '#ccc' : RED,
                            color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer',
                            fontFamily: SANS, fontWeight: 600, fontSize: 16,
                            padding: '15px', borderRadius: 999, marginTop: 4,
                            transition: 'background .15s',
                        }}
                    >
                        {loading ? 'Setting things up…' : 'Set it up →'}
                    </button>
                </form>

            </div>
        </div>
    )
}
