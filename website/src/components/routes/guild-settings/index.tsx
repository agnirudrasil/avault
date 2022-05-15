import { LoadingButton } from "@mui/lab";
import {
    Avatar,
    Button,
    FormControl,
    FormLabel,
    Stack,
    Typography,
    TextField,
    Link,
    Snackbar,
} from "@mui/material";
import { isEqual } from "lodash";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useGuildsStore } from "../../../../stores/useGuildsStore";
import { getGuildInitials } from "../../../get-guild-intials";
import { AvatarEditorDialog } from "../../dialogs/AvatarEditor";
import { GuildSettingsLayout } from "../../layouts/routes/GuildSettings";
import { useEditGuild } from "../../../../hooks/requests/useEditGuild";

export const GuildSettings = () => {
    const router = useRouter();
    const guild = useGuildsStore(
        state => state.guilds[router.query.guild as string]
    );
    const { mutateAsync } = useEditGuild();

    if (!guild) {
        return <></>;
    }

    return (
        <GuildSettingsLayout>
            <Typography variant="h6">Server Overview</Typography>
            <Formik
                enableReinitialize
                initialValues={{
                    name: guild.name,
                    icon: guild.icon
                        ? `${process.env.NEXT_PUBLIC_CDN_URL}icons/${guild.id}/${guild.icon}`
                        : undefined,
                }}
                onSubmit={async values => {
                    if (
                        values.icon ===
                        (guild?.icon
                            ? `${process.env.NEXT_PUBLIC_CDN_URL}icons/${guild?.id}/${guild?.icon}`
                            : undefined)
                    ) {
                        delete values.icon;
                    }
                    await mutateAsync({
                        ...values,
                        guildId: guild.id,
                    });
                }}
            >
                {({
                    values,
                    initialValues,
                    isSubmitting,
                    setFieldValue,
                    resetForm,
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
                        <Stack sx={{ mt: 3 }} direction="row" spacing={2}>
                            <Stack alignItems="center" spacing={1}>
                                <Avatar
                                    src={values.icon}
                                    sx={{
                                        bgcolor: "primary.dark",
                                        color: "white",
                                        width: 90,
                                        height: 90,
                                    }}
                                >
                                    {getGuildInitials(guild.name)}
                                </Avatar>
                                {values.icon && (
                                    <Link
                                        underline="hover"
                                        onClick={() =>
                                            setFieldValue("icon", null)
                                        }
                                        sx={{
                                            color: "primary.dark",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Remove
                                    </Link>
                                )}
                            </Stack>
                            <Stack spacing={2}>
                                <Typography variant="body2" color="GrayText">
                                    We recommend an image of at least 512x512 px
                                    for this server.
                                </Typography>
                                <AvatarEditorDialog
                                    buttonText="upload icon"
                                    height={512}
                                    width={512}
                                    onChange={v => setFieldValue("icon", v)}
                                />
                            </Stack>
                            <FormControl fullWidth>
                                <FormLabel>Server Name</FormLabel>
                                <TextField
                                    value={values.name}
                                    onChange={e =>
                                        setFieldValue("name", e.target.value)
                                    }
                                />
                            </FormControl>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </GuildSettingsLayout>
    );
};
