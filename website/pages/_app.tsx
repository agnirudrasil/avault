import { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import { createEmotionCache } from "../src/createEmotionCache";
import { CacheProvider, EmotionCache } from "@emotion/react";
import theme from "../src/theme";
import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "react-query";
import { useState } from "react";
import { WebsocketProvider } from "../contexts/WebsocketProvider";
import "emoji-mart/css/emoji-mart.css";
import "../styles/styles.css";
import { useRouter } from "next/router";
import Head from "next/head";

const clientSideCache = createEmotionCache();

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache;
    dehydratedState: any;
}

const MyComponent: React.FC<MyAppProps & { overwrites: string[] }> = props => {
    const { Component, overwrites, pageProps } = props;
    const router = useRouter();

    return overwrites.includes(router.asPath) ||
        router.asPath.startsWith("/invite") ||
        router.asPath.startsWith("/login") ||
        router.asPath.startsWith("/register") ? (
        <Component {...pageProps} />
    ) : (
        <WebsocketProvider>
            <Component {...pageProps} />
        </WebsocketProvider>
    );
};

const MyApp = (props: MyAppProps) => {
    const { emotionCache = clientSideCache } = props;
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <Head>
                <title>Avault</title>
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
                <link rel="manifest" href="/site.webmanifest"></link>
            </Head>
            <CacheProvider value={emotionCache}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <MyComponent
                        {...props}
                        overwrites={[
                            "/markdown",
                            "/login",
                            "/register",
                            "/firebase",
                            "/invite",
                            "/firebase-messaging-sw.js",
                        ]}
                    />
                </ThemeProvider>
            </CacheProvider>
        </QueryClientProvider>
    );
};

export default MyApp;
