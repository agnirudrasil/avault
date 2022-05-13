import { LoadingButton } from "@mui/lab";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from "@mui/material";
import { useState } from "react";
import { useDeleteOAuth2Tokens } from "../../../hooks/requests/useDeleteOAuth2Tokens";

export const ConfirmDeauthorize: React.FC<{ id: string }> = ({ id }) => {
    const [open, setOpen] = useState(false);
    const { mutateAsync, isLoading } = useDeleteOAuth2Tokens(id);

    return (
        <>
            <LoadingButton
                onClick={() => setOpen(true)}
                color="error"
                variant="outlined"
            >
                Deauthorize
            </LoadingButton>
            <Dialog
                maxWidth="xs"
                fullWidth={false}
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>DEAUTHORIZE APPLICATION</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This action will remove the link between your AVAULT
                        account and this application
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
                        Deauthorize
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};
