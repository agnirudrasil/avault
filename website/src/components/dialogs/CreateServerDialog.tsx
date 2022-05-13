import { AddAPhoto } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Avatar,
    Link,
    Stack,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/router";
import { useGuildCreate } from "../../../hooks/requests/useGuildCreate";
import { CustomTextField } from "../CustomTextField";

export interface CreateServerDialogProps {
    open: boolean;
    onClose: () => void;
}

export const CreateServerDialog: React.FC<CreateServerDialogProps> = props => {
    const router = useRouter();
    const { onClose, open } = props;
    const { mutateAsync } = useGuildCreate();

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
            <DialogTitle>Create a server</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Give your new server a personality with a name and an icon.
                    You can always change it later
                </DialogContentText>
            </DialogContent>
            <Formik
                initialValues={{
                    name: "",
                    icon: undefined,
                }}
                onSubmit={async (values, { setSubmitting }) => {
                    const { id } = await mutateAsync(values);
                    setSubmitting(false);
                    handleClose();
                    router.replace(`/channels/${id}`);
                }}
            >
                {({ setFieldValue, isSubmitting, values }) => (
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
                        <label htmlFor="icon-button-file">
                            <Stack alignItems="center" justifyItems="center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    value={""}
                                    id="icon-button-file"
                                    style={{ display: "none" }}
                                    onChange={e => {
                                        if (e.target.files) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                setFieldValue(
                                                    "icon",
                                                    reader.result
                                                );
                                            };
                                            reader.readAsDataURL(
                                                e.target.files[0]
                                            );
                                        }
                                    }}
                                />
                                <Avatar
                                    src={values.icon}
                                    sx={{
                                        width: "80px",
                                        height: "80px",
                                        cursor: "pointer",
                                    }}
                                    component="span"
                                >
                                    <AddAPhoto />
                                </Avatar>
                                {values.icon && (
                                    <Link
                                        onClick={() =>
                                            setFieldValue("icon", null)
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
                        </label>
                        <Field
                            component={CustomTextField}
                            name="name"
                            type="text"
                            label="Server Name"
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
