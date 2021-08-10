import styled from "@emotion/styled";
import { Paper, Tooltip } from "@material-ui/core";

export const FlexRow = styled.div`
    width: 100%;
    display: flex;
    background-color: ${props => props.theme.action.hover};
`;

export const Navbar = styled.nav`
    width: 88px;
    background-color: ${props => props.theme.background.paper};
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
`;

export const ChatSelectionContainer = styled.nav`
    width: 240px;
    background-color: #fdfafa;
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    position: relative;
`;

export const Container = styled.div`
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
`;

export const CustomTooltipStyled = styled(Tooltip)`
    background-color: white;
    color: black;
`;

export const CustomPaper = styled(Paper)`
    width: 100%;
    height: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    position: sticky;
    top: 0;
    left: 0;
    border-radius: 0;
`;
