import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useCreateInvite } from "../../../hooks/requests/useCreateInvite";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import { CopyButton } from "../Form/CopyButton";

export interface CreateInviteDialogProps {
    channel_id?: string;
    open: boolean;
    handleClose: () => void;
}

export const CreateInviteDialog: React.FC<CreateInviteDialogProps> = ({
    channel_id,
    open,
    handleClose,
}) => {
    const router = useRouter();
    const guilds = useGuildsStore(
        state => state.guilds[router.query.guild as string]
    );
    const channel = useChannelsStore(state => state.getFirstGuildChannel);
    const [max_uses, setMaxUses] = useState(0);
    const [max_age, setMaxAge] = useState(86400);
    const { data, mutate, isLoading } = useCreateInvite();
    channel_id = channel_id || channel(guilds.id)?.id;

    return (
        <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
            <DialogTitle>Invite people to {guilds.name || ""}</DialogTitle>
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    alignItems: "flex-start",
                    justifyContent: "center",
                }}
            >
                <FormControl sx={{ marginTop: "1rem" }} fullWidth>
                    <InputLabel id="max-age-lable">Expire After</InputLabel>
                    <Select
                        labelId="max-age-lable"
                        value={max_age}
                        label="Expire After"
                        onChange={e => setMaxAge(e.target.value as number)}
                    >
                        <MenuItem value={1800}>30 minutes</MenuItem>
                        <MenuItem value={3600}>1 hour</MenuItem>
                        <MenuItem value={21600}>6 hours</MenuItem>
                        <MenuItem value={43200}>12 hours</MenuItem>
                        <MenuItem value={86400}>1 day</MenuItem>
                        <MenuItem value={604800}>7 days</MenuItem>
                        <MenuItem value={0}>Never</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="max-uses-lable">
                        Max Number of Uses
                    </InputLabel>
                    <Select
                        labelId="max-uses-lable"
                        value={max_uses}
                        label="Max Number of Uses"
                        onChange={e => setMaxUses(e.target.value as number)}
                    >
                        <MenuItem value={0}>No limit</MenuItem>
                        <MenuItem value={1}>1 use</MenuItem>
                        <MenuItem value={5}>5 uses</MenuItem>
                        <MenuItem value={10}>10 uses</MenuItem>
                        <MenuItem value={25}>25 uses</MenuItem>
                        <MenuItem value={50}>50 uses</MenuItem>
                        <MenuItem value={100}>100 uses</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    placeholder="Invite Link"
                    disabled={!data}
                    value={
                        data
                            ? `${window.location.host}/invite/${
                                  (data as any)?.id
                              }`
                            : ""
                    }
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <CopyButton
                                    disabled={!data}
                                    text={`${window.location.host}/invite/${
                                        (data as any)?.id
                                    }`}
                                />
                            </InputAdornment>
                        ),
                    }}
                    inputProps={{ readOnly: true }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="inherit"
                    variant="text"
                    size="small"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <LoadingButton
                    color="primary"
                    disableElevation
                    variant="contained"
                    loading={isLoading}
                    onClick={() => {
                        mutate({
                            channelId: channel_id,
                            body: {
                                max_age,
                                max_uses,
                            },
                        } as any);
                    }}
                >
                    Create Link
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
