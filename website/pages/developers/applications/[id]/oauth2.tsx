import { Clear } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Alert,
    Box,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Snackbar,
} from "@mui/material";
import { isEqual } from "lodash";
import { FieldArray, Form, Formik } from "formik";
import { NextPage } from "next";
import { useGetApplication } from "../../../../hooks/requests/useGetApplication";
import { usePatchApplication } from "../../../../hooks/requests/usePatchApplication";
import { useResetToken } from "../../../../hooks/requests/useResetToken";
import { CopyButton } from "../../../../src/components/Form/CopyButton";
import { ApplicationLayout } from "../../../../src/components/layouts/ApplicationLayout";

export const ApplicationOAuth2Page: NextPage<{ id: string }> = ({ id }) => {
    const { data, isFetching } = useGetApplication(id);
    const { data: token, mutateAsync, isLoading } = useResetToken();
    const { mutateAsync: patchApplication } = usePatchApplication();
    return (
        <ApplicationLayout id={id}>
            <Typography variant="h5">OAuth2</Typography>
            <Typography color="GrayText" variant="subtitle1">
                Use AVAULT as an authorization system or use our API on behalf
                of your users
            </Typography>
            <Stack sx={{ mt: 6, width: "100%" }} spacing={4}>
                {token && token.token && (
                    <Alert variant="outlined" severity="success">
                        A new token was generated! Be sure to copy it as it will
                        not be shown to you again.
                    </Alert>
                )}
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Client Information
                    </Typography>
                    <Stack direction="row" sx={{ width: "100%" }}>
                        <Stack sx={{ flex: 0.5 }} spacing={1}>
                            <Typography variant="button">Client id</Typography>
                            <Typography color="GrayText" variant="body2">
                                {data?.id}
                            </Typography>
                            <span>
                                <CopyButton text={data?.id || ""} />
                            </span>
                        </Stack>
                        <Stack sx={{ flex: 1 }} spacing={1}>
                            <Typography variant="button">
                                Client secret
                            </Typography>
                            <Typography color="GrayText" variant="body2">
                                {token?.token}
                            </Typography>
                            <span>
                                {token && token.token && (
                                    <CopyButton
                                        sx={{ mr: 1 }}
                                        text={token.token}
                                    />
                                )}
                                <LoadingButton
                                    loading={isLoading}
                                    onClick={async () => {
                                        await mutateAsync(id);
                                    }}
                                    variant="contained"
                                    disableElevation
                                >
                                    Reset secret
                                </LoadingButton>
                            </span>
                        </Stack>
                    </Stack>
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Redirects
                    </Typography>
                    <Typography sx={{ mb: 2 }} color="GrayText" variant="body2">
                        You must speecify at least one URI for authentication to
                        work. If you pass a URI in a n OAuth Request, it must
                        exactly match one of the URIs you enter here.
                    </Typography>
                    {!isFetching && (
                        <Formik
                            initialValues={{
                                redirect_uris: data?.redirect_uris || [],
                            }}
                            onSubmit={async (values, { setSubmitting }) => {
                                await patchApplication({
                                    id,
                                    description: data?.description || "",
                                    name: data?.name || "",
                                    redirect_uris: values.redirect_uris,
                                });
                                setSubmitting(false);
                            }}
                        >
                            {({
                                values,
                                setFieldValue,
                                initialValues,
                                resetForm,
                                isSubmitting,
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
                                    <FieldArray name="redirect_uris">
                                        {({ remove, push }) => (
                                            <Stack spacing={1}>
                                                {values.redirect_uris.map(
                                                    (_, index) => (
                                                        <div>
                                                            <TextField
                                                                value={
                                                                    values
                                                                        .redirect_uris[
                                                                        index
                                                                    ]
                                                                }
                                                                onChange={e =>
                                                                    setFieldValue(
                                                                        `redirect_uris[${index}]`,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                InputProps={{
                                                                    endAdornment:
                                                                        (
                                                                            <InputAdornment position="end">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() =>
                                                                                        remove(
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Clear />
                                                                                </IconButton>
                                                                            </InputAdornment>
                                                                        ),
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                )}
                                                <span>
                                                    <LoadingButton
                                                        onClick={() => push("")}
                                                        variant="contained"
                                                        disableElevation
                                                    >
                                                        Add another
                                                    </LoadingButton>
                                                </span>
                                            </Stack>
                                        )}
                                    </FieldArray>
                                </Form>
                            )}
                        </Formik>
                    )}
                </Box>
            </Stack>
        </ApplicationLayout>
    );
};

ApplicationOAuth2Page.getInitialProps = async ({ query }) => {
    return {
        id: query.id as string,
    };
};

export default ApplicationOAuth2Page;
