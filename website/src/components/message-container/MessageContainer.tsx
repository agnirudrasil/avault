import {
    AddCircle,
    EmojiEmotions,
    Gif,
    PushPin,
    Send,
} from "@mui/icons-material";
import {
    Divider,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import { ChannelIcon } from "../ChannelIcon";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useRouter } from "next/router";

export const MessageContainer: React.FC = () => {
    const router = useRouter();
    const channel = useChannelsStore(
        state =>
            state.channels[router.query.guild as string]?.[
                router.query.channel as string
            ]
    );

    return (
        <List
            disablePadding
            sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {channel && (
                <ListItem sx={{ width: "100%", bgcolor: "grey.800" }}>
                    <ListItemIcon sx={{ minWidth: "32px" }}>
                        <ChannelIcon />
                    </ListItemIcon>
                    <ListItemText primary={<Typography>general</Typography>} />
                    <ListItemSecondaryAction>
                        <IconButton>
                            <PushPin />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            )}
            <Paper
                component="form"
                sx={{
                    p: "2px 4px",
                    display: "flex",
                    alignItems: "center",
                    m: 2,
                    mt: "auto",
                }}
            >
                <IconButton
                    disabled={!channel}
                    sx={{ p: "10px" }}
                    aria-label="menu"
                >
                    <AddCircle />
                </IconButton>
                <InputBase
                    disabled={!channel}
                    sx={{ ml: 1, flex: 1 }}
                    placeholder={
                        channel
                            ? `Message #${channel.name}`
                            : "Select a channel to get started"
                    }
                    inputProps={{ "aria-label": "Send Message" }}
                />
                <IconButton
                    disabled={!channel}
                    sx={{ p: "10px" }}
                    aria-label="search"
                >
                    <EmojiEmotions />
                </IconButton>
                <IconButton
                    disabled={!channel}
                    sx={{ p: "10px" }}
                    aria-label="search"
                >
                    <Gif />
                </IconButton>
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton
                    disabled={!channel}
                    type="submit"
                    color="primary"
                    sx={{ p: "10px" }}
                    aria-label="directions"
                >
                    <Send />
                </IconButton>
            </Paper>
        </List>
    );
};
