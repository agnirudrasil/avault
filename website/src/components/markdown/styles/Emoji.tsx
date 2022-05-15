import styled from "@emotion/styled";

export const Emoji = styled.img<{ big?: boolean; custom?: boolean }>`
    display: inline-block;
    vertical-align: middle;
    width: ${props => (props.big ? "32px" : props.custom ? "32px" : "22px")};
    height: ${props => (props.big ? "32px" : props.custom ? "auto" : "22px")};
`;
