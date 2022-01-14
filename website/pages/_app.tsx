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

const clientSideCache = createEmotionCache();

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache;
    dehydratedState: any;
}

const MyApp = (props: MyAppProps) => {
    const { Component, emotionCache = clientSideCache, pageProps } = props;
    const [queryClient] = useState(() => new QueryClient());
    const router = useRouter();

    return (
        <QueryClientProvider client={queryClient}>
            <CacheProvider value={emotionCache}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    {router.asPath.startsWith("/login") ||
                    router.asPath.startsWith("/register") ? (
                        <Component {...pageProps} />
                    ) : (
                        <WebsocketProvider>
                            <Component {...pageProps} />
                        </WebsocketProvider>
                    )}
                </ThemeProvider>
            </CacheProvider>
        </QueryClientProvider>
    );
};

export default MyApp;
