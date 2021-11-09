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
import { useCreateChannel } from "../../hooks/useCreateChannel";

export const CategoryChannel: React.FC<{ name: string; id: string }> = ({
    name,
    id,
    children,
}) => {
    const [open, setOpen] = useState(true);
    const { createChannel } = useCreateChannel();
    const router = useRouter();
    return (
        <>
            <ListItem
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
                                guild_id: router.query.server_id as string,
                                parent_id: id,
                                type: "guild_text",
                            });
                        }}
                    >
                        <Add />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List dense component="div" sx={{ pl: 0.5 }}>
                    {children}
                </List>
            </Collapse>
        </>
    );
};
