import { LoadingButton } from "@mui/lab";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/router";
import { useUpdateSelfNickname } from "../../../hooks/requests/useUpdateSelfNickname";
import { CustomTextField } from "../CustomTextField";

export interface EditServerProfileDialogProps {
    open: boolean;
    onClose: () => void;
}

export const EditServerProfileDialog: React.FC<EditServerProfileDialogProps> =
    ({ onClose, open }) => {
        const router = useRouter();
        const { mutateAsync } = useUpdateSelfNickname(
            router.query.server_id as string
        );
        const handleClose = () => {
            onClose();
        };

        return (
            <Dialog
                sx={{ justifyContent: "center", textAlign: "center" }}
                maxWidth="xs"
                onClose={handleClose}
                open={open}
            >
                <DialogTitle>Edit Server Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You can change how others see you inside this server by
                        setting a server nickname
                    </DialogContentText>
                </DialogContent>
                <Formik
                    initialValues={{
                        nick: "",
                    }}
                    onSubmit={async (values, { setSubmitting }) => {
                        await mutateAsync({ nick: values.nick });
                        setSubmitting(false);
                        handleClose();
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form
                            style={{
                                padding: "1rem",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                gap: "2rem",
                            }}
                        >
                            <Field
                                component={CustomTextField}
                                name="nick"
                                type="text"
                                label="Nickname"
                                required
                            />
                            <DialogActions
                                sx={{
                                    justifyContent: "space-between",
                                    width: "100%",
                                }}
                            >
                                <Button color="error" onClick={handleClose}>
                                    Close
                                </Button>
                                <LoadingButton
                                    variant="contained"
                                    disableElevation
                                    type="submit"
                                    loading={isSubmitting}
                                >
                                    Create
                                </LoadingButton>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        );
    };
