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
} from "@mui/material";
import Link from "next/link";
import { usePermssions } from "../../../../hooks/usePermissions";
import { useUserStore } from "../../../../stores/useUserStore";
import { Channel } from "../../../../types/channels";
import { checkPermissions } from "../../../compute-permissions";
import { Permissions } from "../../../permissions";
import { ChannelIcon } from "../../ChannelIcon";
import { UnreadBadge } from "../UnreadBadge";
import { StyledTreeItemRoot } from "./StyledTreeItemRoot";

type Props = TreeItemProps & {
    channel: Channel;
};

export const TextChannel: React.FC<Props> = ({ channel, ...other }) => {
    const { permissions } = usePermssions(channel.guild_id || "", channel.id);
    const unread = useUserStore(state => state.unread[channel.id]);

    return (
        <StyledTreeItemRoot
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
                            <UnreadBadge unread={unread} />
                            {unread.mentionCount &&
                            unread.mentionCount !== 0 ? (
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
