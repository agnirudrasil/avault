import { Typography } from "@mui/material";

export const BotIndication = () => (
    <Typography
        variant="caption"
        sx={{
            bgcolor: "primary.dark",
            p: 0.5,
            borderRadius: "3px",
        }}
        component="span"
    >
        BOT
    </Typography>
);
