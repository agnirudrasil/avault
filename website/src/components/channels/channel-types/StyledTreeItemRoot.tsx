import { TreeItem, treeItemClasses } from "@mui/lab";
import { styled } from "@mui/material";

export const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
    color: theme.palette.text.secondary,
    [`& .${treeItemClasses.content}`]: {
        color: theme.palette.text.secondary,
        borderRadius: "5px",
        fontWeight: theme.typography.fontWeightMedium,
        padding: theme.spacing(0.2),
        maxWidth: "100%",
        [`& .${treeItemClasses.iconContainer}`]: {
            padding: 0,
            margin: 0,
        },
        "&.Mui-expanded": {
            fontWeight: theme.typography.fontWeightRegular,
        },
        "&:hover": {
            backgroundColor: theme.palette.action.hover,
            "& .channel-settings": {
                visibility: "visible",
            },
        },
        "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
            color: "var(--tree-view-color)",
            "& .channel-settings": {
                visibility: "visible",
            },
        },
        [`& .${treeItemClasses.label}`]: {
            fontWeight: "inherit",
            color: "inherit",
        },
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: theme.spacing(2),
    },
}));
