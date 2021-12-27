import styled from "@emotion/styled";
import { Tooltip } from "@mui/material";
import { useChannelsStore } from "../../stores/useChannelsStore";
import Link from "next/link";

const ServerButton = styled.button<{ hoverColor?: string }>`
    background-color: #f1f1f1;
    border: none;
    border-radius: 50px;
    color: #333;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    padding: 10px;
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 1px 0 rgba(6, 6, 7, 0.1), 0 1.5px 0 rgba(6, 6, 7, 0.025),
        0 2px 0 rgba(6, 6, 7, 0.025);
    transition: all 200ms ease;
    &:hover {
        background-color: ${({ hoverColor }) => hoverColor ?? "#5865f2"};
        color: #fff;
        border-radius: 10px;
    }
`;

export const ServerItems: React.FC<{
    hoverColor?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => any;
    title?: string;
    id: string;
}> = ({ children, hoverColor, id, onClick, title = "" }) => {
    const getFirstChannel = useChannelsStore(
        state => state.getFirstGuildChannel
    );
    return (
        <Tooltip title={title}>
            <Link href={`/channels/${id}/${getFirstChannel(id)?.id ?? ""}`}>
                <ServerButton onClick={onClick} hoverColor={hoverColor}>
                    {children}
                </ServerButton>
            </Link>
        </Tooltip>
    );
};
