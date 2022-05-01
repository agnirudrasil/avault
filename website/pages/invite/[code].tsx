import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Link,
    Typography,
} from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useGetInvite } from "../../hooks/requests/useGetInvite";
import { useJoinInvite } from "../../hooks/requests/useJoinInvite";
import { getGuildInitials } from "../../src/get-guild-intials";
import { AuthContainer } from "../../styles/auth-pages/styles";

const InvitePage: NextPage<{ code: string }> = ({ code }) => {
    const { data } = useGetInvite(code);
    const [banned, setBanned] = useState(false);
    const router = useRouter();
    const { mutateAsync } = useJoinInvite();

    return (
        <AuthContainer>
            <Head>
                <title>Invite | {data?.guild?.name}</title>
            </Head>
            <Card sx={{ display: "flex" }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <CardContent sx={{ flex: "1 0 auto" }}>
                        <Typography
                            variant="button"
                            color={banned ? "red" : "text.secondary"}
                            component="div"
                        >
                            {!banned
                                ? `${data?.inviter.username} HAS INVITED YOU TO JOIN`
                                : "YOU ARE BANNED FROM"}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {data?.guild?.name}
                        </Typography>
                    </CardContent>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            pl: 1,
                            pb: 1,
                        }}
                    >
                        {!banned && (
                            <Button
                                onClick={async () => {
                                    const data = await mutateAsync({
                                        code,
                                        onError: () => {
                                            const path = `/login?next=${encodeURIComponent(
                                                router.asPath
                                            )}`;
                                            router.push(path);
                                            return {};
                                        },
                                    });
                                    if (data.error) {
                                        setBanned(true);
                                    }
                                    if (data.id) {
                                        router.push("/channels/@me");
                                    }
                                }}
                                disableElevation
                                variant="contained"
                            >
                                ACCEPT INVITE
                            </Button>
                        )}
                        <Link href="/" underline="hover" color="inherit">
                            {banned ? "Return Home" : "No, Thanks"}
                        </Link>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        padding: "1rem",
                    }}
                >
                    <Avatar
                        sx={theme => ({
                            width: "60px",
                            height: "60px",
                            background: banned
                                ? theme.palette.error.main
                                : theme.palette.primary.main,
                        })}
                    >
                        {getGuildInitials(data?.guild?.name ?? "")}
                    </Avatar>
                </Box>
            </Card>
        </AuthContainer>
    );
};

InvitePage.getInitialProps = ({ query }) => ({ code: query.code as string });
export default InvitePage;
