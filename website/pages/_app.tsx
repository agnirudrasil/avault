import { AppProps } from "next/app";
import { Global, css } from "@emotion/react";
import {
    createTheme,
    ThemeProvider as MuiThemeProvider,
    useTheme,
    CssBaseline,
} from "@material-ui/core";
import { ThemeProvider } from "@emotion/react";

const myTheme = createTheme({
    palette: {
        primary: {
            main: "#0c2046",
        },
        background: {
            default: "#ffffff",
            paper: "#faefef",
        },
    },
});

const GlobalStyles: React.FC = ({ children }) => {
    const theme = useTheme();
    return (
        <ThemeProvider theme={theme.palette}>
            <CssBaseline />
            <Global
                styles={css`
                    * {
                        --teardrop: 500px 500px 150px 500px;
                    }
                    body {
                        background-color: ${theme.palette.background.default};
                    }
                `}
            />
            {children}
        </ThemeProvider>
    );
};

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <MuiThemeProvider theme={myTheme}>
            <GlobalStyles>
                <Component {...pageProps} />
            </GlobalStyles>
        </MuiThemeProvider>
    );
}

export default MyApp;
