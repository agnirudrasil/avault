import { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import { createEmotionCache } from "../src/createEmotionCache";
import { CacheProvider, EmotionCache } from "@emotion/react";
import theme from "../src/theme";
import { CssBaseline } from "@mui/material";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { useState } from "react";

const clientSideCache = createEmotionCache();

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache;
    dehydratedState: any;
}

const MyApp = (props: MyAppProps) => {
    const { Component, emotionCache = clientSideCache, pageProps } = props;
    const [queryClient] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            <Hydrate state={pageProps.dehydratedState}>
                <CacheProvider value={emotionCache}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <Component {...pageProps} />
                    </ThemeProvider>
                </CacheProvider>
            </Hydrate>
        </QueryClientProvider>
    );
};

export default MyApp;
