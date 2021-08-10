import { styled, Tooltip, tooltipClasses } from "@material-ui/core";

interface Props {
    title: string;
    children: React.ReactElement<any, any>;
    placement?:
        | "bottom-end"
        | "bottom-start"
        | "bottom"
        | "left-end"
        | "left-start"
        | "left"
        | "right-end"
        | "right-start"
        | "right"
        | "top-end"
        | "top-start"
        | "top";
}

const LightTooltip = styled(({ className, ...props }: any) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.common.white,
        color: "rgba(0, 0, 0, 0.87)",
        boxShadow: theme.shadows[1],
        fontSize: 16,
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: theme.palette.common.white,
    },
}));

export const CustomTooltip: React.FC<Props> = ({
    children,
    title,
    placement,
}) => (
    <LightTooltip title={title} arrow placement={placement}>
        {children}
    </LightTooltip>
);
