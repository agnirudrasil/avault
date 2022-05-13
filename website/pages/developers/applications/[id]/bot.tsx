import { LoadingButton } from "@mui/lab";
import {
    Avatar,
    Box,
    Button,
    FormControl,
    FormLabel,
    InputAdornment,
    Link,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import isEqual from "lodash.isequal";
import { NextPage } from "next";
import { useState } from "react";
import { useGetApplication } from "../../../../hooks/requests/useGetApplication";
import { usePatchApplicationBot } from "../../../../hooks/requests/usePatchApplicationBot";
import { useResetBotToken } from "../../../../hooks/requests/useResetBotToken";
import { DefaultProfilePic } from "../../../../src/components/DefaultProfilePic";
import { AddBotConfirmation } from "../../../../src/components/dialogs/AddBotConfirmation";
import { CopyButton } from "../../../../src/components/Form/CopyButton";
import { ApplicationLayout } from "../../../../src/components/layouts/ApplicationLayout";

export const ApplicationBotPage: NextPage<{ id: string }> = ({ id }) => {
    const { data } = useGetApplication(id);
    const { data: token, isLoading, mutateAsync } = useResetBotToken();
    const [open, setOpen] = useState(false);
    const { mutateAsync: patchBot } = usePatchApplicationBot();

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
                <Formik
                    enableReinitialize
                    initialValues={{
                        username: data.bot.username,
                        avatar: data?.bot.avatar
                            ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${data?.bot.id}/${data?.bot.avatar}`
                            : undefined,
                    }}
                    onSubmit={async (values, { setSubmitting }) => {
                        if (
                            values.avatar ===
                            (data?.bot.avatar
                                ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${data?.id}/${data?.bot.avatar}`
                                : undefined)
                        ) {
                            delete values.avatar;
                        }
                        await patchBot({
                            id,
                            ...values,
                        });
                        setSubmitting(false);
                    }}
                >
                    {({
                        values,
                        initialValues,
                        resetForm,
                        isSubmitting,
                        setFieldValue,
                    }) => (
                        <Form>
                            <Snackbar
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "center",
                                }}
                                open={!isEqual(values, initialValues)}
                                message="Careful - you have unsaved changes!"
                                action={
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            color="inherit"
                                            onClick={() => resetForm()}
                                        >
                                            Reset
                                        </Button>
                                        <LoadingButton
                                            loading={isSubmitting}
                                            type="submit"
                                            color="success"
                                            variant="contained"
                                            disableElevation
                                        >
                                            Save Changes
                                        </LoadingButton>
                                    </Stack>
                                }
                            />
                            <Stack
                                spacing={2}
                                direction="row"
                                sx={{ width: "100%" }}
                            >
                                <Box>
                                    <Typography variant="button">
                                        AVATAR
                                    </Typography>
                                    <Paper
                                        variant="outlined"
                                        sx={{ width: "224px", height: "224px" }}
                                    >
                                        <Stack
                                            sx={{ height: "100%" }}
                                            alignItems="center"
                                            justifyContent="space-evenly"
                                        >
                                            <label htmlFor="avatar-picker">
                                                <input
                                                    value={""}
                                                    onChange={e => {
                                                        if (e.target.files) {
                                                            const reader =
                                                                new FileReader();
                                                            reader.onload =
                                                                () => {
                                                                    setFieldValue(
                                                                        "avatar",
                                                                        reader.result
                                                                    );
                                                                };
                                                            reader.readAsDataURL(
                                                                e.target
                                                                    .files[0]
                                                            );
                                                        }
                                                    }}
                                                    type="file"
                                                    accept="image/*"
                                                    id="avatar-picker"
                                                    style={{
                                                        display: "none",
                                                    }}
                                                />
                                                <Avatar
                                                    component="span"
                                                    src={values.avatar}
                                                    sx={{
                                                        width: "144px",
                                                        height: "144px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <DefaultProfilePic
                                                        width={144}
                                                        height={144}
                                                        tag={data.bot.tag || ""}
                                                    />
                                                </Avatar>
                                            </label>
                                            {data.bot.avatar && (
                                                <Link
                                                    onClick={() =>
                                                        setFieldValue(
                                                            "avatar",
                                                            null
                                                        )
                                                    }
                                                    underline="hover"
                                                    sx={{
                                                        color: "primary.dark",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Remove Avatar
                                                </Link>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Box>
                                <Stack sx={{ flex: 1 }} spacing={3}>
                                    <FormControl
                                        sx={{ width: "100%" }}
                                        variant="outlined"
                                    >
                                        <FormLabel>
                                            <Typography variant="button">
                                                username
                                            </Typography>
                                        </FormLabel>
                                        <TextField
                                            value={values.username}
                                            onChange={e => {
                                                setFieldValue(
                                                    "username",
                                                    e.target.value
                                                );
                                            }}
                                            placeholder="App Name"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography
                                                            color="GrayText"
                                                            sx={{
                                                                userSelect:
                                                                    "none",
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
                                        <Typography variant="button">
                                            TOKEN
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="GrayText"
                                        >
                                            For security purposes, tokens can
                                            only be viewed once, when created.
                                            If you forgot or lost access to your
                                            token, please regenerate a new one.
                                        </Typography>
                                        {token && token.token && (
                                            <Typography
                                                variant="body2"
                                                color="GrayText"
                                            >
                                                {token.token}
                                            </Typography>
                                        )}
                                        <Stack direction="row" spacing={1}>
                                            {token && token.token && (
                                                <CopyButton
                                                    text={token.token}
                                                />
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
                                </Stack>
                            </Stack>
                        </Form>
                    )}
                </Formik>
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
