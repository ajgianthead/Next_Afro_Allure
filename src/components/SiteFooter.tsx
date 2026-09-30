import Link from 'next/link'

const links = [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/refunds', label: 'Refunds' },
    { href: '/cookies', label: 'Cookies' },
    { href: '/data-deletion', label: 'Delete My Data' },
]

// Slim legal bar shown on every page, underneath whatever page-specific
// footer (if any) a given page already renders.
export function SiteFooter() {
    return (
        <footer
            className="w-full"
            style={{ backgroundColor: '#0F0E0E', color: 'rgba(255,255,255,0.6)' }}
        >
            <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
                <span>© 2026 AfroAllure, LLC · Gainesville, FL 32608</span>
                <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Legal">
                    {links.map(l => (
                        <Link key={l.href} href={l.href} className="hover:text-white underline-offset-2 hover:underline">
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    )
}
