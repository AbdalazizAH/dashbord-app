/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    },
    images: {
        domains: [
            'backend-v1-psi.vercel.app',
            'pyauuapknnwofmrymguv.supabase.co'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'backend-v1-psi.vercel.app',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'pyauuapknnwofmrymguv.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

export default nextConfig;
