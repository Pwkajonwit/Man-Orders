/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'profile.line-scdn.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'sprofile.line-scdn.net',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
