import { PersonAdd, Settings, VolumeUp } from "@mui/icons-material";
import { treeItemClasses, TreeItemProps } from "@mui/lab";
import {
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import { usePermssions } from "../../../../hooks/usePermissions";
import { Channel } from "../../../../types/channels";
import { checkPermissions } from "../../../compute-permissions";
import { Permissions } from "../../../permissions";
import { StyledTreeItemRoot } from "./StyledTreeItemRoot";

type Props = TreeItemProps & {
    channel: Channel;
};

export const VoiceChannel: React.FC<Props> = ({ channel, ...other }) => {
    const { permissions } = usePermssions(channel.guild_id || "", channel.id);

    return (
        <StyledTreeItemRoot
            sx={{
                [`& .${treeItemClasses.iconContainer}`]: {
                    width: 0,
                },
            }}
            label={
                <ListItem
                    dense
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        pl: 0,
                    }}
                    disableGutters
                >
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
            }
            {...other}
        />
    );
};
