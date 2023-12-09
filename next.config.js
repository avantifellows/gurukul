/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
};

module.exports = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/library',
                permanent: false,
            }
        ]
    }
}

module.exports = nextConfig;
