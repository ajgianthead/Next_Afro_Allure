import Link from 'next/link'

export const metadata = {
    title: 'Privacy Policy | AfroAllure',
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

export default function PrivacyPolicyPage() {
    return (
        <main className="bg-white min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-16" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p className="text-xs uppercase tracking-widest text-[#A09790] mb-3">Legal</p>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-2">Privacy Policy</h1>
                <p className="text-sm text-[#6F6863] mb-10">Effective September 30, 2026</p>

                <p className="text-[15px] leading-relaxed text-[#3A3634]">
                    AfroAllure LLC (&ldquo;AfroAllure,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), located in Gainesville, FL 32608,
                    respects your privacy. This Privacy Policy explains what information we collect, how we use it, who we share it
                    with, and the rights you have over your data when you use the AfroAllure platform (the &ldquo;Services&rdquo;).
                </p>

                <Section title="1. Information We Collect">
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li><strong>Account &amp; business information:</strong> your name, email address, business name, and related profile details.</li>
                        <li><strong>Payment information:</strong> processed and stored by Stripe, our payment processor — AfroAllure never stores full card numbers.</li>
                        <li><strong>Usage data:</strong> pages viewed, actions taken, device and browser information, collected via Google Analytics 4 (GA4), only after you consent to analytics cookies.</li>
                        <li><strong>Booking &amp; transaction data:</strong> appointment details, payment history, and client communications you manage through the platform.</li>
                    </ul>
                </Section>

                <Section title="2. How We Use Your Information">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li>Operate, maintain, and run the AfroAllure platform</li>
                        <li>Process bookings, subscriptions, and payments</li>
                        <li>Send you transactional and, where you&rsquo;ve opted in, marketing emails</li>
                        <li>Analyze usage to improve the Services</li>
                        <li>Detect, investigate, and prevent fraud or abuse</li>
                    </ul>
                </Section>

                <Section title="3. Who We Share Data With">
                    <p>We do not sell your personal information. We share data only with the service providers that help us run AfroAllure:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li><strong>Stripe</strong> — payment processing and payouts</li>
                        <li><strong>Supabase</strong> — database and authentication infrastructure</li>
                        <li><strong>Resend</strong> — transactional and marketing email delivery</li>
                        <li><strong>Vercel</strong> — application hosting</li>
                        <li><strong>Google Analytics</strong> — usage analytics, only after cookie consent</li>
                    </ul>
                </Section>

                <Section title="4. Data Retention">
                    <p>
                        We retain your information for as long as your account is active, and for up to two (2) years afterward to
                        meet legal, accounting, and dispute-resolution obligations. You may request earlier deletion — see Section 8.
                    </p>
                </Section>

                <Section title="5. Your Rights Under CCPA">
                    <p>If you are a California resident, you have the right to:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li>Know what personal information we collect, use, and disclose</li>
                        <li>Request deletion of your personal information</li>
                        <li>Opt out of the sale of personal information (we do not sell personal information)</li>
                    </ul>
                </Section>

                <Section title="6. Your Rights Under GDPR">
                    <p>If you are located in the European Economic Area, you have the right to:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li>Access the personal data we hold about you</li>
                        <li>Rectify inaccurate personal data</li>
                        <li>Erase your personal data</li>
                        <li>Receive your data in a portable format</li>
                    </ul>
                </Section>

                <Section title="7. Children's Privacy (COPPA)">
                    <p>
                        AfroAllure is not directed at, and does not knowingly collect personal information from, children under 13.
                        If you believe a child has provided us personal information, contact us and we will delete it.
                    </p>
                </Section>

                <Section title="8. Cookies">
                    <p>
                        We use strictly necessary cookies to keep you signed in, and Google Analytics 4 (GA4) cookies for analytics —
                        the latter only after you consent via our cookie banner. See our{' '}
                        <Link href="/cookies" className="underline text-[#0F0E0E]">Cookie Policy</Link> for details.
                    </p>
                </Section>

                <Section title="9. Contact Us">
                    <p>
                        For privacy questions, data access requests, or to exercise any of the rights above, contact us at{' '}
                        <a href="mailto:privacy@afroallure.co" className="underline text-[#0F0E0E]">privacy@afroallure.co</a>,
                        or visit our <Link href="/data-deletion" className="underline text-[#0F0E0E]">data deletion request page</Link>.
                    </p>
                    <p>AfroAllure LLC · Gainesville, FL 32608</p>
                </Section>
            </div>
        </main>
    )
}
