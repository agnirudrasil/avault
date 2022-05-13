import { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import { createEmotionCache } from "../src/createEmotionCache";
import { CacheProvider, css, EmotionCache, Global } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "react-query";
import { useState } from "react";
import { WebsocketProvider } from "../contexts/WebsocketProvider";
import "emoji-mart/css/emoji-mart.css";
import "../styles/styles.css";
import { useRouter } from "next/router";
import { darkTheme } from "../src/theme";
import { PageHead } from "../src/components/PageHead";

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
        router.asPath.startsWith("/oauth2") ||
        router.asPath.startsWith("/developers") ||
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
            <PageHead />
            <Global
                styles={css`
                    *::-webkit-scrollbar {
                        width: 16px;
                        height: 16px;
                    }

                    *::-webkit-scrollbar-button {
                        display: none;
                        width: 0;
                        height: 0;
                    }

                    *::-webkit-scrollbar-corner {
                        background-color: transparent;
                    }

                    *::-webkit-scrollbar-track {
                        background-color: ${darkTheme.palette.grey[800]};
                        border: 4px solid transparent;
                        border-radius: 8px;
                        background-clip: padding-box;
                    }

                    *::-webkit-scrollbar-thumb {
                        background-color: ${darkTheme.palette.grey[900]};
                        border: 4px solid transparent;
                        border-radius: 8px;
                        background-clip: padding-box;
                    }
                    code {
                        background: ${darkTheme.palette.grey[800]};
                        padding: 2px 4px;
                        border-radius: 4px;
                    }
                    pre {
                        background: ${darkTheme.palette.grey[900]};
                        padding: 8px;
                        border-radius: 4px;
                        border: 1px solid ${darkTheme.palette.grey[800]};
                    }
                    blockquote {
                        border-left: 2px solid #ddd;
                        margin-left: 0;
                        margin-right: 0;
                        padding-left: 10px;
                        color: #aaa;
                        font-style: italic;
                    }
                `}
            />
            <CacheProvider value={emotionCache}>
                <ThemeProvider theme={darkTheme}>
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
