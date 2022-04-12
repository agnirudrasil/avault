import { Add, ArrowBackIos } from "@mui/icons-material";
import {
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useCreateChannel } from "../../../hooks/useCreateChannel";
import { usePermssions } from "../../../hooks/usePermissions";
import { checkPermissions } from "../../compute-permissions";
import { Permissions } from "../../permissions";

export const CategoryChannel: React.FC<{
    name: string;
    id: string;
    index: number;
}> = ({ name, id, children }) => {
    const [open, setOpen] = useState(true);
    const { createChannel } = useCreateChannel();
    const router = useRouter();
    const { permissions } = usePermssions(router.query.server_id as string, id);
    return checkPermissions(permissions, Permissions.VIEW_CHANNEL) ? (
        <>
            <ListItem
                sx={{
                    height: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    color: "#ccc",
                    cursor: "pointer",
                    maxWidth: "100%",
                    textOverflow: "ellipsis",
                    ":hover": {
                        background: "transparent",
                        color: "black",
                    },
                }}
                onClick={() => setOpen(!open)}
            >
                <ArrowBackIos
                    sx={{
                        transform: `rotate(${
                            !open ? "180deg" : "-90deg"
                        }) translateX(4px)`,
                        fontSize: "12px",
                    }}
                />
                <ListItemText
                    sx={{
                        ":hover": {
                            background: "transparent",
                            color: "black",
                        },
                    }}
                    secondary={name}
                />
                {checkPermissions(permissions, Permissions.MANAGE_CHANNELS) && (
                    <ListItemSecondaryAction>
                        <IconButton
                            onClick={() => {
                                createChannel({
                                    guild_id: router.query.server_id as string,
                                    parent_id: id,
                                    type: "GUILD_TEXT",
                                });
                            }}
                        >
                            <Add />
                        </IconButton>
                    </ListItemSecondaryAction>
                )}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Droppable droppableId={`droppable-${id}`}>
                    {provided => (
                        <List
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            dense
                            component="div"
                            sx={{ pl: 0.5 }}
                        >
                            {children}
                            {provided.placeholder}
                        </List>
                    )}
                </Droppable>
            </Collapse>
        </>
    ) : null;
};
