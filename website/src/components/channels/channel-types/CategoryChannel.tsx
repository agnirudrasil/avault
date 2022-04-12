import { Add } from "@mui/icons-material";
import { TreeItemProps } from "@mui/lab";
import {
    IconButton,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
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

export const CategoryChannel: React.FC<Props> = ({ channel, ...other }) => {
    const { permissions } = usePermssions(channel.guild_id || "", channel.id);

    return (
        <StyledTreeItemRoot
            label={
                <ListItem
                    dense
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 0.5,
                        pr: 0,
                    }}
                >
                    <ListItemText
                        primary={
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: "inherit", flexGrow: 1 }}
                            >
                                {channel.name}
                            </Typography>
                        }
                    />
                    {checkPermissions(
                        permissions,
                        Permissions.MANAGE_CHANNELS
                    ) && (
                        <ListItemSecondaryAction>
                            <IconButton
                                onClick={e => {
                                    e.stopPropagation();
                                    console.log("Hello World");
                                }}
                                size="small"
                            >
                                <Add />
                            </IconButton>
                        </ListItemSecondaryAction>
                    )}
                </ListItem>
            }
            {...other}
        />
    );
};
