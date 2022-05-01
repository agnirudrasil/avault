import { LoadingButton } from "@mui/lab";
import {
    Avatar,
    Box,
    Button,
    FormControl,
    FormLabel,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useDeleteApplication } from "../../../../hooks/requests/useDeleteApplication";
import { useGetApplication } from "../../../../hooks/requests/useGetApplication";
import { usePatchApplication } from "../../../../hooks/requests/usePatchApplication";
import { CopyButton } from "../../../../src/components/Form/CopyButton";
import { ApplicationLayout } from "../../../../src/components/layouts/ApplicationLayout";

export const ApplicationIndexPage: NextPage<{ id: string }> = ({ id }) => {
    const router = useRouter();
    const { data, isLoading } = useGetApplication(id);
    const { mutateAsync } = usePatchApplication();
    const { mutateAsync: deleteApplication } = useDeleteApplication();
    return (
        <ApplicationLayout id={id}>
            {isLoading ? (
                <div>
                    <LinearProgress />
                </div>
            ) : (
                <Box sx={{ width: "100%" }}>
                    <Typography variant="h6" sx={{ mb: 7 }}>
                        General Information
                    </Typography>
                    <Stack spacing={2} direction="row" sx={{ width: "100%" }}>
                        <Box>
                            <Typography variant="button">APP ICON</Typography>
                            <Paper
                                variant="outlined"
                                sx={{ width: "224px", height: "224px" }}
                            >
                                <Stack
                                    sx={{ height: "100%" }}
                                    alignItems="center"
                                    justifyContent="space-evenly"
                                >
                                    <Avatar
                                        sx={{ width: "144px", height: "144px" }}
                                    >
                                        {data?.name
                                            ?.split(" ")
                                            .map(s => s[0].toUpperCase())
                                            .join("")}
                                    </Avatar>
                                    <Typography
                                        variant="caption"
                                        color="GrayText"
                                    >
                                        Size: <strong>1024x1024</strong>
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Box>
                        <Stack sx={{ flex: 1 }} spacing={3}>
                            <Formik
                                initialValues={{
                                    name: data?.name || "",
                                    description: data?.description || "",
                                }}
                                onSubmit={async (values, { setSubmitting }) => {
                                    await mutateAsync({
                                        id,
                                        ...values,
                                        redirect_uris:
                                            data?.redirect_uris || [],
                                    });
                                    setSubmitting(false);
                                }}
                            >
                                {({ values, setFieldValue, isSubmitting }) => (
                                    <Form>
                                        <Stack
                                            spacing={2}
                                            sx={{ width: "100%" }}
                                        >
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
                                            <LoadingButton
                                                loading={isSubmitting}
                                                type="submit"
                                                variant="contained"
                                            >
                                                save changes
                                            </LoadingButton>
                                        </Stack>
                                    </Form>
                                )}
                            </Formik>
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
                            <Button
                                sx={{ width: "max-content" }}
                                color="error"
                                variant="outlined"
                                onClick={async () => {
                                    await deleteApplication({ id });
                                    router.push("/developers/applications");
                                }}
                            >
                                delete app
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            )}
        </ApplicationLayout>
    );
};

ApplicationIndexPage.getInitialProps = async ({ query }) => {
    return {
        id: query.id as string,
    };
};

export default ApplicationIndexPage;
