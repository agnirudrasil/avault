module.exports = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_API_URL: "http://avault.agnirudra.me/api/v1",
        NEXT_PUBLIC_GATEWAY_URL: "ws://gateway.avault.agnirudra.me/",
    },
    async redirects() {
        return [
            {
                source: "/channels",
                destination: "/channels/@me",
                permanent: false,
            },
        ];
    },
};
