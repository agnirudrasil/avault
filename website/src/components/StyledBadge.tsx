import { Badge, BadgeProps, styled, Theme } from "@mui/material";

export const StyledBadge = styled(Badge)<
    BadgeProps & { borderColor?: (theme: Theme) => string }
>(({ theme, borderColor }) => ({
    "& .MuiBadge-badge": {
        border: `3px solid ${
            borderColor ? borderColor(theme) : theme.palette.background.paper
        }`,
        padding: "4px",
    },
}));
