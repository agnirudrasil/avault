import { Clear, ExpandMore } from "@mui/icons-material";
import {
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import ServerNavbar from "../ServerNavbar";

export const ChannelTop = () => {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const guild = useGuildsStore(
        state => state.guilds[router.query.guild as string]
    );

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(e.currentTarget);
        },
        [anchorEl]
    );

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, [anchorEl]);

    return guild ? (
        <ListItem
            sx={{
                borderBottom: "1px solid",
                borderColor: "background.paper",
            }}
        >
            <ServerNavbar anchorEl={anchorEl} handleClose={handleClose} />
            <ListItemText primary={<Typography>{guild.name}</Typography>} />
            <ListItemSecondaryAction>
                <IconButton onClick={handleClick}>
                    {anchorEl ? <Clear /> : <ExpandMore />}
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    ) : null;
};
