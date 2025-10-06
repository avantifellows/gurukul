/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public',
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
