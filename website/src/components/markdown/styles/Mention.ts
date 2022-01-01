import styled from "@emotion/styled";

export const Mention = styled.span`
    border-radius: 3px;
    padding: 2px;

    cursor: pointer;

    background: #ccc;
    background: #7e7eff;
    color: white;

    font-weight: 500;
    transition: 50ms ease-out;
    transition-property: background-color, color;

    &:hover {
        background: #6d6dff;
        text-decoration: underline;
    }
`;
