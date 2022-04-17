import { MenuItem, MenuItemProps, styled } from "@mui/material";

export const StyledMenuItem = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
    minWidth: "180px",
    maxWidth: "180px",
    overflow: "hidden",
    borderRadius: "3px",
    "&:hover": {
        backgroundColor: theme.palette.primary.dark,
    },
}));
