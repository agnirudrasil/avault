import {
    CheckBox,
    CheckBoxOutlineBlank,
    PersonAdd,
    Settings,
    VolumeUp,
} from "@mui/icons-material";
import { treeItemClasses, TreeItemProps } from "@mui/lab";
import {
    Avatar,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { useState } from "react";
import shallow from "zustand/shallow";
import { useDeleteChannel } from "../../../../hooks/requests/useDeleteChannel";
import { useChannelUpdate } from "../../../../hooks/requests/useUpdateChannel";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { useCreateChannel } from "../../../../hooks/useCreateChannel";
import { useCreateInvite } from "../../../../hooks/useCreateInvite";
import { usePermssions } from "../../../../hooks/usePermissions";
import { useChannelsStore } from "../../../../stores/useChannelsStore";
import { Channel } from "../../../../types/channels";
import { checkPermissions } from "../../../compute-permissions";
import { copyToClipboard } from "../../../copy";
import { Permissions } from "../../../permissions";
import { ContextMenu } from "../../context-menus/ContextMenu";
import { ContextMenuShape } from "../../context-menus/types";
import { DefaultProfilePic } from "../../DefaultProfilePic";
import { StyledTreeItemRoot } from "./StyledTreeItemRoot";

type Props = TreeItemProps & {
    channel: Channel;
};

export const VoiceChannel: React.FC<Props> = ({ channel, ...other }) => {
    const { permissions } = usePermssions(channel.guild_id || "", channel.id);
    const [hidden, setHidden] = useState(false);
    const theme = useTheme();
    const { createInvite } = useCreateInvite();
    const { createChannel } = useCreateChannel();
    const { mutateAsync } = useDeleteChannel(channel.id);

    const channels = useChannelsStore(
        state =>
            Object.keys(state.channels[channel.guild_id || ""] ?? {})
                .filter(key => {
                    const c = state.channels[channel.guild_id || ""]?.[key];
                    return c?.type === "GUILD_CATEGORY";
                })
                .map(id => state.channels[channel.guild_id || ""][id]),
        shallow
    );
    const { mutateAsync: editChannel } = useChannelUpdate();

    const { handleContextMenu, ...props } = useContextMenu();

    const menuObject: ContextMenuShape[][] = [
        [
            {
                label: "Hide Names",
                visible: true,
                action: () => {
                    setHidden(h => !h);
                },
                icon: !hidden ? <CheckBoxOutlineBlank /> : <CheckBox />,
            },
            {
                label: "Edit Channel",
                visible: checkPermissions(
                    permissions,
                    Permissions.MANAGE_CHANNELS
                ),
                action: handleClose => {
                    handleClose();
                },
            },
        ],
        [
            {
                label: "Invite People",
                visible: checkPermissions(
                    permissions,
                    Permissions.CREATE_INSTANT_INVITE
                ),
                action: handleClose => {
                    createInvite({ channel_id: channel.id });
                    handleClose();
                },
                color: theme.palette.primary.dark,
            },
            {
                label: "Clone Channel",
                visible: checkPermissions(
                    permissions,
                    Permissions.MANAGE_CHANNELS
                ),
                action: handleClose => {
                    handleClose();
                },
            },
            {
                label: "Move To",
                visible:
                    checkPermissions(
                        permissions,
                        Permissions.MANAGE_CHANNELS
                    ) &&
                    channels.filter(({ id }) => id !== channel.parent_id)
                        .length > 0,
                action: handleClose => {
                    handleClose();
                },
                children: channels
                    .filter(({ id }) => id !== channel.parent_id)
                    .map(c => ({
                        label: c.name,
                        visible: true,
                        action: async handleClose => {
                            await editChannel({
                                channelId: channel.id,
                                data: {
                                    name: channel.name,
                                    topic: channel.topic || "",
                                    parent_id: c.id,
                                },
                            });
                            handleClose();
                        },
                    })),
            },
            {
                label: "Create Voice Channel",
                visible: checkPermissions(
                    permissions,
                    Permissions.MANAGE_CHANNELS
                ),
                action: handleClose => {
                    createChannel({
                        type: "GUILD_VOICE",
                        parent_id: channel.parent_id,
                    });
                    handleClose();
                },
            },
            {
                label: "Copy Link",
                visible: true,
                action: handleClose => {
                    copyToClipboard(
                        `${window.location.origin}/channels/${channel.guild_id}/${channel.id}`
                    );
                    handleClose();
                },
            },
        ],
        [
            {
                label: "Delete Channel",
                visible: checkPermissions(
                    permissions,
                    Permissions.MANAGE_CHANNELS
                ),
                action: async handleClose => {
                    await mutateAsync();
                    handleClose();
                },
                color: theme.palette.error.dark,
            },
        ],
        [
            {
                label: "Copy ID",
                visible: true,
                action: handleClose => {
                    copyToClipboard(channel.id);
                    handleClose();
                },
            },
        ],
    ];

    return (
        <div>
            <StyledTreeItemRoot
                onContextMenu={e => {
                    e.stopPropagation();
                    handleContextMenu(e);
                }}
                sx={{
                    [`& .${treeItemClasses.iconContainer}`]: {
                        width: 0,
                    },
                }}
                label={
                    <Stack>
                        <ListItem
                            dense
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                pl: 0,
                            }}
                            disableGutters
                        >
                            <ContextMenu {...props} menuObject={menuObject} />
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <VolumeUp />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: "inherit",
                                            flexGrow: 1,
                                            maxWidth: "100%",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {channel.name}
                                    </Typography>
                                }
                            />
                            <ListItemSecondaryAction
                                sx={{ visibility: "hidden" }}
                                className="channel-settings"
                            >
                                <Stack direction="row">
                                    {checkPermissions(
                                        permissions,
                                        Permissions.CREATE_INSTANT_INVITE
                                    ) && (
                                        <IconButton
                                            onClick={() => {
                                                createInvite({
                                                    channel_id: channel.id,
                                                });
                                            }}
                                            size="small"
                                        >
                                            <PersonAdd />
                                        </IconButton>
                                    )}
                                    {checkPermissions(
                                        permissions,
                                        Permissions.MANAGE_CHANNELS
                                    ) && (
                                        <IconButton size="small">
                                            <Settings />
                                        </IconButton>
                                    )}
                                </Stack>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </Stack>
                }
                {...other}
            />
            <List sx={{ ml: 2 }} dense>
                {Array(10)
                    .fill(0)
                    .map((_, i) => (
                        <ListItemButton key={i}>
                            <ListItemAvatar sx={{ minWidth: 0, mr: 1 }}>
                                <Avatar sx={{ width: "24px", height: "24px" }}>
                                    <DefaultProfilePic
                                        width={24}
                                        height={24}
                                        tag="#6253"
                                    />
                                </Avatar>
                            </ListItemAvatar>
                            {!hidden && (
                                <ListItemText primary={"lorem ipsum"} />
                            )}
                        </ListItemButton>
                    ))}
            </List>
        </div>
    );
};
