import { Form, Formik } from "formik";
import { ChannelSettingsLayout } from "../../layouts/routes/ChannelSettings";
import { LoadingButton } from "@mui/lab";
import {
    Typography,
    Snackbar,
    Stack,
    Button,
    FormControl,
    TextField,
    FormLabel,
} from "@mui/material";
import isEqual from "lodash.isequal";
import { useChannelsStore } from "../../../../stores/useChannelsStore";
import { useRouter } from "next/router";
import { useChannelUpdate } from "../../../../hooks/requests/useUpdateChannel";
import { useRoutesStore } from "../../../../stores/useRoutesStore";

export const ChannelSettings: React.FC = () => {
    const router = useRouter();
    const channel = useChannelsStore(
        state =>
            state.channels[router.query.guild as string]?.[
                router.query.channel as string
            ]
    );
    const state = useRoutesStore(state => state.setRoute);
    const { mutateAsync } = useChannelUpdate();
    if (!channel) {
        state("/");
        return null;
    }

    return (
        <ChannelSettingsLayout>
            <Typography variant="h6">Overview</Typography>
            <Formik
                enableReinitialize
                initialValues={{
                    name: channel.name,
                }}
                onSubmit={async values => {
                    await mutateAsync({
                        data: values,
                        channelId: channel.id,
                    });
                }}
            >
                {({
                    values,
                    initialValues,
                    isSubmitting,
                    setFieldValue,
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
                        <Stack sx={{ mt: 3 }} direction="row" spacing={2}>
                            <FormControl fullWidth>
                                <FormLabel>Channel Name</FormLabel>
                                <TextField
                                    value={values.name}
                                    onChange={e =>
                                        setFieldValue(
                                            "name",
                                            e.target.value
                                                .toLowerCase()
                                                .replaceAll(" ", "-")
                                        )
                                    }
                                />
                            </FormControl>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </ChannelSettingsLayout>
    );
};
