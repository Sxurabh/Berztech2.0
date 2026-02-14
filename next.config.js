/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "srouvvdubxktqyihwphc.supabase.co",
            },
            {
                protocol: "https",
                hostname: "**.supabase.in",
            },
        ],
    },
    // Next.js 16 uses Turbopack by default (much faster than webpack)
    turbopack: {},
}

module.exports = nextConfig
