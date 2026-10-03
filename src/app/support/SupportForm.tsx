'use client'

import { useState } from 'react'
import { submitSupportTicket } from '../feedback/actions'

export default function SupportForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const result = await submitSupportTicket(formData)
        setLoading(false)
        if (result && 'error' in result) {
            setError(result.error)
            return
        }
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <p className="text-[15px] leading-relaxed text-[#3A3634]" role="status">
                We got your message and will respond within 1 business day.
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
                <label htmlFor="st-subject" className="text-xs font-semibold uppercase tracking-widest text-[#6F6863]">
                    Subject
                </label>
                <input
                    id="st-subject"
                    name="subject"
                    type="text"
                    required
                    disabled={loading}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{ border: '1px solid #E8E2D6', backgroundColor: '#FDFCFA', color: '#1A1818' }}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="st-message" className="text-xs font-semibold uppercase tracking-widest text-[#6F6863]">
                    Message
                </label>
                <textarea
                    id="st-message"
                    name="message"
                    required
                    rows={5}
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
                {loading ? 'Sending…' : 'Submit Ticket'}
            </button>
        </form>
    )
}
