const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
    },
    async redirects() {
        return [
            {
                source: "/developers",
                destination: "/developers/applications",
                permanent: false,
            },
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
});
