/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public',

    runtimeCaching: [
        {
            // Never cache portal URLs - always fetch from network
            urlPattern: ({ url }) => {
                return url.origin === new URL(process.env.NEXT_PUBLIC_PORTAL_URL || 'https://staging-auth.avantifellows.org/').origin;
            },
            handler: 'NetworkOnly',
        },
        {
            // Never cache auth-related requests
            urlPattern: /\/(api\/auth|verify-token)/,
            handler: 'NetworkOnly',
        },
    ],

    // Don't use cached fallback for navigation failures
    fallbacks: {
        document: null,
    },
});

const nextConfig = {
    experimental: {
        serverActions: true,
    },
    /* Date: 19-12-2023 
     The async redirects block below was originally implemented to redirect users from the home URL to the library page. For the demo, we've decided to disable this behavior by commenting out the code.
    */

    // async redirects() {
    //     return [
    //         {
    //             source: '/',
    //             destination: '/library',
    //             permanent: false,
    //         }
    //     ];
    // }
};

module.exports = withPWA(nextConfig);
