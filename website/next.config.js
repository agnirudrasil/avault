module.exports = {
    reactStrictMode: true,
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
