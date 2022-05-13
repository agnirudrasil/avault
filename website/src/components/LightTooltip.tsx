import { TooltipProps, Tooltip, tooltipClasses, styled } from "@mui/material";

export const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
        color: theme.palette.common.black,
    },
    [`& .${tooltipClasses.tooltip}`]: {
        fontSize: "0.95rem",
        backgroundColor: theme.palette.common.black,
    },
}));
