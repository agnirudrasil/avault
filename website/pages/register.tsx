import { NextPage } from "next";
import { Field } from "formik";
import { Button, Link, Typography } from "@mui/material";
import { CustomTextField } from "../src/CustomTextField";
import { AuthLayout } from "../src/layouts/AuthLayout";
import { useRegister } from "../hooks/useRegister";

const RegisterPage: NextPage = () => {
    const { mutateAsync } = useRegister();

    return (
        <AuthLayout
            initialValues={{ email: "", password: "", username: "" }}
            onSubmit={async (
                values,
                { setSubmitting, setErrors, setStatus }
            ) => {
                setStatus("");
                const data = await mutateAsync(values);
                if (data.errors) {
                    const errorMap: any = {};
                    for (const [key, error] of Object.entries(data.errors)) {
                        errorMap[key as string] = (error as string[])[0];
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
                    <div style={{ marginBottom: status ? "1rem" : "2rem" }}>
                        <Typography variant="h5">Create an account</Typography>
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
                        type="text"
                        label="Username"
                        name="username"
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
                    <div style={{ width: "100%" }}>
                        <Button
                            variant="contained"
                            disableElevation
                            type="submit"
                            fullWidth
                            style={{ marginTop: "2rem" }}
                        >
                            Register
                        </Button>
                        <Link underline="hover" href="/login">
                            Already have an account?
                        </Link>
                    </div>
                </>
            )}
        </AuthLayout>
    );
};

export default RegisterPage;
