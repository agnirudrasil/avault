import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useUpdateUser } from "../../../hooks/requests/useUpdateUser";

export const ChangePassword: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { mutateAsync, isLoading } = useUpdateUser();
    return (
        <div>
            <Button
                disableElevation
                variant="contained"
                onClick={() => setOpen(true)}
            >
                Change Password
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle sx={{ pb: 0 }}>Update your password</DialogTitle>
                <Formik
                    initialValues={{ password: "", new_password: "" }}
                    onSubmit={async (values, { setSubmitting }) => {
                        await mutateAsync(values);
                        setSubmitting(false);
                        setOpen(false);
                    }}
                >
                    {({ values, setFieldValue }) => (
                        <Form>
                            <DialogContent>
                                <Stack spacing={2}>
                                    <DialogContentText>
                                        Enter your current password and a new
                                        password.
                                    </DialogContentText>
                                    <TextField
                                        type="password"
                                        label="Current Password"
                                        required
                                        value={values.password}
                                        onChange={e =>
                                            setFieldValue(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <TextField
                                        type="password"
                                        label="New Password"
                                        required
                                        value={values.new_password}
                                        onChange={e =>
                                            setFieldValue(
                                                "new_password",
                                                e.target.value
                                            )
                                        }
                                    />
                                </Stack>
                            </DialogContent>
                            <DialogActions sx={{ bgcolor: "grey.900" }}>
                                <Button
                                    onClick={() => setOpen(false)}
                                    color="inherit"
                                >
                                    Cancel
                                </Button>
                                <LoadingButton
                                    loading={isLoading}
                                    type="submit"
                                    variant="contained"
                                >
                                    Done
                                </LoadingButton>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};
