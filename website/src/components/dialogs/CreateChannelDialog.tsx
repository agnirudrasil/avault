import { LoadingButton } from "@mui/lab";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    FormControl,
    FormLabel,
    Typography,
    FormControlLabel,
    Radio,
    ListItemButton,
    ListItemIcon,
    SvgIcon,
    ListItemText,
    DialogContentText,
    DialogActions,
    Button,
    RadioGroup,
    TextField,
} from "@mui/material";
import produce from "immer";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { useCreateChannel } from "../../../hooks/requests/useCreateChannel";
import { ChannelIcon } from "../ChannelIcon";
import { Android12Switch } from "../Form/AndroidSwitch";

export interface CreateChannelDialogProps {
    guild_id?: string;
    parent_id?: string;
    open: boolean;
    type: "guild_text" | "guild_category";
    handleClose: () => void;
}

export const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({
    guild_id,
    parent_id,
    open,
    type: channel_type,
    handleClose,
}) => {
    const [type, setType] = useState<"guild_text" | "guild_category">(
        channel_type
    );
    const [name, setName] = useState("");
    const [privateChannel, setPrivateChannel] = useState(false);
    const queryClient = useQueryClient();
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setType((event.target as HTMLInputElement).value as any);
    };
    const { mutate, isLoading } = useCreateChannel();

    const router = useRouter();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        switch (type) {
            case "guild_text":
                return setName(
                    e.target.value.replaceAll(" ", "-").toLowerCase()
                );
            case "guild_category":
                return setName(e.target.value.toUpperCase());
        }
    };

    useEffect(() => {
        switch (type) {
            case "guild_text":
                return setName(prevName =>
                    prevName.replaceAll(" ", "-").toLowerCase()
                );
            case "guild_category":
                return setName(prevName => prevName.toUpperCase());
        }
    }, [type]);

    return (
        <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
            <DialogTitle>
                {type === "guild_text"
                    ? "Create Text Channel"
                    : "Create Category"}
            </DialogTitle>
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    alignItems: "flex-start",
                    justifyContent: "center",
                }}
            >
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        <Typography variant="button">CHANNEL TYPE</Typography>
                    </FormLabel>
                    <RadioGroup
                        aria-label="channel"
                        name="controlled-radio-buttons-group"
                        value={type}
                        onChange={handleChange}
                    >
                        <FormControlLabel
                            value="guild_text"
                            control={<Radio />}
                            label={
                                <ListItemButton
                                    selected={type === "guild_text"}
                                    sx={{ borderRadius: "5px" }}
                                >
                                    <ListItemIcon>
                                        <SvgIcon>
                                            <ChannelIcon />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Text Channel"
                                        secondary="Create a group for similar channels"
                                    />
                                </ListItemButton>
                            }
                        />
                        <FormControlLabel
                            value="guild_category"
                            control={<Radio />}
                            label={
                                <ListItemButton
                                    sx={{ borderRadius: "5px" }}
                                    selected={type === "guild_category"}
                                >
                                    <ListItemIcon>
                                        <SvgIcon>
                                            <ChannelIcon />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Category"
                                        secondary="Create a group for similar channels"
                                    />
                                </ListItemButton>
                            }
                        />
                    </RadioGroup>
                </FormControl>
                <TextField
                    fullWidth
                    label="Channel Name"
                    value={name}
                    onChange={handleNameChange}
                />
                <FormControlLabel
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexDirection: "row-reverse",
                        width: "95%",
                    }}
                    control={
                        <Android12Switch
                            checked={privateChannel}
                            onChange={e => setPrivateChannel(e.target.checked)}
                        />
                    }
                    label="Private Channel"
                />
                <DialogContentText>
                    By making a channel private, only select members and roles
                    will be able to view this channel
                </DialogContentText>
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
                        console.log({
                            guild_id,
                            parent_id,
                            name,
                            type,
                            privateChannel,
                        });
                        mutate(
                            {
                                guild_id,
                                parent_id,
                                name,
                                type,
                                privateChannel,
                            },
                            {
                                onSettled: data => {
                                    queryClient.setQueryData(
                                        ["guild", router.query.server_id],
                                        old => {
                                            return produce(
                                                old,
                                                (draft: any) => {
                                                    draft.guild.channels.push(
                                                        data.channel
                                                    );
                                                }
                                            );
                                        }
                                    );
                                    handleClose();
                                },
                            }
                        );
                    }}
                >
                    Create {type === "guild_category" ? "Category" : "Channel"}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
