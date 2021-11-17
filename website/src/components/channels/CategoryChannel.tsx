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
import { Draggable, Droppable } from "react-beautiful-dnd";
import { useCreateChannel } from "../../../hooks/useCreateChannel";

export const CategoryChannel: React.FC<{
    name: string;
    id: string;
    index: number;
}> = ({ name, id, index, children }) => {
    const [open, setOpen] = useState(true);
    const { createChannel } = useCreateChannel();
    const router = useRouter();
    return (
        <Droppable droppableId={`category-${id}`}>
            {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                    <Draggable draggableId={id} index={index}>
                        {provided => (
                            <>
                                <ListItem
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{
                                        height: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        gap: "1rem",
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
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            onClick={() => {
                                                createChannel({
                                                    guild_id: router.query
                                                        .server_id as string,
                                                    parent_id: id,
                                                    type: "guild_text",
                                                });
                                            }}
                                        >
                                            <Add />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Collapse
                                    in={open}
                                    timeout="auto"
                                    unmountOnExit
                                >
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
                        )}
                    </Draggable>
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};
