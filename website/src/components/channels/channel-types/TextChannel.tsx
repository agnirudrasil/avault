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
} from "@mui/material";
import { Box } from "@mui/system";
import Link from "next/link";
import { usePermssions } from "../../../../hooks/usePermissions";
import { Channel } from "../../../../types/channels";
import { checkPermissions } from "../../../compute-permissions";
import { Permissions } from "../../../permissions";
import { ChannelIcon } from "../../ChannelIcon";
import { StyledTreeItemRoot } from "./StyledTreeItemRoot";
import { memo } from "react";

type Props = TreeItemProps & {
    channel: Channel;
};

export const UnreadBadge = memo(() => {
    return (
        <Box
            sx={{
                position: "absolute",
                width: "4px",
                height: "8px",
                bgcolor: "common.white",
                top: "50%",
                left: "-14px",
                transform: "translateY(-50%)",
                borderRadius: "0 10px 10px 0",
            }}
        />
    );
});

export const TextChannel: React.FC<Props> = ({ channel, ...other }) => {
    const { permissions } = usePermssions(channel.guild_id || "", channel.id);

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
                            <UnreadBadge />
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
