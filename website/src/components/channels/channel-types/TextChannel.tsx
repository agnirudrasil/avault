import { PersonAdd, Settings } from "@mui/icons-material";
import { treeItemClasses, TreeItemProps } from "@mui/lab";
import {
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    Typography,
    Link as MuiLink,
    ListItemAvatar,
    useTheme,
} from "@mui/material";
import Link from "next/link";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { useCreateChannel } from "../../../../hooks/useCreateChannel";
import { useCreateInvite } from "../../../../hooks/useCreateInvite";
import { usePermssions } from "../../../../hooks/usePermissions";
import { useUserStore } from "../../../../stores/useUserStore";
import { Channel } from "../../../../types/channels";
import { checkPermissions } from "../../../compute-permissions";
import { copyToClipboard } from "../../../copy";
import { hasUnread } from "../../../has-unread";
import { Permissions } from "../../../permissions";
import { ChannelIcon } from "../../ChannelIcon";
import { ContextMenu } from "../../context-menus/ContextMenu";
import { ContextMenuShape } from "../../context-menus/types";
import { UnreadBadge } from "../UnreadBadge";
import { StyledTreeItemRoot } from "./StyledTreeItemRoot";

type Props = TreeItemProps & {
    channel: Channel;
};

export const TextChannel: React.FC<Props> = ({ channel, ...other }) => {
    const { permissions } = usePermssions(channel.guild_id || "", channel.id);
    const unread = useUserStore(state => state.unread[channel.id]);
    const theme = useTheme();
    const { createInvite } = useCreateInvite();
    const { createChannel } = useCreateChannel();

    const { handleContextMenu, ...props } = useContextMenu();
    const menuObject: ContextMenuShape[][] = [
        [
            {
                label: "Mark As Read",
                visible: true,
                disabled: !hasUnread(unread?.lastRead, unread?.lastMessageId),
                action: handleClose => {
                    handleClose();
                },
            },
        ],
        [
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
                label: "Create Text Channel",
                visible: checkPermissions(
                    permissions,
                    Permissions.MANAGE_CHANNELS
                ),
                action: handleClose => {
                    createChannel({
                        type: "GUILD_TEXT",
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
                action: handleClose => {
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
                <Link
                    href={`/channels/${channel.guild_id || "@me"}/${
                        channel.id
                    }`}
                    passHref
                >
                    <MuiLink sx={{ color: "inherit" }} underline="none">
                        <ListItem
                            dense
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                pl: 0,
                                position: "relative",
                            }}
                            disableGutters
                        >
                            <ContextMenu menuObject={menuObject} {...props} />
                            <UnreadBadge unread={unread} />
                            {unread?.mentionCount &&
                            unread?.mentionCount !== 0 ? (
                                <ListItemAvatar sx={{ minWidth: "0px" }}>
                                    <Stack
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                        sx={{
                                            width: "18px",
                                            height: "18px",
                                            bgcolor: "error.dark",
                                            borderRadius: "50%",
                                            mr: 1,
                                        }}
                                    >
                                        <Typography
                                            component="span"
                                            variant="caption"
                                        >
                                            {unread.mentionCount}
                                        </Typography>
                                    </Stack>
                                </ListItemAvatar>
                            ) : null}
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <ChannelIcon />
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
                                        <IconButton size="small">
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
                    </MuiLink>
                </Link>
            }
            {...other}
        />
    );
};
