import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import { useState } from "react";
import { useLogout } from "../../../hooks/requests/useLogout";

export const ConfirmLogout: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { mutateAsync, isLoading } = useLogout();

    return (
        <>
            <ListItemButton
                onClick={() => setOpen(true)}
                sx={{
                    borderRadius: "5px",
                    color: "error.dark",
                }}
            >
                <ListItemText primary="Log Out" />
            </ListItemButton>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Log Out</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log out?
                    </DialogContentText>
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
                        loading={isLoading}
                        onClick={async () => {
                            await mutateAsync();
                        }}
                        variant="contained"
                        disableElevation
                        color="error"
                    >
                        Log out
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};
