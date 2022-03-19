import { NextPage } from "next";
import { Field } from "formik";
import { Link, Typography } from "@mui/material";
import { CustomTextField } from "../src/components/CustomTextField";
import { AuthLayout } from "../src/components/layouts/AuthLayout";
import { useRegister } from "../hooks/requests/useRegister";
import * as yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useRouter } from "next/router";

const ValidationSchema = yup.object().shape({
    username: yup
        .string()
        .required("Username is required")
        .min(3, "Username must be at least 3 characters")
        .max(80, "Username must be less than 20 characters"),
    email: yup
        .string()
        .email("Invalid email address")
        .required("Email is required"),
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(25, "Password must be less than 25 characters")
        .matches(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,25}$/,
            "Password must contain at least one small letter, one number and one special character"
        ),
});

const RegisterPage: NextPage<{ next?: string }> = ({ next }) => {
    const { mutateAsync } = useRegister();
    const router = useRouter();

    return (
        <AuthLayout
            initialValues={{ email: "", password: "", username: "" }}
            validationSchema={ValidationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                const data = await mutateAsync(values);
                if (data.error) {
                    setErrors({
                        email: "User with that email already exists. Please login.",
                    });
                } else {
                    router.push(
                        `/login${
                            next ? "?next=" + encodeURIComponent(next) : ""
                        }`
                    );
                }
                setSubmitting(false);
            }}
        >
            {({ isSubmitting }) => (
                <>
                    <div style={{ marginBottom: "2rem" }}>
                        <Typography variant="h5">Create an account</Typography>
                    </div>
                    <Field
                        component={CustomTextField}
                        name="email"
                        type="email"
                        label="Email"
                    />
                    <br />
                    <Field
                        component={CustomTextField}
                        type="text"
                        label="Username"
                        name="username"
                    />
                    <br />
                    <Field
                        component={CustomTextField}
                        type="password"
                        label="Password"
                        name="password"
                    />
                    <div style={{ width: "100%" }}>
                        <LoadingButton
                            loading={isSubmitting}
                            variant="contained"
                            disableElevation
                            type="submit"
                            fullWidth
                            style={{ marginTop: "2rem" }}
                        >
                            Register
                        </LoadingButton>
                        <Link
                            underline="hover"
                            href={`/login${
                                next ? "?next=" + encodeURIComponent(next) : ""
                            }`}
                        >
                            Already have an account?
                        </Link>
                    </div>
                </>
            )}
        </AuthLayout>
    );
};

RegisterPage.getInitialProps = ({ query }) => ({ next: query.next as string });

export default RegisterPage;
