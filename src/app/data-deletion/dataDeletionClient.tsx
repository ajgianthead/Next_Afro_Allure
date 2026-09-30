'use client'

import { useState } from 'react'
import { submitDataDeletionRequest } from './actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export default function DataDeletionClient() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const result = await submitDataDeletionRequest(name, email, reason)
        setLoading(false)
        if ('error' in result) {
            setError(result.error)
            return
        }
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <p className="text-[15px] leading-relaxed text-[#3A3634]" role="status">
                We received your request and will respond within 30 days.
            </p>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            {error && (
                <div role="alert" className="text-sm rounded-lg px-3.5 py-3" style={{ backgroundColor: 'rgba(252,97,97,0.08)', color: '#DC2626' }}>
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label htmlFor="dd-name" className="text-xs font-semibold uppercase tracking-widest text-[#6F6863]">
                    Name
                </label>
                <input
                    id="dd-name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{ border: '1px solid #E8E2D6', backgroundColor: '#FDFCFA', color: '#1A1818' }}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="dd-email" className="text-xs font-semibold uppercase tracking-widest text-[#6F6863]">
                    Email
                </label>
                <input
                    id="dd-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{ border: '1px solid #E8E2D6', backgroundColor: '#FDFCFA', color: '#1A1818' }}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="dd-reason" className="text-xs font-semibold uppercase tracking-widest text-[#6F6863]">
                    Reason <span className="font-normal normal-case">(optional)</span>
                </label>
                <textarea
                    id="dd-reason"
                    rows={4}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
                    style={{ border: '1px solid #E8E2D6', backgroundColor: '#FDFCFA', color: '#1A1818' }}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
            >
                {loading ? 'Sending…' : 'Submit Request'}
            </button>
        </form>
    )
}
