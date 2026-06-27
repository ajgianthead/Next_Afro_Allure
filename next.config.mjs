const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'i.pinimg.com' },
            { protocol: 'https', hostname: 'jappbqntqogmnoluifzx.supabase.co' },
        ],
    }
}
export default nextConfig;
