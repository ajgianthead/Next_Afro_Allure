'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertCircle, Mail } from 'lucide-react'
import { requestPasswordReset } from '../actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export default function ForgotPassword({ linkExpired }: { linkExpired?: boolean }) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(
        linkExpired ? 'That reset link has expired or was already used. Enter your email to get a new one.' : null
    )
    const [loading, setLoading] = useState(false)
    const [sentTo, setSentTo] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError(null)
        try {
            const res = await requestPasswordReset(email)
            if (!res.ok) setError(res.error)
            else setSentTo(email.trim())
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ backgroundColor: '#FAF7F2' }}
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <p style={{ fontFamily: SERIF, fontSize: 26, color: '#0F0E0E', letterSpacing: '-0.01em' }}>
                        AfroAllure
                    </p>
                </div>

                <div
                    className="rounded-2xl p-8"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}
                >
                    {sentTo ? (
                        <div className="text-center">
                            <Mail size={28} className="mx-auto mb-4" style={{ color: '#FC6161' }} />
                            <h1 style={{ fontFamily: SERIF, fontSize: 22, color: '#1A1818', marginBottom: 12 }}>
                                Check your email
                            </h1>
                            <p className="text-sm leading-relaxed" style={{ color: '#6F6863' }}>
                                If <strong style={{ color: '#1A1818' }}>{sentTo}</strong> has an AfroAllure account,
                                we sent it a link to reset your password. The link works once and expires in 24 hours.
                            </p>
                            <p className="text-xs leading-relaxed mt-4" style={{ color: '#6F6863' }}>
                                Don&apos;t see it? Check your spam or promotions folder.
                            </p>
                        </div>
                    ) : (
                        <>
                            <h1 style={{ fontFamily: SERIF, fontSize: 22, color: '#1A1818', marginBottom: 8 }}>
                                Reset your password
                            </h1>
                            <p className="text-sm mb-6" style={{ color: '#6F6863' }}>
                                Enter the email you signed up with and we&apos;ll send you a link to choose a new password.
                            </p>

                            {error && (
                                <div
                                    role="alert"
                                    className="flex items-center gap-2 text-sm rounded-xl px-3.5 py-3 mb-5"
                                    style={{ backgroundColor: 'rgba(252,97,97,0.08)', color: '#DC2626' }}
                                >
                                    <AlertCircle size={14} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="email"
                                        className="text-xs font-semibold uppercase tracking-widest"
                                        style={{ color: '#6F6863' }}
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
                                        style={{ border: '1px solid #E8E2D6', backgroundColor: '#FDFCFA', color: '#1A1818' }}
                                        onFocus={e => (e.currentTarget.style.borderColor = '#FC6161')}
                                        onBlur={e => (e.currentTarget.style.borderColor = '#E8E2D6')}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                                >
                                    {loading && <Loader2 size={14} className="animate-spin" />}
                                    {loading ? 'Sending…' : 'Send reset link'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-sm mt-5" style={{ color: '#6F6863' }}>
                    Remembered it?{' '}
                    <Link href="/login" className="font-medium transition-opacity hover:opacity-70" style={{ color: '#FC6161' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    )
}
