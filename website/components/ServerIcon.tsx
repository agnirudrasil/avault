import { TearDrop } from "../styles/teardrop-buttons";
import { CustomTooltip } from "./Tooltip";

export const ServerIcon: React.FC<{ title: string }> = ({
    children,
    title,
}) => {
    return (
        <CustomTooltip title={title} placement="right">
            <TearDrop>{children}</TearDrop>
        </CustomTooltip>
    );
};
