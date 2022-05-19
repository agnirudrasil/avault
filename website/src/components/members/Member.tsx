import {
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useAcceptFriend } from "../../../hooks/requests/useAcceptFriend";
import { useCreateDMChannel } from "../../../hooks/requests/useCreateDMChannel";
import { useRemoveFriend } from "../../../hooks/requests/useRemoveFriend";
import { useContextMenu } from "../../../hooks/useContextMenu";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useFriendsStore } from "../../../stores/useFriendsStore";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import { useRolesStore } from "../../../stores/useRolesStore";
import { GuildMembers } from "../../../stores/useUserStore";
import { copyToClipboard } from "../../copy";
import { getUser } from "../../user-cache";
import { BotIndication } from "../BotIndication";
import { ContextMenu } from "../context-menus/ContextMenu";
import { ContextMenuShape } from "../context-menus/types";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { StyledBadge } from "../StyledBadge";

export const Member: React.FC<{ member: GuildMembers }> = ({ member }) => {
    const router = useRouter();
    const { contextMenu, handleClose, handleContextMenu } = useContextMenu();
    const guilds = useGuildsStore(state => state.guildPreview);
    const roles = useRolesStore(state => state[member.guild_id]);
    const friends = useFriendsStore(state => state.friends);
    const { mutateAsync } = useAcceptFriend();
    const { mutate } = useRemoveFriend();
    const { mutateAsync: createDM } = useCreateDMChannel();
    const channels = useChannelsStore(state => state.privateChannels);

    const menuObject: ContextMenuShape[][] = [
        [
            {
                label: "Profile",
                visible: true,
                action: handleClose => {
                    handleClose();
                },
            },
            {
                label: "Mention",
                visible: true,
                action: handleClose => {
                    handleClose();
                },
            },
            {
                label: "Message",
                visible: getUser() !== member.user.id,
                action: async handleClose => {
                    const channel = Object.keys(channels).find(key => {
                        const channel = channels[key];
                        return (
                            channel.type === "DM" &&
                            channel.recipients[0].id === member.user.id
                        );
                    });
                    if (channel) {
                        router.replace(`/channels/@me/${channel}`);
                    } else {
                        const channel = await createDM({
                            recipient_ids: [member.user.id],
                        });

                        router.replace(`/channels/@me/${channel.id}`);
                    }
                    handleClose();
                },
            },
            {
                label: "Call",
                visible: getUser() !== member.user.id,
                action: handleClose => {
                    handleClose();
                },
            },
        ],
        [
            {
                label: "Change Nickname",
                visible: true,
                action: handleClose => {
                    handleClose();
                },
            },
            {
                label: "Invite to Server",
                visible:
                    Object.keys(guilds).filter(
                        guild => guild !== member.guild_id
                    ).length > 0,
                action: handleClose => {
                    handleClose();
                },
                children: Object.keys(guilds)
                    .filter(guild => guild !== member.guild_id)
                    .map(guild_id => ({
                        label: guilds[guild_id].name,
                        visible: true,
                        action: handleClose => {
                            handleClose();
                        },
                    })),
            },
            {
                label:
                    friends[member.user.id] &&
                    friends[member.user.id].type !== 2
                        ? "Remove Friend"
                        : "Add Friend",
                disabled: friends[member.user.id]?.type === 2,
                visible: member.user.bot ? false : getUser() !== member.user.id,
                action: async handleClose => {
                    if (friends[member.user.id]) {
                        mutate(member.user.id);
                    } else {
                        await mutateAsync({ id: member.user.id });
                    }
                    handleClose();
                },
            },
            {
                label:
                    friends[member.user.id]?.type === 2 ? "Unblock" : "Block",
                visible: getUser() !== member.user.id,
                action: async handleClose => {
                    if (friends[member.user.id]?.type === 2) {
                        mutate(member.user.id);
                        handleClose();
                    } else {
                        await mutateAsync({ id: member.user.id, type: 2 });
                        handleClose();
                    }
                },
            },
        ],
        [
            {
                label: "Timeout " + (member.nick || member.user.username),
                visible: getUser() !== member.user.id,
                action: () => {},
                color: "error.dark",
            },
            {
                label: "Kick " + (member.nick || member.user.username),
                visible: getUser() !== member.user.id,
                action: () => {},
                color: "error.dark",
            },
            {
                label: "Ban " + (member.nick || member.user.username),
                visible: getUser() !== member.user.id,
                action: () => {},
                color: "error.dark",
            },
        ],
        [
            {
                label: "Roles",
                visible: true,
                action: () => {},
                children: roles.map(role => ({
                    label: role.name,
                    action: handleClose => handleClose(),
                    visible: role.id !== member.guild_id,
                })),
            },
            {
                label: "Copy ID",
                action: handleClose => {
                    copyToClipboard(member.user.id);
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
            <ContextMenu
                contextMenu={contextMenu}
                handleClose={handleClose}
                menuObject={menuObject}
            />
            <ListItemAvatar>
                <StyledBadge
                    borderColor={theme => theme.palette.grey[900]}
                    overlap="circular"
                    color="success"
                    badgeContent=""
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                >
                    <Avatar
                        src={
                            member.user.avatar
                                ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${member.user.id}/${member.user.avatar}`
                                : undefined
                        }
                    >
                        <DefaultProfilePic tag={member.user.tag} />
                    </Avatar>
                </StyledBadge>
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Typography>
                        {member.nick || member.user.username}{" "}
                        {member.user.bot && <BotIndication />}
                    </Typography>
                }
            />
        </ListItemButton>
    );
};
