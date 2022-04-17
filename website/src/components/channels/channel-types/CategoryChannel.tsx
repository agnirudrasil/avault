import { Add, CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { TreeItemProps } from "@mui/lab";
import {
    IconButton,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
    useTheme,
} from "@mui/material";
import produce from "immer";
import { Dispatch, SetStateAction } from "react";
import { useDeleteChannel } from "../../../../hooks/requests/useDeleteChannel";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { useCreateChannel } from "../../../../hooks/useCreateChannel";
import { usePermssions } from "../../../../hooks/usePermissions";
import { Channel } from "../../../../types/channels";
import { checkPermissions } from "../../../compute-permissions";
import { copyToClipboard } from "../../../copy";
import { Permissions } from "../../../permissions";
import { ContextMenu } from "../../context-menus/ContextMenu";
import { ContextMenuShape } from "../../context-menus/types";
import { StyledTreeItemRoot } from "./StyledTreeItemRoot";

type Props = TreeItemProps & {
    channel: Channel;
    expanded: string[];
    categories: string[];
    setExpanded: Dispatch<SetStateAction<string[]>>;
};

export const CategoryChannel: React.FC<Props> = ({
    channel,
    expanded,
    setExpanded,
    categories,
    ...other
}) => {
    const theme = useTheme();
    const { permissions } = usePermssions(channel.guild_id || "", channel.id);

    const { createChannel } = useCreateChannel();

    const { mutate } = useDeleteChannel(channel.id);

    const { handleContextMenu, ...props } = useContextMenu();
    const menuObject: ContextMenuShape[][] = [
        [
            {
                label: "Mark As Read",
                visible: true,
                disabled: true,
                action: handleClose => {
                    handleClose();
                },
            },
        ],
        [
            {
                label: "Collapse Category",
                visible: true,
                action: () => {
                    if (expanded.includes(channel.id)) {
                        setExpanded(x => x.filter(id => id !== channel.id));
                    } else {
                        setExpanded(
                            produce(draft => {
                                draft.push(channel.id);
                            })
                        );
                    }
                },
                icon: expanded.includes(channel.id) ? (
                    <CheckBoxOutlineBlank />
                ) : (
                    <CheckBox />
                ),
            },
            {
                label: "Collapse All Categories",
                visible: expanded.length > 0,
                action: handleClose => {
                    setExpanded([]);
                    handleClose();
                },
            },
            {
                label: "Edit Category",
                visible: checkPermissions(
                    permissions,
                    Permissions.MANAGE_CHANNELS
                ),
                action: handleClose => {
                    mutate();
                    handleClose();
                },
            },
        ],
        [
            {
                label: "Delete Category",
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
                    <ContextMenu menuObject={menuObject} {...props} />
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
                                    createChannel({
                                        guild_id: channel.guild_id,
                                        type: "GUILD_TEXT",
                                        parent_id: channel.id,
                                    });
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
