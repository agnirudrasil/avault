import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { useDeleteChannel } from "../../../hooks/requests/useDeleteChannel";
import { Channel } from "../../../types/channels";
import { getGroupDMName } from "../../getGroupDmName";

export const ConfirmLeaveGroupDM: React.FC<{
    channel: Channel;
    children: (fn: (p: true) => any) => ReactNode;
}> = ({ children, channel }) => {
    const [open, setOpen] = useState(false);
    const { mutateAsync, isLoading } = useDeleteChannel();

    return (
        <>
            {children(setOpen)}
            <Dialog maxWidth="sm" open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    Leave &apos;{getGroupDMName(channel)}&apos;
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to leave{" "}
                        <strong>{getGroupDMName(channel)}</strong>? You
                        won&apos;t be able to rejoin this group unless you are
                        re-invited.
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
                            await mutateAsync(channel.id);
                        }}
                        variant="contained"
                        disableElevation
                        color="error"
                    >
                        Leave Group
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};
