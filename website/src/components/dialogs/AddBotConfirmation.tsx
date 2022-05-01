import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import { useCreateApplicationBot } from "../../../hooks/requests/useCreateApplicationBot";

interface Props {
    open: boolean;
    onClose: () => void;
    id: string;
}
export const AddBotConfirmation: React.FC<Props> = ({ onClose, open, id }) => {
    const { mutateAsync, isLoading } = useCreateApplicationBot();
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>ADD A BOT TO THIS APP?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Adding a bot user gives your app visible life in AVAULT.
                    However, this action is irreversible! Choose wisely.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="inherit" onClick={onClose}>
                    Nervermind
                </Button>
                <LoadingButton
                    loading={isLoading}
                    onClick={async () => {
                        await mutateAsync(id);
                        onClose();
                    }}
                    variant="contained"
                    disableElevation
                >
                    Yes, do it!
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
