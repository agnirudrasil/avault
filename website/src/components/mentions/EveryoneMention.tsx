import { Typography } from "@mui/material";

export const EveryoneMention: React.FC = () => {
    return (
        <Typography
            sx={{
                bgcolor: "primary.dark",
                p: 0.3,
                borderRadius: "4px",
                transition: "background-color 0.3s ease",
            }}
            component="span"
        >
            @everyone
        </Typography>
    );
};
