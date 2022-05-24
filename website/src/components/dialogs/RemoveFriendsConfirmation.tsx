import { Clear } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
} from "@mui/material";
import { useState } from "react";
import { useRemoveFriend } from "../../../hooks/requests/useRemoveFriend";
import { Friend } from "../../../stores/useFriendsStore";

export const RemoveFriendConfirmation: React.FC<{ friend: Friend }> = ({
    friend,
}) => {
    const [open, setOpen] = useState(false);
    const { mutateAsync, isLoading } = useRemoveFriend();
    return (
        <>
            <IconButton onClick={() => setOpen(true)} color="error">
                <Clear color="error" />
            </IconButton>
            <Dialog maxWidth="xs" open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    Remove &apos;{friend.user.username}&apos;
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanantly remove{" "}
                        <strong>{friend.user.username}</strong> from your
                        friends?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ bgcolor: "grey.900" }}>
                    <Button onClick={() => setOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <LoadingButton
                        loading={isLoading}
                        onClick={async () => {
                            await mutateAsync(friend.id);
                            setOpen(false);
                        }}
                        color="error"
                        variant="contained"
                        disableElevation
                    >
                        Remove Friend
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};
