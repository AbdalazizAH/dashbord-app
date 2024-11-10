/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
    images: {
        domains: ['backend-v1-psi.vercel.app'],
    },
};

export default nextConfig;
