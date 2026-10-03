import Link from 'next/link'

export const metadata = {
    title: 'Beta Participation Agreement | AfroAllure',
}

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-2 mt-8">
            <h2 style={{ fontFamily: SERIF }} className="text-xl text-[#1A1818] font-bold">{title}</h2>
            <div className="text-[15px] leading-relaxed text-[#3A3634] flex flex-col gap-3">{children}</div>
        </section>
    )
}

export default function BetaParticipationAgreementPage() {
    return (
        <main className="bg-white min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-16" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p className="text-xs uppercase tracking-widest text-[#A09790] mb-3">Legal</p>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-2">
                    AfroAllure Beta Participation Agreement
                </h1>
                <div className="flex flex-col gap-1 mb-10">
                    <p className="text-sm text-[#6F6863]">Effective Date: September 30, 2026</p>
                    <p className="text-sm text-[#6F6863]">Last Updated: September 30, 2026</p>
                </div>

                <p className="text-[15px] leading-relaxed text-[#3A3634]">
                    This Beta Participation Agreement (&ldquo;Agreement&rdquo;) is between you (&ldquo;Participant,&rdquo; &ldquo;you,&rdquo; or
                    &ldquo;your&rdquo;) and AfroAllure, LLC, a Florida limited liability company (&ldquo;AfroAllure,&rdquo; &ldquo;we,&rdquo;
                    &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By accessing or using the AfroAllure beta platform (&ldquo;Beta&rdquo;), you agree to
                    the following:
                </p>

                <Section title="1. Purpose of Beta">
                    <p>
                        The Beta is a pre-release version of AfroAllure provided for testing, evaluation, and feedback purposes
                        only. Features may be incomplete, contain errors, or change without notice.
                    </p>
                </Section>

                <Section title="2. License & Restrictions">
                    <p>
                        We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Beta
                        solely for its intended purpose. You may not:
                    </p>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li>Copy, modify, or distribute the Beta</li>
                        <li>Reverse engineer or attempt to extract source code</li>
                        <li>Use the Beta for illegal purposes or to harm others</li>
                    </ul>
                </Section>

                <Section title="3. Data Collection">
                    <p>
                        By participating in the Beta, you consent to AfroAllure collecting usage data, feedback, and platform
                        activity to improve the service, as described in our Privacy Policy at{' '}
                        <Link href="/privacy" className="underline text-[#0F0E0E]">beta.afroallure.co/privacy</Link>.
                    </p>
                </Section>

                <Section title="4. Disclaimer of Warranties">
                    <p>
                        The Beta is provided &ldquo;AS IS&rdquo; without warranties of any kind. AfroAllure disclaims all express or
                        implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.
                    </p>
                </Section>

                <Section title="5. Limitation of Liability">
                    <p>
                        To the fullest extent permitted by law, AfroAllure is not liable for any damages, including loss of
                        data, profits, or business opportunities, arising from your participation in the Beta.
                    </p>
                </Section>

                <Section title="6. Feedback">
                    <p>
                        Any feedback you provide becomes AfroAllure&rsquo;s property, and we may use it without obligation to you.
                    </p>
                </Section>

                <Section title="7. Termination">
                    <p>
                        We may suspend or terminate your Beta access at any time. You may stop participation at any time.
                    </p>
                </Section>

                <Section title="8. Beta to Paid Transition">
                    <p>
                        Upon conclusion of the Beta period, AfroAllure may offer Participants the opportunity to transition to
                        a paid subscription plan. Continued use of the platform after the Beta period concludes requires
                        acceptance of AfroAllure&rsquo;s then-current Terms of Service. AfroAllure will provide reasonable notice
                        before the Beta period ends.
                    </p>
                </Section>

                <Section title="9. Governing Law">
                    <p>
                        This Agreement is governed by the laws of the State of Florida, without regard to conflict of law
                        principles.
                    </p>
                </Section>

                <Section title="10. Contact Us">
                    <p>
                        Questions about this Agreement? Contact us at{' '}
                        <a href="mailto:privacy@afroallure.co" className="underline text-[#0F0E0E]">privacy@afroallure.co</a>.
                        See also our <Link href="/terms" className="underline text-[#0F0E0E]">Terms of Service</Link> and{' '}
                        <Link href="/privacy" className="underline text-[#0F0E0E]">Privacy Policy</Link>.
                    </p>
                    <p>AfroAllure LLC · Gainesville, FL 32608</p>
                </Section>
            </div>
        </main>
    )
}
