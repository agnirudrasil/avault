import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from "@mui/material";
import { useState } from "react";
import { useCreateApplication } from "../../../hooks/requests/useCreateApplication";

interface Props {
    open: boolean;
    onClose: () => void;
}

export const CreateApplicationDialog: React.FC<Props> = ({ open, onClose }) => {
    const [value, setValue] = useState("");
    const { mutateAsync, isLoading } = useCreateApplication();

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>CREATE AN APPLICATION</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Choose a name for your application. You can change it later
                </DialogContentText>
                <TextField
                    sx={{ mt: 1 }}
                    label="NAME"
                    fullWidth
                    value={value}
                    required
                    onChange={e => setValue(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="error" onClick={onClose}>
                    Cancel
                </Button>
                <LoadingButton
                    loading={isLoading}
                    disabled={!value}
                    variant="contained"
                    disableElevation
                    onClick={async () => {
                        await mutateAsync({ name: value });
                        onClose();
                    }}
                >
                    Create
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
