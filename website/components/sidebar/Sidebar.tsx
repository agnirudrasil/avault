import { Navbar } from "../../styles/util-components";
import { Divider, IconButton } from "@material-ui/core";
import { Add, Explore } from "@material-ui/icons";
import styled from "@emotion/styled";
import { CustomTooltip } from "../Tooltip";
import { ServerIcon } from "../ServerIcon";

const BiggerIconButton = styled(IconButton)`
    width: 56px;
    height: 56px;
`;

export const Sidebar = () => {
    return (
        <Navbar>
            <img src="/logo.png" width="56px" height="56px" alt="Avault Logo" />
            <Divider
                style={{
                    margin: "10px 0 10px 0",
                    width: "56px",
                }}
            />
            {Array(5)
                .fill(0)
                .map(() => (
                    <ServerIcon title="Server Name" />
                ))}
            <CustomTooltip title="Add a server" placement="right">
                <BiggerIconButton>
                    <Add fontSize="large" />
                </BiggerIconButton>
            </CustomTooltip>
            <CustomTooltip title="Explore Public Servers" placement="right">
                <BiggerIconButton>
                    <Explore fontSize="large" />
                </BiggerIconButton>
            </CustomTooltip>
        </Navbar>
    );
};
