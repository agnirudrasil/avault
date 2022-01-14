module.exports = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
    },
    async redirects() {
        return [
            {
                source: "/",
                destination: "/channels/@me",
                permanent: false,
            },
            {
                source: "/channels",
                destination: "/channels/@me",
                permanent: false,
            },
        ];
    },
};
