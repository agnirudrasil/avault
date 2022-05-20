import {
    AlternateEmail,
    Call,
    Group,
    PersonAddAlt1,
    PushPin,
    Videocam,
} from "@mui/icons-material";
import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import { ChannelIcon } from "../ChannelIcon";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useRouter } from "next/router";
import { Messages } from "./Messages";
import { MarkAsRead } from "./MarkAsRead";
import MessageBox from "./message-box";
import { getGroupDMName } from "../../getGroupDmName";

export const MessageContainer: React.FC = () => {
    const router = useRouter();
    const channel = useChannelsStore(state =>
        router.query.guild
            ? state.channels[router.query.guild as string]?.[
                  router.query.channel as string
              ]
            : state.privateChannels[router.query.channel as string]
    );

    return (
        <List
            disablePadding
            sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {channel && (
                <Stack sx={{ width: "100%" }}>
                    <ListItem
                        sx={{
                            maxWidth: "100%",
                            width: "100%",
                            bgcolor: "grey.800",
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: "32px" }}>
                            {channel.type === "DM" ? (
                                <AlternateEmail />
                            ) : channel.type === "GROUP_DM" ? (
                                <Group />
                            ) : (
                                <ChannelIcon />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            sx={{ maxWidth: "100%" }}
                            primary={
                                <Stack
                                    spacing={1}
                                    direction="row"
                                    divider={
                                        <Divider
                                            flexItem
                                            orientation="vertical"
                                        />
                                    }
                                >
                                    <Typography>
                                        {channel.type === "DM"
                                            ? channel.recipients[0].username
                                            : channel.type === "GROUP_DM"
                                            ? getGroupDMName(channel)
                                            : channel.name}
                                    </Typography>
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
                            {(channel.type === "DM" ||
                                channel.type === "GROUP_DM") && (
                                <>
                                    <IconButton>
                                        <Call />
                                    </IconButton>
                                    <IconButton>
                                        <Videocam />
                                    </IconButton>
                                </>
                            )}
                            {channel.type === "GROUP_DM" && (
                                <IconButton>
                                    <PersonAddAlt1 />
                                </IconButton>
                            )}
                            <IconButton>
                                <PushPin />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <MarkAsRead channelId={router.query.channel as string} />
                </Stack>
            )}
            <div style={{ marginBottom: "auto" }} />
            {channel && <Messages channel={channel} />}
            <MessageBox channel={channel} />
        </List>
    );
};
