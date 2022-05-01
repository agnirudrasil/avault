import { LoadingButton } from "@mui/lab";
import {
    Avatar,
    Box,
    Button,
    FormControl,
    FormLabel,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { NextPage } from "next";
import { useState } from "react";
import { useGetApplication } from "../../../../hooks/requests/useGetApplication";
import { useResetBotToken } from "../../../../hooks/requests/useResetBotToken";
import { DefaultProfilePic } from "../../../../src/components/DefaultProfilePic";
import { AddBotConfirmation } from "../../../../src/components/dialogs/AddBotConfirmation";
import { CopyButton } from "../../../../src/components/Form/CopyButton";
import { ApplicationLayout } from "../../../../src/components/layouts/ApplicationLayout";

export const ApplicationBotPage: NextPage<{ id: string }> = ({ id }) => {
    const { data } = useGetApplication(id);
    const { data: token, isLoading, mutateAsync } = useResetBotToken();
    const [open, setOpen] = useState(false);

    return (
        <ApplicationLayout id={id}>
            <AddBotConfirmation
                id={id}
                open={open}
                onClose={() => setOpen(false)}
            />
            <Typography variant="h5">Bot</Typography>
            <Typography sx={{ mb: 6 }} color="GrayText" variant="subtitle1">
                Bring your app to life on AVAULT with a bot user. Be a part of
                chat in your users' servers and interact with them directly.
            </Typography>
            <Typography sx={{ mb: 4 }} variant="h5">
                Build-A-Bot
            </Typography>
            {data?.bot ? (
                <Stack spacing={2} direction="row" sx={{ width: "100%" }}>
                    <Box>
                        <Typography variant="button">ICON</Typography>
                        <Paper
                            variant="outlined"
                            sx={{ width: "224px", height: "224px" }}
                        >
                            <Stack
                                sx={{ height: "100%" }}
                                alignItems="center"
                                justifyContent="space-evenly"
                            >
                                <Avatar
                                    sx={{ width: "144px", height: "144px" }}
                                >
                                    <DefaultProfilePic
                                        width={144}
                                        height={144}
                                        tag={data.bot.tag || ""}
                                    />
                                </Avatar>
                            </Stack>
                        </Paper>
                    </Box>
                    <Stack sx={{ flex: 1 }} spacing={3}>
                        <FormControl sx={{ width: "100%" }} variant="outlined">
                            <FormLabel>
                                <Typography variant="button">
                                    username
                                </Typography>
                            </FormLabel>
                            <TextField
                                value={data.bot.username}
                                onChange={() => {}}
                                placeholder="App Name"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Typography
                                                color="GrayText"
                                                sx={{
                                                    userSelect: "none",
                                                    cursor: "not-allowed",
                                                }}
                                            >
                                                {data?.bot.tag}
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                                fullWidth
                            />
                        </FormControl>
                        <Stack spacing={1}>
                            <Typography variant="button">TOKEN</Typography>
                            <Typography variant="caption" color="GrayText">
                                For security purposes, tokens can only be viewed
                                once, when created. If you forgot or lost access
                                to your token, please regenerate a new one.
                            </Typography>
                            {token && token.token && (
                                <Typography variant="body2" color="GrayText">
                                    {token.token}
                                </Typography>
                            )}
                            <Stack direction="row" spacing={1}>
                                {token && token.token && (
                                    <CopyButton text={token.token} />
                                )}
                                <LoadingButton
                                    loading={isLoading}
                                    onClick={async () => {
                                        await mutateAsync(id);
                                    }}
                                    variant="contained"
                                    disableElevation
                                >
                                    Reset token
                                </LoadingButton>
                            </Stack>
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="button">BOT ID</Typography>
                            <Typography color="GrayText">
                                {data?.bot.id}
                            </Typography>
                            <Box>
                                <CopyButton text={data?.bot.id || ""} />
                            </Box>
                        </Stack>
                    </Stack>
                </Stack>
            ) : (
                <Stack
                    sx={{ width: "100%" }}
                    alignItems="center"
                    justifyContent="space-between"
                    direction="row"
                >
                    <Typography
                        sx={{ mb: 6 }}
                        color="GrayText"
                        variant="subtitle1"
                    >
                        Bring your app to life by adding a bot user. This action
                        is irreversible.
                    </Typography>
                    <Button
                        onClick={() => setOpen(true)}
                        variant="contained"
                        disableElevation
                    >
                        Add bot
                    </Button>
                </Stack>
            )}
        </ApplicationLayout>
    );
};

ApplicationBotPage.getInitialProps = async ({ query }) => {
    return {
        id: query.id as string,
    };
};

export default ApplicationBotPage;
