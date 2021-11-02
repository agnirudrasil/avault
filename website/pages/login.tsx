import { NextPage } from "next";
import { Field } from "formik";
import { Button, Link, Typography } from "@mui/material";
import { CustomTextField } from "../src/CustomTextField";
import { AuthLayout } from "../src/AuthLayout";
import { useLogin } from "../hooks/useLogin";

const LoginPage: NextPage = () => {
    const { mutateAsync } = useLogin();
    return (
        <AuthLayout
            initialValues={{ email: "", password: "" }}
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
                } else if (data.error) {
                    setStatus(data.error);
                }
                setSubmitting(false);
            }}
        >
            {({ status }: any) => (
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
                        <Button
                            variant="contained"
                            disableElevation
                            type="submit"
                            fullWidth
                            style={{ marginTop: "2rem" }}
                        >
                            Login
                        </Button>
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