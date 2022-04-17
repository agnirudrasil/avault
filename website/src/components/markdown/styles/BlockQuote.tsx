import React, { ReactNode } from "react";
import styled from "@emotion/styled";

const BlockQuoteContainer = styled.div`
    display: flex;
`;

const BlockQuoteDivider = styled.div`
    min-width: 1px;
    max-width: 1px;
    border-radius: 1px;
    background: #ccc;
`;

const BlockQuoteContent = styled.blockquote`
    max-width: 90%;
    padding: 0 8px 0 12px;
    margin: 0;

    text-indent: 0;
`;

export type BlockQuoteProps = {
    children: ReactNode;
};

export function BlockQuote(props: BlockQuoteProps) {
    const { children } = props;

    return (
        <BlockQuoteContainer>
            <BlockQuoteDivider />
            <BlockQuoteContent>{children}</BlockQuoteContent>
        </BlockQuoteContainer>
    );
}
