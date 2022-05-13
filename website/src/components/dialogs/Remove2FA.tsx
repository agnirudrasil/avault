import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import React from "react";
import { useDisableTOTP } from "../../../hooks/requests/useDisableTOTP";
import { CustomTextField } from "../CustomTextField";

export const Remove2FA: React.FC = () => {
    const [open, setOpen] = React.useState(false);
    const { mutateAsync } = useDisableTOTP();

    return (
        <div>
            <Button
                onClick={() => setOpen(true)}
                variant="outlined"
                color="error"
            >
                Remove 2fa
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <Formik
                    initialValues={{ code: "" }}
                    onSubmit={async (values, { setErrors }) => {
                        try {
                            await mutateAsync(values);
                            setOpen(false);
                        } catch (e) {
                            setErrors({ code: "Invalid Code" });
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <DialogTitle>
                                Disable Two-Factor Authentication
                            </DialogTitle>
                            <DialogContent>
                                <Field
                                    component={CustomTextField}
                                    name="code"
                                    placeholder="6-digit authentication code/8-digit backup code"
                                />
                            </DialogContent>
                            <DialogActions sx={{ bgcolor: "grey.900" }}>
                                <Button
                                    onClick={() => setOpen(false)}
                                    color="inherit"
                                >
                                    Cancel
                                </Button>
                                <LoadingButton
                                    loading={isSubmitting}
                                    color="error"
                                    type="submit"
                                    variant="contained"
                                >
                                    Remove 2fa
                                </LoadingButton>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};
