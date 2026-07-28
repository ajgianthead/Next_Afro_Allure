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
    }
}
export default nextConfig;
