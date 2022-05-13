import { NextPage } from "next";
import { Field } from "formik";
import { Box, Link, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { CustomTextField } from "../src/components/CustomTextField";
import { AuthLayout } from "../src/components/layouts/AuthLayout";
import { useLogin } from "../hooks/requests/useLogin";
import Router from "next/router";
import { setAccessToken } from "../src/access-token";
import { useState } from "react";

const LoginPage: NextPage<{ next?: string }> = ({ next }) => {
    const { mutateAsync } = useLogin();
    const [page, setPage] = useState(0);
    return (
        <AuthLayout
            initialValues={{ email: "", password: "", code: "" }}
            onSubmit={async (
                values,
                { setSubmitting, setErrors, setStatus }
            ) => {
                setStatus("");
                const data = await mutateAsync({ ...(values as any) });
                if (data.detail) {
                    if (page === 0) {
                        setErrors({
                            email: "Incorrect email or password",
                            password: "Incorrect email or password",
                        });
                    } else {
                        setErrors({
                            code: "Invalid Code",
                        });
                    }
                } else if (data.mfa) {
                    setPage(1);
                } else if (data.access_token) {
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
            {({ status, isSubmitting }: any) =>
                page === 1 ? (
                    <Stack spacing={2}>
                        <Typography variant="h6">
                            2-Factor Authentication
                        </Typography>
                        <Box>
                            <Field
                                component={CustomTextField}
                                name="code"
                                label="MFA Code"
                                placeholder="6-digit authentication code/8-digit backup code"
                                required
                            />
                            <Link
                                underline="hover"
                                onClick={() => setPage(0)}
                                sx={{
                                    color: "primary.dark",
                                    cursor: "pointer",
                                }}
                            >
                                Back to login
                            </Link>
                        </Box>
                        <LoadingButton
                            variant="contained"
                            type="submit"
                            loading={isSubmitting}
                        >
                            Login
                        </LoadingButton>
                    </Stack>
                ) : (
                    page === 0 && (
                        <>
                            <div
                                style={{
                                    width: "100%",
                                    marginBottom: status ? "1rem" : "2rem",
                                }}
                            >
                                <Typography variant="h6">
                                    Welcome Back,
                                </Typography>
                                <Typography variant="body1">
                                    We&apos;re so excited to see you again!
                                </Typography>
                            </div>
                            {status && (
                                <>
                                    <Typography color="red">
                                        {status}
                                    </Typography>
                                    <br />
                                </>
                            )}
                            <Field
                                component={CustomTextField}
                                name="email"
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
                                                : "?next=" +
                                                  encodeURIComponent(next)
                                        }`}
                                    >
                                        Register
                                    </Link>
                                </Typography>
                            </div>
                        </>
                    )
                )
            }
        </AuthLayout>
    );
};

LoginPage.getInitialProps = async ({ query }) => ({
    next: query.next as string,
});

export default LoginPage;
