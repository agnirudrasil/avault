import { LoadingButton } from "@mui/lab";
import {
    Snackbar,
    Alert,
    Button,
    Slide,
    TextField,
    Typography,
    FormControl,
    FormLabel,
    InputAdornment,
} from "@mui/material";
import produce from "immer";
import { useRouter } from "next/router";
import { useChannelUpdate } from "../../hooks/requests/useUpdateChannel";
import { useUnsaved } from "../../hooks/useUnsaved";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { ChannelSettingsLayout } from "../components/layouts/ChannelSettingsLayout";

const TransitionComponent = (props: any) => {
    return <Slide {...props} direction="up" unmountOnExit />;
};

export const ChannelSettings = () => {
    const router = useRouter();
    const channels = useChannelsStore(
        state => state[router.query.server_id as string]
    );
    const channel = channels?.find(
        c => c.id === (router.query.channel as string)
    );
    const { handleReset, unsaved, ogData, setOgdata } = useUnsaved(channel);
    const { mutate, isLoading } = useChannelUpdate();

    const saveFn = () => {
        if (!ogData?.name) return;

        mutate({
            channelId: ogData.id,
            data: {
                name: ogData.name,
                topic: ogData.topic || "",
            },
        });
    };

    return (
        <ChannelSettingsLayout>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={unsaved}
                TransitionComponent={TransitionComponent}
            >
                <Alert
                    severity="warning"
                    action={
                        <div>
                            <Button
                                size="small"
                                variant="text"
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                            <LoadingButton
                                loading={isLoading}
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    saveFn();
                                }}
                            >
                                Save
                            </LoadingButton>
                        </div>
                    }
                >
                    You have unsaved changes!
                </Alert>
            </Snackbar>
            <div
                style={{
                    minWidth: "740px",
                    width: "100%",
                    padding: "60px 10px 0 20px",
                    height: "100%",
                    maxHeight: "100vh",
                }}
            >
                <div>
                    <Typography
                        variant="h6"
                        style={{ userSelect: "none", marginBottom: "30px" }}
                    >
                        OVERVIEW
                    </Typography>
                </div>
                <FormControl sx={{ width: "100%", marginBottom: "20px" }}>
                    <FormLabel sx={{ userSelect: "none" }}>
                        <Typography variant="button">Channel Name</Typography>
                    </FormLabel>
                    <TextField
                        required
                        value={ogData?.name}
                        fullWidth
                        sx={{
                            width: "100%",
                        }}
                        onChange={e => {
                            setOgdata(o =>
                                produce(o, draft => {
                                    if (draft)
                                        draft.name = e.target.value
                                            .toLowerCase()
                                            .replaceAll(" ", "-");
                                })
                            );
                        }}
                    />
                </FormControl>
                <FormControl sx={{ width: "100%" }}>
                    <FormLabel sx={{ userSelect: "none" }}>
                        <Typography variant="button">Channel Topic</Typography>
                    </FormLabel>
                    <TextField
                        value={ogData?.topic || ""}
                        fullWidth
                        multiline
                        placeholder="Let everyone know how to use this channel!"
                        minRows={3}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Typography variant="caption">
                                        {1024 - (ogData?.topic?.length || 0)}
                                    </Typography>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: "100%",
                        }}
                        onChange={e => {
                            setOgdata(o =>
                                produce(o, draft => {
                                    if (draft)
                                        draft.topic = e.target.value.substring(
                                            0,
                                            1024
                                        );
                                })
                            );
                        }}
                    />
                </FormControl>
            </div>
        </ChannelSettingsLayout>
    );
};
