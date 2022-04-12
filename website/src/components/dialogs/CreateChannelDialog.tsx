import { VolumeUp } from "@mui/icons-material";
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
import { useState } from "react";
import { useCreateChannel } from "../../../hooks/requests/useCreateChannel";
import { ChannelIcon } from "../ChannelIcon";
import { Android12Switch } from "../Form/AndroidSwitch";

export interface CreateChannelDialogProps {
    guild_id?: string;
    parent_id?: string;
    open: boolean;
    type: "GUILD_TEXT" | "GUILD_CATEGORY";
    handleClose: () => void;
}

export const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({
    guild_id,
    parent_id,
    open,
    type: channel_type,
    handleClose,
}) => {
    const [type, setType] = useState<
        "GUILD_TEXT" | "GUILD_CATEGORY" | "GUILD_VOICE"
    >(channel_type);
    const [name, setName] = useState("");
    const [privateChannel, setPrivateChannel] = useState(false);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setType((event.target as HTMLInputElement).value as any);
    };
    const { mutateAsync, isLoading } = useCreateChannel();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        switch (type.toUpperCase()) {
            case "GUILD_TEXT":
                return setName(
                    e.target.value.replaceAll(" ", "-").toLowerCase()
                );
            case "GUILD_CATEGORY":
                return setName(e.target.value.toUpperCase());
            case "GUILD_VOICE":
                return setName(e.target.value);
        }
    };

    return (
        <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
            <DialogTitle>
                {type.toUpperCase() === "GUILD_TEXT"
                    ? "Create Text Channel"
                    : type.toUpperCase() === "GUILD_VOICE"
                    ? "Create Voice Channel"
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
                        value={type.toLocaleLowerCase()}
                        onChange={handleChange}
                    >
                        <FormControlLabel
                            value="guild_text"
                            control={<Radio />}
                            label={
                                <ListItemButton
                                    selected={
                                        type.toUpperCase() === "GUILD_TEXT"
                                    }
                                    sx={{ borderRadius: "5px" }}
                                >
                                    <ListItemIcon>
                                        <SvgIcon>
                                            <ChannelIcon />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Text Channel"
                                        secondary="Post links, GIFs, opinions, aand puns"
                                    />
                                </ListItemButton>
                            }
                        />
                        <FormControlLabel
                            value="guild_voice"
                            control={<Radio />}
                            label={
                                <ListItemButton
                                    selected={
                                        type.toUpperCase() === "GUILD_VOICE"
                                    }
                                    sx={{ borderRadius: "5px" }}
                                >
                                    <ListItemIcon>
                                        <VolumeUp />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Voice Channel"
                                        secondary="Hang out with voice, video and screen sharing"
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
                                    selected={
                                        type.toUpperCase() === "GUILD_CATEGORY"
                                    }
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
                    onClick={async () => {
                        await mutateAsync({
                            guild_id,
                            parent_id,
                            name,
                            type,
                            privateChannel,
                        });
                        handleClose();
                    }}
                >
                    Create {type === "GUILD_CATEGORY" ? "Category" : "Channel"}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
