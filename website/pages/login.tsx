import { NextPage } from "next";
import { Field } from "formik";
import { Link, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { CustomTextField } from "../src/components/CustomTextField";
import { AuthLayout } from "../src/components/layouts/AuthLayout";
import { useLogin } from "../hooks/requests/useLogin";
import Router from "next/router";
import { setAccessToken } from "../src/access-token";

const LoginPage: NextPage = () => {
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
                if (data.errors) {
                    const errorMap: any = {};
                    for (const [key, error] of Object.entries(data.errors)) {
                        errorMap[key as string] = error;
                    }
                    setErrors(errorMap);
                    setSubmitting(false);
                    return;
                } else if (data.error) {
                    setStatus(data.error);
                    setSubmitting(false);
                    return;
                }
                setAccessToken(data.access_token);
                Router.replace("/channels/@me");
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
                            We're so excited to see you again!
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
                            Don't have an account?{" "}
                            <Link underline="hover" href="/register">
                                Register
                            </Link>
                        </Typography>
                    </div>
                </>
            )}
        </AuthLayout>
    );
};

export default LoginPage;
