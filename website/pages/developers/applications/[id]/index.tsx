import { LoadingButton } from "@mui/lab";
import {
    Avatar,
    Box,
    Button,
    FormControl,
    FormLabel,
    Link,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import isEqual from "lodash.isequal";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useDeleteApplication } from "../../../../hooks/requests/useDeleteApplication";
import { useGetApplication } from "../../../../hooks/requests/useGetApplication";
import { usePatchApplication } from "../../../../hooks/requests/usePatchApplication";
import { CopyButton } from "../../../../src/components/Form/CopyButton";
import { ApplicationLayout } from "../../../../src/components/layouts/ApplicationLayout";

export const ApplicationIndexPage: NextPage<{ id: string }> = ({ id }) => {
    const router = useRouter();
    const { data } = useGetApplication(id);
    const { mutateAsync } = usePatchApplication();
    const { mutateAsync: deleteApplication } = useDeleteApplication();
    return (
        <ApplicationLayout id={id}>
            <Formik
                enableReinitialize
                initialValues={{
                    name: data?.name || "",
                    description: data?.description || "",
                    icon: data?.icon
                        ? `${process.env.NEXT_PUBLIC_CDN_URL}app-icons/${data?.id}/${data?.icon}`
                        : undefined,
                }}
                onSubmit={async (values, { setSubmitting }) => {
                    if (
                        values.icon ===
                        (data?.icon
                            ? `${process.env.NEXT_PUBLIC_CDN_URL}app-icons/${data?.id}/${data?.icon}`
                            : undefined)
                    ) {
                        delete values.icon;
                    }
                    await mutateAsync({
                        id,
                        ...values,
                        redirect_uris: data?.redirect_uris || [],
                    });
                    setSubmitting(false);
                }}
            >
                {({
                    values,
                    setFieldValue,
                    isSubmitting,
                    initialValues,
                    resetForm,
                }) => (
                    <Form>
                        <Snackbar
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "center",
                            }}
                            open={!isEqual(values, initialValues)}
                            message="Careful - you have unsaved changes!"
                            action={
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        color="inherit"
                                        onClick={() => resetForm()}
                                    >
                                        Reset
                                    </Button>
                                    <LoadingButton
                                        loading={isSubmitting}
                                        type="submit"
                                        color="success"
                                        variant="contained"
                                        disableElevation
                                    >
                                        Save Changes
                                    </LoadingButton>
                                </Stack>
                            }
                        />
                        <Box sx={{ width: "100%" }}>
                            <Typography variant="h6" sx={{ mb: 7 }}>
                                General Information
                            </Typography>
                            <Stack
                                spacing={2}
                                direction="row"
                                sx={{ width: "100%" }}
                            >
                                <Box>
                                    <Typography variant="button">
                                        APP ICON
                                    </Typography>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            width: "224px",
                                            height: "224px",
                                        }}
                                    >
                                        <Stack
                                            sx={{ height: "100%" }}
                                            alignItems="center"
                                            justifyContent="space-evenly"
                                        >
                                            <label htmlFor="app-icon">
                                                <input
                                                    value={""}
                                                    onChange={e => {
                                                        if (e.target.files) {
                                                            const reader =
                                                                new FileReader();
                                                            reader.onload =
                                                                () => {
                                                                    setFieldValue(
                                                                        "icon",
                                                                        reader.result
                                                                    );
                                                                };
                                                            reader.readAsDataURL(
                                                                e.target
                                                                    .files[0]
                                                            );
                                                        }
                                                    }}
                                                    type="file"
                                                    accept="image/*"
                                                    id="app-icon"
                                                    style={{
                                                        display: "none",
                                                    }}
                                                />
                                                <Avatar
                                                    component="span"
                                                    src={values.icon}
                                                    sx={{
                                                        width: "144px",
                                                        height: "144px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {data?.name
                                                        ?.split(" ")
                                                        .slice(0, 3)
                                                        .map(s =>
                                                            s[0].toUpperCase()
                                                        )
                                                        .join("")}
                                                </Avatar>
                                            </label>
                                            {data?.icon ? (
                                                <Link
                                                    onClick={() =>
                                                        setFieldValue(
                                                            "icon",
                                                            null
                                                        )
                                                    }
                                                    underline="hover"
                                                    sx={{
                                                        cursor: "pointer",
                                                        color: "primary.dark",
                                                    }}
                                                >
                                                    Remove Icon
                                                </Link>
                                            ) : (
                                                <Typography
                                                    variant="caption"
                                                    color="GrayText"
                                                >
                                                    Size:{" "}
                                                    <strong>1024x1024</strong>
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Box>
                                <Stack sx={{ flex: 1 }} spacing={3}>
                                    <Stack spacing={2} sx={{ width: "100%" }}>
                                        <FormControl
                                            sx={{ width: "100%" }}
                                            variant="outlined"
                                        >
                                            <FormLabel>
                                                <Typography variant="button">
                                                    APP NAME
                                                </Typography>
                                            </FormLabel>
                                            <TextField
                                                value={values.name}
                                                onChange={e =>
                                                    setFieldValue(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="App Name"
                                                fullWidth
                                            />
                                        </FormControl>
                                        <FormControl
                                            sx={{ width: "100%" }}
                                            variant="outlined"
                                        >
                                            <FormLabel>
                                                <Typography variant="button">
                                                    Description
                                                </Typography>
                                            </FormLabel>
                                            <TextField
                                                value={values.description}
                                                onChange={e =>
                                                    setFieldValue(
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Description"
                                                multiline
                                                minRows={5}
                                                fullWidth
                                            />
                                        </FormControl>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="button">
                                            APPLICATION ID
                                        </Typography>
                                        <Typography color="GrayText">
                                            {data?.id}
                                        </Typography>
                                        <Box>
                                            <CopyButton text={data?.id || ""} />
                                        </Box>
                                    </Stack>
                                    {!data?.bot && (
                                        <Button
                                            sx={{ width: "max-content" }}
                                            color="error"
                                            variant="outlined"
                                            onClick={async () => {
                                                await deleteApplication({
                                                    id,
                                                });
                                                router.push(
                                                    "/developers/applications"
                                                );
                                            }}
                                        >
                                            delete app
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        </Box>
                    </Form>
                )}
            </Formik>
        </ApplicationLayout>
    );
};

ApplicationIndexPage.getInitialProps = async ({ query }) => {
    return {
        id: query.id as string,
    };
};

export default ApplicationIndexPage;
