import styled from "@emotion/styled";

export const TearDrop = styled.button<{ selected?: boolean }>`
    width: 56px;
    height: 56px;
    background-color: black;
    border: none;
    margin-bottom: 10px;
    border-radius: ${({ selected }) =>
        selected ? "var(--teardrop)" : "500px"};
    transition: border-radius 200ms ease;
    cursor: pointer;
    outline: none;
    position: relative;
    ::before {
        position: absolute;
        content: "";
        top: 0;
        left: -16px;
        bottom: 0;
        width: 10px;
        border-radius: 0 100px 100px 0;
        background-color: black;
        transition: transform 200ms ease;
        transform: ${({ selected }) => (selected ? "scale(1)" : "scale(0)")};
        transform-origin: 0 50%;
    }
    :hover,
    :active {
        border-radius: var(--teardrop);
    }
    :hover::before {
        transform: ${({ selected }) => (selected ? "scale(1)" : "scaleY(0.5)")};
    }
    :active::before {
        transform: scale(1);
    }
    :active {
        transform: translateY(2px);
    }
`;
