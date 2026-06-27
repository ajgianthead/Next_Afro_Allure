'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import Image from 'next/image'
import LOGO from '../../../public/images/logo_transparent_background.png'

const RED   = '#FC6161'
const WARM  = '#FAF7F2'
const INK   = '#1A1818'
const MUTED = '#6F6863'
const LINE  = '#E8E2D6'
const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS  = "'Inter', system-ui, sans-serif"

export default function SetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }
        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        const supabase = createClient()
        const { error: updateError } = await supabase.auth.updateUser({ password })

        if (updateError) {
            setError(updateError.message)
            setLoading(false)
            return
        }

        setDone(true)
        setTimeout(() => router.push('/dashboard'), 1800)
    }

    return (
        <div style={{
            minHeight: '100vh', background: WARM,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px', fontFamily: SANS,
        }}>
            <a href="/" style={{ marginBottom: 40 }}>
                <Image src={LOGO} alt="AfroAllure" width={130} />
            </a>

            <div style={{
                background: '#fff', borderRadius: 20,
                padding: '44px 40px', width: '100%', maxWidth: 400,
                boxShadow: '0 8px 32px rgba(15,14,14,.08)',
            }}>
                {done ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                        <div style={{
                            fontFamily: SERIF, fontSize: 24, color: INK, marginBottom: 8,
                        }}>Password set!</div>
                        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>
                            Redirecting you to your dashboard…
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{
                            fontFamily: SERIF, fontSize: 26, color: INK,
                            marginBottom: 8, fontWeight: 400,
                        }}>
                            Create your password
                        </div>
                        <p style={{
                            fontFamily: SANS, fontSize: 14, color: MUTED,
                            margin: '0 0 28px', lineHeight: 1.5,
                        }}>
                            Choose a password for your AfroAllure account.
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{
                                    display: 'block', fontFamily: SANS, fontSize: 12,
                                    fontWeight: 600, color: INK, marginBottom: 6, letterSpacing: '.04em',
                                }}>
                                    New password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        border: `1.5px solid ${LINE}`, borderRadius: 10,
                                        padding: '12px 14px', fontFamily: SANS, fontSize: 15, color: INK,
                                        outline: 'none', background: WARM,
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block', fontFamily: SANS, fontSize: 12,
                                    fontWeight: 600, color: INK, marginBottom: 6, letterSpacing: '.04em',
                                }}>
                                    Confirm password
                                </label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    placeholder="Repeat password"
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        border: `1.5px solid ${LINE}`, borderRadius: 10,
                                        padding: '12px 14px', fontFamily: SANS, fontSize: 15, color: INK,
                                        outline: 'none', background: WARM,
                                    }}
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
                                disabled={loading || !password || !confirm}
                                style={{
                                    background: loading || !password || !confirm ? '#ccc' : RED,
                                    color: '#fff', border: 'none',
                                    cursor: loading ? 'wait' : 'pointer',
                                    fontFamily: SANS, fontWeight: 600, fontSize: 16,
                                    padding: '14px', borderRadius: 999, marginTop: 4,
                                }}
                            >
                                {loading ? 'Saving…' : 'Set password →'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
