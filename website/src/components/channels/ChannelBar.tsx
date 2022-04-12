import { Box, List } from "@mui/material";
import { ChannelBottom } from "./ChannelBottom";
import { ChannelTop } from "./ChannelTop";
import { ChannelTree } from "./ChannelTree";

export const ChannelBar = () => {
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
            <ChannelTop />
            <ChannelTree />
            <Box sx={{ mb: "auto" }} />
            <ChannelBottom />
        </List>
    );
};
