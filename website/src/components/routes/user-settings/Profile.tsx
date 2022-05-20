import { Check } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Button,
    Divider,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { Form, Formik } from "formik";
import { throttle } from "lodash";
import isEqual from "lodash.isequal";
import { useUpdateUser } from "../../../../hooks/requests/useUpdateUser";
import { useUserStore } from "../../../../stores/useUserStore";
import { AvatarEditorDialog } from "../../dialogs/AvatarEditor";
import { UserSettings } from "../../layouts/routes/UserSettings";
import { ProfileCard } from "../../ProfileCard";

export const UserSettingsProfile = () => {
    const user = useUserStore(state => state.user);
    const { mutateAsync } = useUpdateUser();

    const throttled = throttle((value, setFieldValue) => {
        setFieldValue("accent_color", value);
    }, 1000);

    return (
        <UserSettings>
            <Formik
                enableReinitialize
                initialValues={{
                    ...user,
                    avatar: user.avatar
                        ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${user.id}/${user.avatar}`
                        : user.avatar,
                    banner: user.banner
                        ? `${process.env.NEXT_PUBLIC_CDN_URL}banners/${user.id}/${user.banner}`
                        : user.banner,
                    accent_color: user.accent_color
                        ? "#" + user.accent_color.toString(16)
                        : undefined,
                }}
                onSubmit={async values => {
                    const toSend = { ...values };
                    if (
                        values.avatar === user.avatar ||
                        values.avatar ===
                            `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${user.id}/${user.avatar}`
                    ) {
                        delete toSend.avatar;
                    }
                    if (
                        values.banner === user.banner ||
                        values.banner ===
                            `${process.env.NEXT_PUBLIC_CDN_URL}banners/${user.id}/${user.banner}`
                    ) {
                        delete toSend.banner;
                    }

                    toSend.accent_color = (
                        toSend.accent_color
                            ? parseInt(toSend.accent_color.replace("#", ""), 16)
                            : toSend.accent_color
                    ) as any;

                    delete (toSend as any).username as any;
                    delete (toSend as any).tag as any;
                    delete (toSend as any).email as any;
                    delete (toSend as any).password as any;
                    delete (toSend as any).id as any;
                    delete (toSend as any).bot as any;

                    await mutateAsync(toSend as any);
                }}
            >
                {({
                    values,
                    setFieldValue,
                    initialValues,
                    resetForm,
                    isSubmitting,
                }) => {
                    return (
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
                                sx={{ width: "100%", height: "max-content" }}
                                spacing={3}
                            >
                                <Typography variant="h5" fontWeight="bold">
                                    User Profile
                                </Typography>
                                <Divider flexItem />
                                <Stack spacing={2} direction="row">
                                    <Stack
                                        divider={<Divider flexItem />}
                                        spacing={2}
                                        sx={{ flex: 1 }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="button"
                                                color="GrayText"
                                            >
                                                avatar
                                            </Typography>
                                            <Box>
                                                <AvatarEditorDialog
                                                    width={300}
                                                    height={300}
                                                    key="avatar"
                                                    buttonText={
                                                        <Button
                                                            disableElevation
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            sx={{ mr: 1 }}
                                                            component="span"
                                                        >
                                                            change avatar
                                                        </Button>
                                                    }
                                                    onChange={v =>
                                                        setFieldValue(
                                                            "avatar",
                                                            v
                                                        )
                                                    }
                                                />
                                                <Button
                                                    size="small"
                                                    color="inherit"
                                                    onClick={() =>
                                                        setFieldValue(
                                                            "avatar",
                                                            null
                                                        )
                                                    }
                                                >
                                                    Remove Avatar
                                                </Button>
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="button"
                                                color="GrayText"
                                            >
                                                profile color
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        width: "100px",
                                                        height: "70px",
                                                        bgcolor:
                                                            values.accent_color ||
                                                            "",
                                                        borderRadius: "4px",
                                                        border: "1px solid #eee",
                                                    }}
                                                >
                                                    <input
                                                        value={
                                                            values.accent_color
                                                        }
                                                        onChange={e =>
                                                            throttled(
                                                                e.target.value,
                                                                setFieldValue
                                                            )
                                                        }
                                                        id="profile-color"
                                                        type="color"
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            top: 0,
                                                            left: 0,
                                                            height: "100%",
                                                            width: "100%",
                                                            opacity: 0,
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                    {values.accent_color && (
                                                        <Check />
                                                    )}
                                                </Box>
                                                <Box
                                                    onClick={() =>
                                                        setFieldValue(
                                                            "accent_color",
                                                            null
                                                        )
                                                    }
                                                    sx={{
                                                        cursor: "pointer",
                                                        position: "relative",
                                                        width: "100px",
                                                        height: "70px",
                                                        bgcolor: "primary.dark",
                                                        borderRadius: "4px",
                                                        border: "1px solid #eee",
                                                    }}
                                                >
                                                    {!values.accent_color && (
                                                        <Check />
                                                    )}
                                                </Box>
                                            </Stack>
                                        </Box>
                                        <Stack spacing={2}>
                                            <Typography
                                                variant="button"
                                                color="GrayText"
                                            >
                                                profile banner
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="GrayText"
                                            >
                                                We recommend and image of at
                                                least 600x240. You can upload a
                                                PNG, JPG, or an animated GIF
                                                under 10 MB.
                                            </Typography>
                                            <Box>
                                                <AvatarEditorDialog
                                                    key="banner"
                                                    width={600}
                                                    height={240}
                                                    buttonText={
                                                        <Button
                                                            disableElevation
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            sx={{ mr: 1 }}
                                                            component="span"
                                                        >
                                                            change banner
                                                        </Button>
                                                    }
                                                    onChange={e => {
                                                        setFieldValue(
                                                            "banner",
                                                            e
                                                        );
                                                    }}
                                                />
                                                <Button
                                                    onClick={() => {
                                                        setFieldValue(
                                                            "banner",
                                                            null
                                                        );
                                                    }}
                                                    size="small"
                                                    color="inherit"
                                                >
                                                    remove Banner
                                                </Button>
                                            </Box>
                                        </Stack>
                                        <Stack spacing={2}>
                                            <Typography
                                                variant="button"
                                                color="GrayText"
                                            >
                                                about me
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="GrayText"
                                            >
                                                Markdown and links are
                                                supported.
                                            </Typography>
                                            <TextField
                                                value={values.bio}
                                                onChange={e => {
                                                    setFieldValue(
                                                        "bio",
                                                        e.target.value
                                                    );
                                                }}
                                                multiline
                                                minRows={4}
                                            />
                                        </Stack>
                                    </Stack>
                                    <ProfileCard
                                        user={{ ...values }}
                                        PaperProps={{
                                            sx: {
                                                width: "300px",
                                                maxWidth: "300px",
                                                height: "max-content",
                                            },
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </Form>
                    );
                }}
            </Formik>
        </UserSettings>
    );
};
