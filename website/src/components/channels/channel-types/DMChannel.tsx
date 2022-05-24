import { Clear } from "@mui/icons-material";
import {
    ListItemButton,
    ListItemAvatar,
    Avatar,
    Link as MuiLink,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAcceptFriend } from "../../../../hooks/requests/useAcceptFriend";
import { useAckMessage } from "../../../../hooks/requests/useAckMessage";
import { useDeleteChannel } from "../../../../hooks/requests/useDeleteChannel";
import { useRemoveFriend } from "../../../../hooks/requests/useRemoveFriend";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { useFriendsStore } from "../../../../stores/useFriendsStore";
import { useGuildsStore } from "../../../../stores/useGuildsStore";
import { useUserStore } from "../../../../stores/useUserStore";
import { Channel } from "../../../../types/channels";
import { copyToClipboard } from "../../../copy";
import { hasUnread } from "../../../has-unread";
import { getUser } from "../../../user-cache";
import { ContextMenu } from "../../context-menus/ContextMenu";
import { ContextMenuShape } from "../../context-menus/types";
import { DefaultProfilePic } from "../../DefaultProfilePic";

export const DMChannel: React.FC<{ channel: Channel }> = ({ channel }) => {
    const router = useRouter();
    const { contextMenu, handleClose, handleContextMenu } = useContextMenu();
    const { mutateAsync } = useDeleteChannel();
    const unread = useUserStore(state => state.unread[channel.id]);
    const { mutateAsync: ackMessage } = useAckMessage();
    const guilds = useGuildsStore(state => state.guildPreview);
    const friends = useFriendsStore(state => state.friends);
    const member = channel.recipients[0];
    const { mutate } = useRemoveFriend();
    const { mutateAsync: acceptFriend } = useAcceptFriend();

    const menuObject: ContextMenuShape[][] = [
        [
            {
                label: "Mark As Read",
                visible: true,
                disabled: !hasUnread(unread?.lastRead, unread?.lastMessageId),
                action: async handleClose => {
                    await ackMessage({
                        channel: channel.id,
                        message: unread?.lastMessageId || "",
                    });
                    handleClose();
                },
            },
        ],
        [
            {
                label: "Profile",
                visible: true,
                action: async handleClose => {
                    copyToClipboard(channel.id);
                    handleClose();
                },
            },
            {
                label: "Call",
                visible: true,
                action: async handleClose => {
                    copyToClipboard(channel.id);
                    handleClose();
                },
            },
            {
                label: "Close DM",
                visible: true,
                action: async handleClose => {
                    await mutateAsync(channel.id);
                    handleClose();
                },
            },
        ],
        [
            {
                label: "Invite to Server",
                visible: Object.keys(guilds).length > 0,
                action: handleClose => {
                    handleClose();
                },
                children: Object.keys(guilds).map(guild_id => ({
                    label: guilds[guild_id].name,
                    visible: true,
                    action: handleClose => {
                        handleClose();
                    },
                })),
            },
            {
                label:
                    friends[member.id] && friends[member.id].type !== 2
                        ? "Remove Friend"
                        : "Add Friend",
                disabled: friends[member.id]?.type === 2,
                visible: member.bot ? false : getUser() !== member.id,
                action: async handleClose => {
                    if (friends[member.id]) {
                        mutate(member.id);
                    } else {
                        await acceptFriend({ id: member.id });
                    }
                    handleClose();
                },
            },
            {
                label: friends[member.id]?.type === 2 ? "Unblock" : "Block",
                visible: getUser() !== member.id,
                action: async handleClose => {
                    if (friends[member.id]?.type === 2) {
                        mutate(member.id);
                        handleClose();
                    } else {
                        await acceptFriend({ id: member.id, type: 2 });
                        handleClose();
                    }
                },
            },
        ],
        [
            {
                label: "Copy ID",
                action: handleClose => {
                    copyToClipboard(channel.recipients[0].id);
                    handleClose();
                },
                visible: true,
            },
        ],
    ];

    return (
        <Link passHref href={`/channels/@me/${channel.id}`}>
            <MuiLink sx={{ color: "white" }} underline="none">
                <ListItemButton
                    onContextMenu={handleContextMenu}
                    selected={router.query.channel === channel.id}
                    sx={{
                        borderRadius: "4px",
                        m: 1,
                        "&:hover .hidden": {
                            visibility: "visible",
                        },
                    }}
                >
                    <ContextMenu
                        contextMenu={contextMenu}
                        handleClose={handleClose}
                        menuObject={menuObject}
                    />
                    <ListItemAvatar>
                        <Avatar
                            src={
                                channel.recipients[0].avatar
                                    ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${channel.recipients[0].id}/${channel.recipients[0].avatar}`
                                    : undefined
                            }
                        >
                            <DefaultProfilePic
                                tag={channel.recipients[0].tag}
                            />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        sx={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                        }}
                        primary={channel.recipients[0].username}
                    />
                    <ListItemSecondaryAction
                        sx={{ visibility: "hidden" }}
                        className="hidden"
                    >
                        <IconButton
                            onClick={async () => {
                                await mutateAsync(channel.id);
                                router.replace("/channels/@me");
                            }}
                        >
                            <Clear />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItemButton>
            </MuiLink>
        </Link>
    );
};
