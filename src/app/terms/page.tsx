import Link from 'next/link'

export const metadata = {
    title: 'Terms of Service | AfroAllure',
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

export default function TermsOfServicePage() {
    return (
        <main className="bg-white min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-16" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p className="text-xs uppercase tracking-widest text-[#A09790] mb-3">Legal</p>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-2">Terms of Service</h1>
                <p className="text-sm text-[#6F6863] mb-10">Effective October 6, 2026</p>

                <p className="text-[15px] leading-relaxed text-[#3A3634]">
                    These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the AfroAllure platform, operated by AfroAllure LLC
                    (&ldquo;AfroAllure,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). AfroAllure is a B2B software-as-a-service platform built for Black
                    beauty professionals to manage bookings, clients, and payments. By creating an account, you agree to these Terms.
                </p>

                <Section title="1. Eligibility">
                    <p>You must be at least 18 years old to create an AfroAllure account or use the Services.</p>
                </Section>

                <Section title="2. Subscription Plans">
                    <p>
                        AfroAllure offers a free Starter plan and a paid Growth plan, billed monthly or yearly. New accounts
                        start with a free 30-day Growth trial that does not require a payment method; if no plan is chosen by
                        the end of the trial, the account moves to Starter. Plan features and pricing are described at checkout
                        and in your account dashboard, and may change with notice. A price change never affects a rate we have
                        told you is locked for as long as your subscription stays active.
                    </p>
                </Section>

                <Section title="3. Platform Fee on Bookings">
                    <p>
                        On the Growth plan, AfroAllure charges no platform fee on booking payments. On the free Starter plan,
                        AfroAllure charges a 1% platform fee on each booking payment processed through the platform via Stripe
                        Connect. On every plan, Stripe&rsquo;s card processing fee (2.9% + $0.30 per payment) is passed through to
                        you at cost, with no markup. These fees are deducted from the payout to your connected Stripe account.
                        Payments you collect in cash outside the platform have no fees.
                    </p>
                    <p>
                        Standard payouts to your bank are free. Instant payouts are optional: each one costs 1.75% of the amount
                        paid out (minimum $1.00), deducted from that payout, and the fee is shown before you confirm it.
                    </p>
                </Section>

                <Section title="4. No Guarantee of Bookings or Revenue">
                    <p>
                        AfroAllure provides tools to help you manage and grow your business. We do not guarantee any specific number
                        of bookings, amount of revenue, or business outcome from using the Services.
                    </p>
                </Section>

                <Section title="5. Your Business, Your Taxes">
                    <p>
                        You are solely responsible for determining, collecting, reporting, and remitting any taxes applicable to your
                        own business and the services you sell through AfroAllure.
                    </p>
                </Section>

                <Section title="6. Limitation of Liability">
                    <p>
                        To the maximum extent permitted by law, AfroAllure is not liable for any indirect, incidental, special, or
                        consequential damages, and our total liability to you for any claim arising from these Terms or the Services
                        will not exceed the fees you paid to AfroAllure in the 12 months preceding the claim.
                    </p>
                </Section>

                <Section title="7. Copyright &amp; DMCA">
                    <p>
                        If you believe content on AfroAllure infringes your copyright, send a takedown notice to{' '}
                        <a href="mailto:dmca@afroallure.co" className="underline text-[#0F0E0E]">dmca@afroallure.co</a> with a
                        description of the work, the infringing material&rsquo;s location, and your contact information.
                    </p>
                </Section>

                <Section title="8. Governing Law &amp; Disputes">
                    <p>
                        These Terms are governed by the laws of the State of Florida, without regard to conflict-of-law principles.
                        Any dispute arising from these Terms or the Services will be resolved exclusively in the state or federal
                        courts located in Alachua County, Florida, and you consent to their jurisdiction.
                    </p>
                </Section>

                <Section title="9. Changes to These Terms">
                    <p>
                        We may update these Terms from time to time. Continued use of the Services after an update constitutes
                        acceptance of the revised Terms.
                    </p>
                </Section>

                <Section title="10. Contact Us">
                    <p>
                        Questions about these Terms? Contact us at{' '}
                        <a href="mailto:privacy@afroallure.co" className="underline text-[#0F0E0E]">privacy@afroallure.co</a>.
                        See also our <Link href="/privacy" className="underline text-[#0F0E0E]">Privacy Policy</Link> and{' '}
                        <Link href="/refunds" className="underline text-[#0F0E0E]">Refund Policy</Link>.
                    </p>
                    <p>AfroAllure LLC · Gainesville, FL 32608</p>
                </Section>
            </div>
        </main>
    )
}
