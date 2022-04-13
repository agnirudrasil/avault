import {
    AddCircle,
    EmojiEmotions,
    Gif,
    MarkChatRead,
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
    Stack,
    Typography,
    Button,
} from "@mui/material";
import { ChannelIcon } from "../ChannelIcon";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useRouter } from "next/router";
import { Messages } from "./Messages";

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
                maxWidth: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {channel && (
                <ListItem
                    sx={{
                        maxWidth: "100%",
                        width: "100%",
                        bgcolor: "grey.800",
                    }}
                >
                    <ListItemIcon sx={{ minWidth: "32px" }}>
                        <ChannelIcon />
                    </ListItemIcon>
                    <ListItemText
                        sx={{ maxWidth: "100%" }}
                        primary={
                            <Stack
                                spacing={1}
                                direction="row"
                                divider={
                                    <Divider flexItem orientation="vertical" />
                                }
                            >
                                <Typography>{channel.name}</Typography>
                                {channel.topic && (
                                    <Typography
                                        sx={{
                                            maxWidth: "100%",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            userSelect: "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {channel.topic}
                                    </Typography>
                                )}
                            </Stack>
                        }
                    />
                    <ListItemSecondaryAction>
                        <IconButton>
                            <PushPin />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            )}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    width: "98%",
                    bgcolor: "primary.dark",
                    m: "auto",
                    p: "0px 12px",
                    borderBottomLeftRadius: 7,
                    borderBottomRightRadius: 7,
                }}
            >
                <Typography sx={{ userSelect: "none" }}>
                    You have unread messages
                </Typography>
                <Button
                    size="small"
                    disableRipple
                    disableElevation
                    endIcon={<MarkChatRead />}
                >
                    Mark as read
                </Button>
            </Stack>
            <Messages />
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
