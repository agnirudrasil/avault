import styled from "@emotion/styled";
import { useTheme } from "@mui/material";
import React from "react";

export const StyledCode = styled.code`
    padding: 0.2em;
    margin: 0.1em 0;

    border-radius: 3px;
    background: #ddd;

    font-size: 0.75em;
    line-height: 1.2rem;

    white-space: pre-wrap;
`;

export const Code: React.FC = ({ children }) => {
    const theme = useTheme();
    return (
        <StyledCode
            style={{
                background: theme.palette.grey[800],
            }}
        >
            {children}
        </StyledCode>
    );
};
