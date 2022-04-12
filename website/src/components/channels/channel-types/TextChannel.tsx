import { PersonAdd, Settings } from "@mui/icons-material";
import { TreeItemProps } from "@mui/lab";
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
import Link from "next/link";
import { usePermssions } from "../../../../hooks/usePermissions";
import { Channel } from "../../../../types/channels";
import { checkPermissions } from "../../../compute-permissions";
import { Permissions } from "../../../permissions";
import { ChannelIcon } from "../../ChannelIcon";
import { StyledTreeItemRoot } from "./StyledTreeItemRoot";

type Props = TreeItemProps & {
    channel: Channel;
};

export const TextChannel: React.FC<Props> = ({ channel, ...other }) => {
    const { permissions } = usePermssions(channel.guild_id || "", channel.id);

    return (
        <StyledTreeItemRoot
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
                                p: 0.5,
                                pr: 0,
                            }}
                        >
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
                            <ListItemSecondaryAction>
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
