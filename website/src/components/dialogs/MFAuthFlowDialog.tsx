import { LoadingButton } from "@mui/lab";
import {
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Link,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useCreateQRCode } from "../../../hooks/requests/useCreateQRCode";
import { useEnableTOTP } from "../../../hooks/requests/useEnableTOTP";
import { User } from "../../../stores/useUserStore";
import { generateTOTPSecret } from "../../generate-base32";

export const MFAAuthFlowDialog: React.FC<{ user: User }> = ({ user }) => {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const code = useMemo(generateTOTPSecret, []);
    const { data, mutate } = useCreateQRCode();
    const { mutateAsync } = useEnableTOTP();

    useEffect(() => {
        mutate({
            email: user.email,
            secret: code,
            scale: 4,
        });
    }, [code]);
    return (
        <div>
            <Button
                onClick={() => setOpen(true)}
                disableElevation
                variant="contained"
            >
                Enable Two-Factor Auth
            </Button>
            <Dialog maxWidth="sm" open={open} onClose={() => setOpen(false)}>
                <DialogTitle sx={{ pb: 0 }}>Enable Two-Factor Auth</DialogTitle>
                <Formik
                    initialValues={{
                        password: "",
                        code: "",
                    }}
                    onSubmit={async (values, { setSubmitting }) => {
                        await mutateAsync({
                            ...values,
                            secret: code,
                        });
                        setSubmitting(false);
                        setOpen(false);
                    }}
                >
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form>
                            <DialogContent
                                sx={{ pt: page === 1 ? 0 : undefined }}
                            >
                                {page === 0 && (
                                    <TextField
                                        value={values.password}
                                        label="Password"
                                        type="password"
                                        onChange={e =>
                                            setFieldValue(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                                {page === 1 && (
                                    <>
                                        <DialogContentText sx={{ p: 0 }}>
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                color="GrayText"
                                            >
                                                Make your account safer in 3
                                                easy steps:
                                            </Typography>
                                        </DialogContentText>
                                        <List
                                            spacing={1}
                                            component={Stack}
                                            divider={<Divider flexItem />}
                                        >
                                            <ListItem>
                                                <ListItemAvatar sx={{ mr: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: "156px",
                                                            height: "156px",
                                                        }}
                                                        src="/google-authenticator.png"
                                                        alt="Google Authenticator"
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    secondary={
                                                        <Typography
                                                            color="GrayText"
                                                            variant="body2"
                                                        >
                                                            Dowload and install{" "}
                                                            <Link
                                                                underline="hover"
                                                                sx={{
                                                                    color: "primary.dark",
                                                                }}
                                                                href="https://support.google.com/accounts/answer/1066447?hl=en"
                                                                target="_blank"
                                                            >
                                                                Google
                                                                Authenticator
                                                            </Link>{" "}
                                                            or{" "}
                                                            <Link
                                                                underline="hover"
                                                                sx={{
                                                                    color: "primary.dark",
                                                                }}
                                                                href="https://authy.com/"
                                                                target="_blank"
                                                            >
                                                                Authy
                                                            </Link>{" "}
                                                            on your phone or
                                                            tablet.
                                                        </Typography>
                                                    }
                                                    primary={
                                                        <Typography
                                                            color="GrayText"
                                                            variant="button"
                                                        >
                                                            download an
                                                            authenticator app
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemAvatar sx={{ mr: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: "auto",
                                                            height: "auto",
                                                            borderRadius: "4px",
                                                        }}
                                                        src={data}
                                                        alt="Google Authenticator"
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    secondary={
                                                        <Stack>
                                                            <Typography
                                                                variant="caption"
                                                                color="GrayText"
                                                            >
                                                                2FA KEY(MANUAL
                                                                ENTRY)
                                                            </Typography>
                                                            <Typography
                                                                variant="h6"
                                                                color="GrayText"
                                                            >
                                                                {code
                                                                    .match(
                                                                        /.{1,4}/g
                                                                    )
                                                                    ?.join(" ")
                                                                    .toLowerCase()}
                                                            </Typography>
                                                        </Stack>
                                                    }
                                                    primary={
                                                        <Stack sx={{ mb: 2 }}>
                                                            <Typography
                                                                variant="button"
                                                                color="GrayText"
                                                            >
                                                                Scan the QR code
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="GrayText"
                                                            >
                                                                Open the
                                                                authenticator
                                                                app and scan the
                                                                image to the
                                                                left using your
                                                                phone's camera
                                                            </Typography>
                                                        </Stack>
                                                    }
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemAvatar sx={{ mr: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: "156px",
                                                            height: "156px",
                                                            borderRadius: "4px",
                                                        }}
                                                        alt="Google Authenticator"
                                                    >
                                                        <span />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    secondary={
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            spacing={1}
                                                        >
                                                            <TextField
                                                                label="Code"
                                                                value={
                                                                    values.code
                                                                }
                                                                onChange={e =>
                                                                    setFieldValue(
                                                                        "code",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                            <span>
                                                                <LoadingButton
                                                                    loading={
                                                                        isSubmitting
                                                                    }
                                                                    type="submit"
                                                                    variant="contained"
                                                                >
                                                                    Activate
                                                                </LoadingButton>
                                                            </span>
                                                        </Stack>
                                                    }
                                                    primary={
                                                        <Typography
                                                            variant="button"
                                                            color="GrayText"
                                                        >
                                                            login with your code
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        </List>
                                    </>
                                )}
                            </DialogContent>
                            {page !== 1 && (
                                <DialogActions sx={{ bgcolor: "grey.900" }}>
                                    <Button
                                        onClick={() => setOpen(false)}
                                        color="inherit"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (page === 0) {
                                                setPage(1);
                                            }
                                        }}
                                        disableElevation
                                        variant="contained"
                                    >
                                        Continue
                                    </Button>
                                </DialogActions>
                            )}
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};
