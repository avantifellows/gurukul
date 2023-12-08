/** @type {import('next').NextConfig} */
// const nextConfig = {};

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

// module.exports = nextConfig;
