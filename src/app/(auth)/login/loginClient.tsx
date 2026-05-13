'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle } from 'lucide-react'
import { loginBusinessUser } from '../actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export default function Login() {
    const router = useRouter()
    const [cred, setCred] = useState({ email: '', password: '' })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError(null)
        try {
            const res = await loginBusinessUser(cred.email, cred.password)
            if (res instanceof Error) {
                setError(res.message)
                setLoading(false)
                return
            }
            router.replace('/dashboard')
        } catch {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ backgroundColor: '#FAF7F2' }}
        >
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <p style={{ fontFamily: SERIF, fontSize: 26, color: '#0F0E0E', letterSpacing: '-0.01em' }}>
                        AfroAllure
                    </p>
                    <p className="mt-1 text-sm" style={{ color: '#6F6863' }}>
                        Sign in to your account
                    </p>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl p-8"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}
                >
                    <h1 style={{ fontFamily: SERIF, fontSize: 22, color: '#1A1818', marginBottom: 24 }}>
                        Welcome back
                    </h1>

                    {error && (
                        <div
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
                                value={cred.email}
                                onChange={e => setCred({ ...cred, email: e.target.value })}
                                disabled={loading}
                                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
                                style={{
                                    border: '1px solid #E8E2D6',
                                    backgroundColor: '#FDFCFA',
                                    color: '#1A1818',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#FC6161')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#E8E2D6')}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-xs font-semibold uppercase tracking-widest"
                                    style={{ color: '#6F6863' }}
                                >
                                    Password
                                </label>
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={cred.password}
                                onChange={e => setCred({ ...cred, password: e.target.value })}
                                disabled={loading}
                                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
                                style={{
                                    border: '1px solid #E8E2D6',
                                    backgroundColor: '#FDFCFA',
                                    color: '#1A1818',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#FC6161')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#E8E2D6')}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !cred.email || !cred.password}
                            className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: '#FC6161', color: '#FFFFFF', marginTop: 4 }}
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm mt-5" style={{ color: '#6F6863' }}>
                    Don't have an account?{' '}
                    <Link
                        href="/register"
                        className="font-medium transition-opacity hover:opacity-70"
                        style={{ color: '#FC6161' }}
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    )
}
