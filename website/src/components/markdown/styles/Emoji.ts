import styled from "@emotion/styled";

export const Emoji = styled.img<{ big?: boolean }>`
    object-fit: contain;
    vertical-align: center;
    width: ${props => (props.big ? "32px" : "22px")};
    height: ${props => (props.big ? "32px" : "22px")};
`;
