import styled from "@emotion/styled";
import { Close } from "@mui/icons-material";
import { Avatar, IconButton, Typography } from "@mui/material";

const DMChannelItemBase = styled.div<{ selected?: boolean }>`
    display: flex;
    width: 100%;
    min-width: 224px;
    gap: 1rem;
    padding: 0.25rem;
    background-color: ${({ selected }) => (selected ? "#ccc" : "transparent")};
    border: none;
    cursor: pointer;
    justify-content: flex-start;
    align-items: center;
    margin: 0.15rem 0;
    border-radius: 5px;
    &:hover {
        background-color: #ccc;
    }
    &:hover button {
        visibility: visible;
    }
`;

export const DMChannelItem: React.FC<{ selected?: boolean; text: string }> = ({
    selected,
    text,
}) => {
    return (
        <DMChannelItemBase selected={selected}>
            <div>
                <Avatar
                    sx={{ width: 32, height: 32 }}
                    src="https://storage.googleapis.com/cdn.sipabacuskvh.com/avatars/resized_4eb08d23-488b-47f0-96cf-05c77a322363.png"
                />
            </div>
            <Typography>{text}</Typography>
            <IconButton
                sx={{
                    marginLeft: "auto",
                    visibility: "hidden",
                }}
                size="small"
            >
                <Close />
            </IconButton>
        </DMChannelItemBase>
    );
};
