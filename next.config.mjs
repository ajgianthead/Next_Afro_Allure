const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
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
    // Old legal page URLs now redirect to the canonical, up-to-date pages.
    async redirects() {
        return [
            { source: '/privacy-policy', destination: '/privacy', permanent: true },
            { source: '/terms-of-service', destination: '/terms', permanent: true },
        ]
    },
}
export default nextConfig;
