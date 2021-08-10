import { IconButton, Paper, Typography } from "@material-ui/core";
import {
    ChatSelectionContainer,
    CustomPaper,
} from "../../styles/util-components";
import styled from "@emotion/styled";
import { ArrowForwardIos } from "@material-ui/icons";
import React from "react";

export const ChatSelection: React.FC = () => {
    return (
        <ChatSelectionContainer>
            <CustomPaper style={{ backgroundColor: "transparent" }}>
                <Typography variant="button">Server Name</Typography>
                <IconButton>
                    <ArrowForwardIos
                        fontSize="small"
                        style={{ transform: "rotate(90deg)" }}
                    />
                </IconButton>
            </CustomPaper>
        </ChatSelectionContainer>
    );
};
