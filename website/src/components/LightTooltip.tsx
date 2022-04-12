import { TooltipProps, Tooltip, tooltipClasses, styled } from "@mui/material";

export const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.common.white,
        color: "rgba(0, 0, 0, 0.87)",
        boxShadow: theme.shadows[1],
        fontSize: "16px",
    },
}));
