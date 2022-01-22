import { Formik, FormikConfig, FormikProps, FormikValues } from "formik";
import { AuthContainer, StyledForm } from "../../../styles/auth-pages/styles";
import Head from "next/head";
import { useRouter } from "next/router";

export interface AuthLayoutProps extends FormikConfig<FormikValues> {
    children: (props: FormikProps<FormikValues>) => React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    ...props
}) => {
    const router = useRouter();
    return (
        <AuthContainer>
            <Head>
                <title>
                    {router.pathname === "/login" ? "Login" : "Register"}
                </title>
            </Head>
            <Formik {...props}>
                {props => (
                    <StyledForm>
                        <div>
                            <img
                                style={{ width: "200px", marginBottom: "2rem" }}
                                src="/logo.png"
                                alt="logo"
                            />
                        </div>
                        {(children as any)(props)}
                    </StyledForm>
                )}
            </Formik>
        </AuthContainer>
    );
};
