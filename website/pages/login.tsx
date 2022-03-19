import { NextPage } from "next";
import { Field } from "formik";
import { Link, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { CustomTextField } from "../src/components/CustomTextField";
import { AuthLayout } from "../src/components/layouts/AuthLayout";
import { useLogin } from "../hooks/requests/useLogin";
import Router from "next/router";
import { setAccessToken } from "../src/access-token";

const LoginPage: NextPage<{ next?: string }> = ({ next }) => {
    const { mutateAsync } = useLogin();
    return (
        <AuthLayout
            initialValues={{ username: "", password: "" }}
            onSubmit={async (
                values,
                { setSubmitting, setErrors, setStatus }
            ) => {
                setStatus("");
                const data = await mutateAsync(values);
                if (data.detail) {
                    setErrors({
                        username: "Incorrect email or password",
                        password: "Incorrect email or password",
                    });
                } else {
                    setAccessToken(data.access_token);
                    if (next) {
                        Router.replace(next);
                    } else {
                        Router.replace("/channels/@me");
                    }
                }
                setSubmitting(false);
            }}
        >
            {({ status, isSubmitting }: any) => (
                <>
                    <div
                        style={{
                            width: "100%",
                            marginBottom: status ? "1rem" : "2rem",
                        }}
                    >
                        <Typography variant="h6">Welcome Back,</Typography>
                        <Typography variant="body1">
                            We&apos;re so excited to see you again!
                        </Typography>
                    </div>
                    {status && (
                        <>
                            <Typography color="red">{status}</Typography>
                            <br />
                        </>
                    )}
                    <Field
                        component={CustomTextField}
                        name="username"
                        type="email"
                        label="Email"
                        required
                    />
                    <br />
                    <Field
                        component={CustomTextField}
                        type="password"
                        label="Password"
                        name="password"
                        required
                    />
                    <div style={{ width: "100%", marginTop: "0.5rem" }}>
                        <Link underline="hover" href="/forgot-password">
                            Forgot your password?
                        </Link>
                    </div>
                    <div style={{ width: "100%" }}>
                        <LoadingButton
                            variant="contained"
                            disableElevation
                            type="submit"
                            fullWidth
                            loading={isSubmitting}
                            style={{ marginTop: "2rem" }}
                        >
                            Login
                        </LoadingButton>
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            style={{ marginTop: "1rem" }}
                        >
                            Don&apos;t have an account?{" "}
                            <Link
                                underline="hover"
                                href={`/register${
                                    !next
                                        ? ""
                                        : "?next=" + encodeURIComponent(next)
                                }`}
                            >
                                Register
                            </Link>
                        </Typography>
                    </div>
                </>
            )}
        </AuthLayout>
    );
};

LoginPage.getInitialProps = async ({ query }) => ({
    next: query.next as string,
});

export default LoginPage;
