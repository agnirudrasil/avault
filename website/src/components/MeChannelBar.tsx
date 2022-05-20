import { ListItem } from "@mantine/core";
import { AccessibilityNew } from "@mui/icons-material";
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import shallow from "zustand/shallow";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { useUserStore } from "../../stores/useUserStore";
import { ChannelBottom } from "./channels";
import { orderBy } from "lodash";
import { DMChannel } from "./channels/channel-types/DMChannel";
import { CreateDMPicker } from "./CreateDmPicker";
import { ChannelTypes } from "../../types/channels";
import { GroupDMChannel } from "./channels/channel-types/GroupDMChannel";

export const MeChannelBar = () => {
    const router = useRouter();
    const channels = useChannelsStore(state => state.privateChannels);

    const unread = useUserStore(
        state =>
            Object.entries(state.unread)
                .filter(([k]) => k in channels)
                .reduce((acc, curr) => {
                    acc[curr[0]] = curr[1].lastMessageId
                        ? BigInt(curr[1].lastMessageId)
                        : undefined;
                    return acc;
                }, {} as Record<string, bigint | undefined>),
        shallow
    );

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
            <List
                subheader={
                    <ListSubheader
                        sx={{
                            bgcolor: "transparent",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        DIRECT MESSAGES <CreateDMPicker />
                    </ListSubheader>
                }
                dense
                sx={{
                    height: "100%",
                    maxHeight: "100%",
                    overflowY: "auto",
                    width: "100%",
                }}
            >
                {orderBy(Object.keys(channels), [k => unread[k]], ["desc"]).map(
                    key => {
                        const channel = channels[key];
                        return channel.type === ChannelTypes.group_dm ? (
                            <GroupDMChannel channel={channel} />
                        ) : (
                            <DMChannel channel={channel} key={key} />
                        );
                    }
                )}
            </List>
            <ChannelBottom />
        </List>
    );
};
