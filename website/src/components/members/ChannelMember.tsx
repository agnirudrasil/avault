import { AcUnit } from "@mui/icons-material";
import {
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    ListItemIcon,
} from "@mui/material";
import { useAcceptFriend } from "../../../hooks/requests/useAcceptFriend";
import { useRemoveDmRecipient } from "../../../hooks/requests/useRemoveDmRecipient";
import { useRemoveFriend } from "../../../hooks/requests/useRemoveFriend";
import { useChannelUpdate } from "../../../hooks/requests/useUpdateChannel";
import { useContextMenu } from "../../../hooks/useContextMenu";
import { useFriendsStore } from "../../../stores/useFriendsStore";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import { User } from "../../../stores/useUserStore";
import { copyToClipboard } from "../../copy";
import { getUser } from "../../user-cache";
import { ContextMenu } from "../context-menus/ContextMenu";
import { ContextMenuShape } from "../context-menus/types";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { LightTooltip } from "../LightTooltip";

export const ChannelMember: React.FC<{
    member: User;
    owner: boolean;
    ownerId: string;
    channelId: string;
}> = ({ member, owner, ownerId, channelId }) => {
    const guilds = useGuildsStore(state => state.guildPreview);
    const friends = useFriendsStore(state => state.friends);
    const { handleContextMenu, ...rest } = useContextMenu();
    const { mutate } = useRemoveFriend();
    const { mutateAsync } = useAcceptFriend();
    const { mutateAsync: removeRecipient } = useRemoveDmRecipient();
    const { mutateAsync: updateChannel } = useChannelUpdate();

    const menuObject: ContextMenuShape[][] = [
        [
            {
                label: "Profile",
                action: handleClose => {
                    handleClose();
                },
                visible: true,
            },
            {
                label: "Mention",
                action: handleClose => {
                    handleClose();
                },
                visible: true,
            },
            {
                label: "Message",
                action: handleClose => {
                    handleClose();
                },
                visible: member.id !== getUser(),
            },
            {
                label: "Call",
                action: handleClose => {
                    handleClose();
                },
                visible: member.id !== getUser(),
            },
        ],
        [
            {
                label: "Remove From Group",
                action: async handleClose => {
                    await removeRecipient({
                        channelId,
                        userId: member.id,
                    });
                    handleClose();
                },
                visible: ownerId === getUser() && member.id !== getUser(),
                color: "error.dark",
            },
            {
                label: "Make Group Owner",
                action: async handleClose => {
                    await updateChannel({
                        channelId,
                        data: {
                            owner_id: member.id,
                        },
                    });
                    handleClose();
                },
                visible: ownerId === getUser() && member.id !== getUser(),
                color: "error.dark",
            },
        ],
        [
            {
                label: "Invite to Server",
                visible: true,
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
                        await mutateAsync({ id: member.id });
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
                        await mutateAsync({ id: member.id, type: 2 });
                        handleClose();
                    }
                },
            },
        ],
        [
            {
                label: "Copy ID",
                action: handleClose => {
                    copyToClipboard(member.id);
                    handleClose();
                },
                visible: true,
            },
        ],
    ];

    return (
        <ListItemButton
            onContextMenu={handleContextMenu}
            sx={{ borderRadius: 2 }}
        >
            <ContextMenu {...rest} menuObject={menuObject} />
            <ListItemAvatar>
                <Avatar
                    src={
                        member.avatar
                            ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${member.id}/${member.avatar}`
                            : undefined
                    }
                >
                    <DefaultProfilePic tag={member.tag} />
                </Avatar>
            </ListItemAvatar>
            {owner && (
                <LightTooltip title="Owner">
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <AcUnit color="warning" />
                    </ListItemIcon>
                </LightTooltip>
            )}
            <ListItemText
                sx={{ width: "100%", whiteSpace: "nowrap" }}
                primary={<Typography>{member.username}</Typography>}
            />
        </ListItemButton>
    );
};
