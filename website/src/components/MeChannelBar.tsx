import { ListItem } from "@mantine/core";
import { AccessibilityNew } from "@mui/icons-material";
import {
    List,
    Box,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
} from "@mui/material";
import { useRouter } from "next/router";
import { ChannelBottom } from "./channels";

export const MeChannelBar = () => {
    const router = useRouter();
    return (
        <List
            sx={{
                height: "100%",
                bgcolor: "grey.900",
                minWidth: "240px",
                width: "max-content",
                display: "flex",
                flexDirection: "column",
            }}
            disablePadding
        >
            <ListItem>
                <ListItemButton
                    selected={router.asPath === "/channels/@me"}
                    sx={{ m: 1, borderRadius: "4px" }}
                >
                    <ListItemIcon>
                        <AccessibilityNew />
                    </ListItemIcon>
                    <ListItemText primary="Friends" />
                </ListItemButton>
            </ListItem>
            <ListSubheader sx={{ bgcolor: "transparent" }}>
                DIRECT MESSAGES
            </ListSubheader>
            <Box sx={{ mb: "auto" }} />
            <ChannelBottom />
        </List>
    );
};
