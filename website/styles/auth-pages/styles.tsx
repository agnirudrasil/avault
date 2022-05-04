import styled from "@emotion/styled";
import { Form } from "formik";

export const AuthContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100%;
`;

export const StyledForm = styled(Form)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 400px;
    border-radius: 7px;
    height: max-content;
    box-shadow: 10px 10px 10px solid rgba(0, 0, 0, 0.5);
    padding: 3rem;
`;
