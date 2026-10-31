const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'i.pinimg.com' },
            { protocol: 'https', hostname: 'jappbqntqogmnoluifzx.supabase.co' },
        ],
    },
    async headers() {
        // Pages where a signed-in business or a client takes actions. No other
        // site may show them in a frame (clickjacking: tricking someone into
        // clicking "Refund" or "Cancel" through an invisible overlay).
        const noFraming = [
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ]
        const appPages = [
            '/dashboard/:path*', '/admin/:path*', '/onboarding/:path*', '/appointment/:path*',
            '/login', '/register', '/forgot-password', '/set-password', '/auth/:path*',
            '/business/:name/edit/:path*', '/business/:name/edit',
        ]
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    // Full URLs (appointment links hold the id) never leave the site in the Referer header.
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
                ],
            },
            ...appPages.map(source => ({ source, headers: noFraming })),
        ]
    },
    // Old legal page URLs now redirect to the canonical, up-to-date pages.
    async redirects() {
        return [
            { source: '/privacy-policy', destination: '/privacy', permanent: true },
            { source: '/terms-of-service', destination: '/terms', permanent: true },
            { source: '/beta-user-agreement', destination: '/beta-agreement', permanent: true },
            { source: '/cookie-policy', destination: '/cookies', permanent: true },
        ]
    },
}
export default nextConfig;
