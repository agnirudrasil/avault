import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useUpdateUser } from "../../../hooks/requests/useUpdateUser";
import { User } from "../../../stores/useUserStore";

export const UpdateUsernameDialog: React.FC<{ user: User }> = ({ user }) => {
    const [open, setOpen] = useState(false);
    const { mutateAsync } = useUpdateUser();
    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                disableElevation
                color="inherit"
            >
                Edit
            </Button>
            <Dialog PaperProps={{}} open={open} onClose={() => setOpen(false)}>
                <DialogTitle sx={{ pb: 0 }}>Change Your Username</DialogTitle>
                <Formik
                    initialValues={{
                        username: user.username,
                        password: "",
                    }}
                    onSubmit={async (values, { setSubmitting, setErrors }) => {
                        if (!values.password) {
                            setErrors({
                                password: "Please enter your password",
                            });
                            setSubmitting(false);
                        }
                        await mutateAsync(values);
                        setSubmitting(false);
                        setOpen(false);
                    }}
                >
                    {({ values, setFieldValue, errors, isSubmitting }) => (
                        <Form>
                            <DialogContent sx={{ width: "100%" }}>
                                <Stack spacing={2}>
                                    <DialogContentText>
                                        Enter a new username and your existing
                                        password.
                                    </DialogContentText>
                                    <TextField
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        required
                                        error={Boolean(errors.username)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography
                                                        color="GrayText"
                                                        sx={{
                                                            borderLeft:
                                                                "1px solid GrayText",
                                                            pl: 1,
                                                        }}
                                                    >
                                                        {user.tag}
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                        value={values.username}
                                        onChange={e =>
                                            setFieldValue(
                                                "username",
                                                e.target.value
                                            )
                                        }
                                        fullWidth
                                        label="USERNAME"
                                    />
                                    <TextField
                                        type="password"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        value={values.password}
                                        error={Boolean(errors.password)}
                                        onChange={e =>
                                            setFieldValue(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        fullWidth
                                        label={
                                            "CURRENT PASSWORD" +
                                            (errors.password
                                                ? ` - ${errors.password}`
                                                : "")
                                        }
                                    />
                                </Stack>
                            </DialogContent>
                            <DialogActions sx={{ bgcolor: "grey.900" }}>
                                <Button
                                    onClick={() => setOpen(false)}
                                    disableElevation
                                    color="inherit"
                                >
                                    cancel
                                </Button>
                                <LoadingButton
                                    loading={isSubmitting}
                                    type="submit"
                                    variant="contained"
                                    disableElevation
                                >
                                    Done
                                </LoadingButton>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </>
    );
};
