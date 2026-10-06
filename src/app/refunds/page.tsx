import Link from 'next/link'

export const metadata = {
    title: 'Refund Policy | AfroAllure',
}

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-2 mt-8">
            <h2 style={{ fontFamily: SERIF }} className="text-xl text-[#1A1818]">{title}</h2>
            <div className="text-[15px] leading-relaxed text-[#3A3634] flex flex-col gap-3">{children}</div>
        </section>
    )
}

export default function RefundPolicyPage() {
    return (
        <main className="bg-white min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-16" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p className="text-xs uppercase tracking-widest text-[#A09790] mb-3">Legal</p>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-2">Refund Policy</h1>
                <p className="text-sm text-[#6F6863] mb-10">Effective October 6, 2026</p>

                <Section title="1. Subscription Fees">
                    <p>
                        Subscription fees are non-refundable once your subscription period has started, except that you may
                        request a full refund within 48 hours of being charged by contacting billing.
                    </p>
                </Section>

                <Section title="2. Annual Plans">
                    <p>
                        If you subscribe to an annual plan and cancel within the first 30 days, we will issue a pro-rated refund
                        for the unused portion of your subscription term.
                    </p>
                </Section>

                <Section title="3. Booking Transaction Fees">
                    <p>
                        The fees taken from booking payments — the card processing fee (Stripe&rsquo;s 2.9% + $0.30, passed through at
                        cost) and, on the Starter plan, the 1% platform fee — are non-refundable once a payment has been processed, regardless of whether the
                        underlying appointment is later cancelled or refunded by you to your client. Stripe does not return its
                        processing fee on refunds.
                    </p>
                </Section>

                <Section title="4. How to Request a Refund">
                    <p>
                        To request a refund, email{' '}
                        <a href="mailto:billing@afroallure.co" className="underline text-[#0F0E0E]">billing@afroallure.co</a>{' '}
                        within 48 hours of the charge in question, including your account email and the date of the charge.
                    </p>
                    <p>
                        See also our <Link href="/terms" className="underline text-[#0F0E0E]">Terms of Service</Link> for how
                        the platform fee is calculated.
                    </p>
                    <p>AfroAllure LLC · Gainesville, FL 32608</p>
                </Section>
            </div>
        </main>
    )
}
