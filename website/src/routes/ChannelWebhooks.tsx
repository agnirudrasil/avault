import { WatchLater } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Snackbar,
    Alert,
    Button,
    Slide,
    Typography,
    Stack,
    Divider,
    List,
    CardHeader,
    Card,
    Avatar,
    ListItem,
    CardContent,
    TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useCreateWebhook } from "../../hooks/requests/useCreateWebhook";
import { useDeleteWebhook } from "../../hooks/requests/useDeleteWebhook";
import { useGetWebhook, Webhook } from "../../hooks/requests/useGetWebhook";
import { usePatchWebhook } from "../../hooks/requests/usePatchWebhook";
import { useUnsaved } from "../../hooks/useUnsaved";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { DefaultProfilePic } from "../components/DefaultProfilePic";
import { ChannelSettingsLayout } from "../components/layouts/ChannelSettingsLayout";
import { copyToClipboard } from "../copy";
import { SkeletonLoader } from "../SkeletonLoader";
import { snowflakeTimestamp } from "../snowflake-timestamp";

const TransitionComponent = (props: any) => {
    return <Slide {...props} direction="up" unmountOnExit />;
};

export const ChannelWebhooks = () => {
    const router = useRouter();
    const channels = useChannelsStore(
        state => state[router.query.server_id as string]
    );
    const channel = channels?.find(
        c => c.id === (router.query.channel as string)
    );
    const { data, isLoading } = useGetWebhook(router.query.channel as string);

    const { mutateAsync } = useCreateWebhook();

    return (
        <ChannelSettingsLayout>
            <div
                style={{
                    minWidth: "740px",
                    width: "100%",
                    padding: "60px 10px 0 20px",
                    height: "100vh",
                    maxHeight: "100vh",
                    overflow: "hidden",
                }}
            >
                <Stack>
                    <Typography
                        variant="h6"
                        style={{ userSelect: "none", marginBottom: "30px" }}
                    >
                        Webhooks
                    </Typography>
                    <Typography
                        variant="caption"
                        color="GrayText"
                        style={{ userSelect: "none", marginBottom: "30px" }}
                    >
                        Webhooks are a simple way to post messages from other
                        apps and websites into AVAULT using internet magic.
                    </Typography>
                </Stack>
                <Divider />
                <Stack
                    sx={{
                        mt: "2rem",
                        gap: "1rem",
                        maxHeight: "90%",
                        overflow: "hidden",
                        mb: "2rem",
                    }}
                >
                    <div>
                        <Button
                            onClick={async () => {
                                await mutateAsync({
                                    id: router.query.channel as string,
                                });
                            }}
                            variant="contained"
                            disableElevation
                        >
                            New Webhook
                        </Button>
                    </div>
                    <Typography variant="button" color="GrayText">
                        posting to{" "}
                        <strong style={{ color: "black" }}>
                            #{channel?.name}
                        </strong>
                    </Typography>
                    {isLoading ? (
                        <SkeletonLoader />
                    ) : (
                        <List sx={{ overflow: "auto" }}>
                            {data?.map(webhook => (
                                <ListItem key={webhook.id}>
                                    <WebhookItem webhook={webhook} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Stack>
            </div>
        </ChannelSettingsLayout>
    );
};

export const WebhookItem: React.FC<{ webhook: Webhook }> = ({ webhook }) => {
    const isLoading = false;
    const { handleReset, unsaved, ogData, setOgdata } = useUnsaved(webhook);
    const saveFn = async () => {
        if (!ogData?.name) return;
        await patch({ id: webhook.id, name: ogData.name || "" });
    };
    const { mutateAsync } = useDeleteWebhook();
    const { mutateAsync: patch } = usePatchWebhook();

    return (
        <>
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
                                onClick={async () => {
                                    await saveFn();
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
            <Card variant="outlined" sx={{ width: "100%" }}>
                <CardHeader
                    avatar={
                        <Avatar>
                            <DefaultProfilePic tag="#0000" />
                        </Avatar>
                    }
                    title={<Typography variant="h6">{webhook.name}</Typography>}
                    subheader={
                        <Typography
                            color="GrayText"
                            variant="subtitle1"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <WatchLater color="disabled" /> Created on{" "}
                            {snowflakeTimestamp(webhook.id).toLocaleDateString(
                                "en-IN",
                                {
                                    month: "long",
                                    year: "numeric",
                                    day: "numeric",
                                }
                            )}{" "}
                            by {webhook.user.username}
                            {webhook.user.tag}
                        </Typography>
                    }
                />
                <CardContent>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                    >
                        <TextField
                            InputLabelProps={{ shrink: true }}
                            label="Name"
                            onChange={event => {
                                setOgdata({
                                    ...ogData,
                                    name: (event.target as HTMLInputElement)
                                        .value,
                                });
                            }}
                            value={ogData.name}
                        />
                        <Button
                            onClick={() => {
                                copyToClipboard(
                                    `${process.env.NEXT_PUBLIC_API_URL}/webhooks/${webhook.id}/${webhook.token}`
                                );
                            }}
                            variant="contained"
                            color="inherit"
                            disableElevation
                        >
                            Copy webhook url
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            disableElevation
                            onClick={async () => {
                                await mutateAsync({
                                    id: webhook.id,
                                    channel_id: webhook.channel_id,
                                });
                            }}
                        >
                            delete webhook
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </>
    );
};
