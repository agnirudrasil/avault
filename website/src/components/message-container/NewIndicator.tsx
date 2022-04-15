import { Box, Typography } from "@mui/material";
import { memo } from "react";

export const NewIndicator = memo(() => {
    return (
        <Box
            sx={{
                width: "100%",
                height: "1px",
                bgcolor: "error.dark",
                color: "error.dark",
            }}
        >
            <Box
                sx={{
                    bgcolor: "error.dark",
                    width: "min-content",
                    p: 0.3,
                    ml: "auto",
                    transform: "translateY(-50%)",
                }}
            >
                <Typography color="white">New</Typography>
            </Box>
        </Box>
    );
});
