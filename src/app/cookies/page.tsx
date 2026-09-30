import Link from 'next/link'

export const metadata = {
    title: 'Cookie Policy | AfroAllure',
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

export default function CookiePolicyPage() {
    return (
        <main className="bg-white min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-16" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p className="text-xs uppercase tracking-widest text-[#A09790] mb-3">Legal</p>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-2">Cookie Policy</h1>
                <p className="text-sm text-[#6F6863] mb-10">Effective September 30, 2026</p>

                <p className="text-[15px] leading-relaxed text-[#3A3634]">
                    AfroAllure uses a small number of cookies to run the platform and, if you consent, to understand how it&rsquo;s used.
                </p>

                <Section title="1. Strictly Necessary Cookies">
                    <p>
                        These cookies are required for the platform to function and cannot be turned off. They include your
                        Supabase authentication session cookie, which keeps you signed in as you navigate the site.
                    </p>
                </Section>

                <Section title="2. Analytics Cookies">
                    <p>
                        We use Google Analytics 4 (GA4) to understand how visitors use AfroAllure. These cookies are only set
                        after you choose &ldquo;Accept All&rdquo; in our cookie banner — if you choose &ldquo;Necessary Only,&rdquo; GA4 never loads.
                    </p>
                </Section>

                <Section title="3. Managing Your Preferences">
                    <p>You can change your cookie preferences at any time by:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li>Clearing your browser&rsquo;s site data for afroallure.co, which re-shows the cookie banner</li>
                        <li>Adjusting your browser&rsquo;s cookie settings to block third-party or analytics cookies entirely</li>
                    </ul>
                </Section>

                <Section title="4. Contact Us">
                    <p>
                        Questions about our use of cookies? Contact us at{' '}
                        <a href="mailto:privacy@afroallure.co" className="underline text-[#0F0E0E]">privacy@afroallure.co</a>.
                        See also our <Link href="/privacy" className="underline text-[#0F0E0E]">Privacy Policy</Link>.
                    </p>
                    <p>AfroAllure LLC · Gainesville, FL 32608</p>
                </Section>
            </div>
        </main>
    )
}
