import crypto from 'crypto';


/** @type {import('next').NextConfig} */


const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    async headers() {
        const nonce = crypto.randomBytes(16).toString('base64');
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [

                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Content-Security-Policy", value: "connect src 'none'" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },

                ]
            },

        ]
    },
    images: {
        domains: ["i.pinimg.com", "jappbqntqogmnoluifzx.supabase.co"]
    }
}
export default nextConfig;
