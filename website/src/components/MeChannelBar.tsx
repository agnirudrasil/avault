import { ListItem } from "@mantine/core";
import { AccessibilityNew, Add, Clear } from "@mui/icons-material";
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    IconButton,
    ListItemAvatar,
    Avatar,
    Link as MuiLink,
    ListItemSecondaryAction,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDeleteChannel } from "../../hooks/requests/useDeleteChannel";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { ChannelBottom } from "./channels";
import { DefaultProfilePic } from "./DefaultProfilePic";
import { LightTooltip } from "./LightTooltip";

export const MeChannelBar = () => {
    const router = useRouter();
    const channels = useChannelsStore(state => state.privateChannels);
    const { mutateAsync } = useDeleteChannel();

    return (
        <List
            sx={{
                height: "100%",
                bgcolor: "grey.900",
                minWidth: "240px",
                width: "max-content",
                display: "flex",
                flexDirection: "column",
            }}
            disablePadding
        >
            <ListItem>
                <Link passHref href="/channels/@me">
                    <ListItemButton
                        selected={router.asPath === "/channels/@me"}
                        sx={{ m: 1, borderRadius: "4px" }}
                    >
                        <ListItemIcon>
                            <AccessibilityNew />
                        </ListItemIcon>
                        <ListItemText primary="Friends" />
                    </ListItemButton>
                </Link>
            </ListItem>
            <List dense sx={{ height: "100%" }}>
                <ListSubheader
                    sx={{
                        bgcolor: "transparent",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    DIRECT MESSAGES{" "}
                    <LightTooltip title="Create DM" placement="top">
                        <IconButton size="small">
                            <Add />
                        </IconButton>
                    </LightTooltip>
                </ListSubheader>

                {Object.keys(channels).map(key => {
                    const channel = channels[key];
                    return (
                        <ListItem
                            sx={{
                                "&:hover .hidden": {
                                    visibility: "visible",
                                },
                            }}
                            key={key}
                        >
                            <Link href={`/channels/@me/${key}`}>
                                <MuiLink
                                    sx={{ color: "white" }}
                                    underline="none"
                                >
                                    <ListItemButton
                                        selected={
                                            router.query.channel === channel.id
                                        }
                                        sx={{ m: 1, borderRadius: "4px" }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={
                                                    channel.recipients[0].avatar
                                                        ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${channel.recipients[0].id}/${channel.recipients[0].avatar}`
                                                        : undefined
                                                }
                                            >
                                                <DefaultProfilePic
                                                    tag={
                                                        channel.recipients[0]
                                                            .tag
                                                    }
                                                />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                channel.recipients[0].username
                                            }
                                        />
                                        <ListItemSecondaryAction
                                            sx={{ visibility: "hidden" }}
                                            className="hidden"
                                        >
                                            <IconButton
                                                onClick={async () => {
                                                    await mutateAsync(
                                                        channel.id
                                                    );
                                                    router.replace(
                                                        "/channels/@me"
                                                    );
                                                }}
                                            >
                                                <Clear />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItemButton>
                                </MuiLink>
                            </Link>
                        </ListItem>
                    );
                })}
            </List>
            <ChannelBottom />
        </List>
    );
};
