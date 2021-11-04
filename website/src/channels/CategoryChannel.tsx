import { ArrowBackIos } from "@mui/icons-material";
import { Collapse, List, ListItemButton, ListItemText } from "@mui/material";
import { useState } from "react";

export const CategoryChannel: React.FC<{ name: string }> = ({
    name,
    children,
}) => {
    const [open, setOpen] = useState(true);
    return (
        <>
            <ListItemButton
                sx={{
                    height: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "1rem",
                    color: "#ccc",
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
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List dense component="div" sx={{ pl: 4 }}>
                    {children}
                </List>
            </Collapse>
        </>
    );
};
