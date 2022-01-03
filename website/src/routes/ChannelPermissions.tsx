import { Add, Clear, Done, FiberManualRecord, Lock } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Snackbar,
    Alert,
    Button,
    Slide,
    Typography,
    Stack,
    AlertTitle,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemSecondaryAction,
    ToggleButton,
    ToggleButtonGroup,
    ListSubheader,
    IconButton,
} from "@mui/material";
import produce from "immer";
import { Permissions } from "../permissions";
import { NextRouter, useRouter } from "next/router";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useChannelUpdate } from "../../hooks/requests/useUpdateChannel";
import { useUnsaved } from "../../hooks/useUnsaved";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { Android12Switch } from "../components/Form/AndroidSwitch";
import { ChannelSettingsLayout } from "../components/layouts/ChannelSettingsLayout";
import { checkPermissions } from "../compute-permissions";
import { Channel } from "../../types/channels";
import { permissions } from "../permissions";

const TransitionComponent = (props: any) => {
    return <Slide {...props} direction="up" unmountOnExit />;
};

const ToggleSwtich: React.FC<{
    isChannelPrivate: boolean;
    setOgdata: Dispatch<SetStateAction<Channel | undefined>>;
    router: NextRouter;
}> = ({ isChannelPrivate, setOgdata, router }) => {
    return (
        <Android12Switch
            checked={isChannelPrivate}
            onChange={e => {
                if (e.target.checked) {
                    setOgdata(p =>
                        produce(p, draft => {
                            if (!draft) return;
                            const ov = draft?.overwrites.findIndex(
                                o => o.id === (router.query.server_id as string)
                            );
                            if (ov >= 0) {
                                draft.overwrites[ov].deny = (
                                    BigInt(draft.overwrites[ov].deny) |
                                    BigInt(Permissions.VIEW_CHANNEL)
                                ).toString();
                            } else {
                                draft.overwrites.push({
                                    id: router.query.server_id as string,
                                    type: 0,
                                    allow: "0",
                                    deny: Permissions.VIEW_CHANNEL,
                                });
                            }
                        })
                    );
                } else {
                    setOgdata(p =>
                        produce(p, draft => {
                            if (!draft) return;
                            const ov = draft?.overwrites.findIndex(
                                o => o.id === (router.query.server_id as string)
                            );
                            if (ov >= 0) {
                                if (
                                    draft.overwrites[ov].deny ===
                                        Permissions.VIEW_CHANNEL &&
                                    draft.overwrites[ov].allow === "0"
                                ) {
                                    draft.overwrites.splice(ov, 1);
                                } else {
                                    draft.overwrites[ov].deny = (
                                        BigInt(draft.overwrites[ov].deny) &
                                        BigInt(Permissions.VIEW_CHANNEL)
                                    ).toString();
                                }
                            }
                        })
                    );
                }
            }}
        />
    );
};

export const ChannelPermissions = () => {
    const router = useRouter();
    const [selected, setSelected] = useState(router.query.server_id as string);
    const channels = useChannelsStore(
        state => state[router.query.server_id as string]
    );
    const channel = channels?.find(
        c => c.id === (router.query.channel as string)
    );
    const { handleReset, unsaved, ogData, setOgdata } = useUnsaved(channel);
    const isChannelPrivate = useMemo(() => {
        const overwrite = channel?.overwrites.find(
            o => o.id === (router.query.server_id as string)
        );
        if (
            overwrite &&
            checkPermissions(BigInt(overwrite.deny), Permissions.VIEW_CHANNEL)
        ) {
            return true;
        }
    }, [ogData]);

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
                    overflow: "auto",
                }}
            >
                <Stack>
                    <Typography
                        variant="h6"
                        style={{ userSelect: "none", marginBottom: "30px" }}
                    >
                        Channel Permissions
                    </Typography>
                    <Typography
                        style={{ userSelect: "none", marginBottom: "30px" }}
                    >
                        Use permissions to customize who can do what in this
                        channel.
                    </Typography>
                </Stack>
                <Alert
                    icon={<Lock fontSize="inherit" />}
                    severity="info"
                    color="info"
                    action={
                        <ToggleSwtich
                            setOgdata={setOgdata}
                            isChannelPrivate={Boolean(isChannelPrivate)}
                            router={router}
                        />
                    }
                >
                    <AlertTitle sx={{ userSelect: "none" }}>
                        Private Channel
                    </AlertTitle>
                    By making a channel private only select members and roles
                    will be able to view this channel
                </Alert>
                <Divider sx={{ margin: "30px 0" }} />
                <Typography
                    variant="h6"
                    style={{ userSelect: "none", marginBottom: "30px" }}
                >
                    Advanced Permissions
                </Typography>
                <Stack gap="1rem" direction={"row"}>
                    <List
                        subheader={
                            <ListSubheader sx={{ width: "100%" }} disableSticky>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography
                                        sx={{ userSelect: "none" }}
                                        variant="button"
                                    >
                                        Roles/Members
                                    </Typography>
                                    <IconButton size="small">
                                        <Add fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </ListSubheader>
                        }
                        dense
                    >
                        <ListItemButton
                            selected={selected === router.query.server_id}
                            onClick={() =>
                                setSelected(router.query.server_id as string)
                            }
                        >
                            <ListItemText primary={"@everyone"} />
                        </ListItemButton>
                        {channel?.overwrites.map(
                            overwrite =>
                                overwrite.id !==
                                    (router.query.server_id as string) && (
                                    <ListItemButton
                                        selected={selected === overwrite.id}
                                        onClick={() =>
                                            setSelected(overwrite.id)
                                        }
                                    >
                                        <ListItemText primary={"@everyone"} />
                                    </ListItemButton>
                                )
                        )}
                    </List>
                    <List style={{ width: "100%" }}>
                        {permissions.map(({ title, value, permission }) => (
                            <ListItem disableGutters sx={{ width: "100%" }}>
                                <ListItemText
                                    primary={title}
                                    secondary={permission}
                                />
                                <ListItemSecondaryAction>
                                    <ToggleButtonGroup exclusive>
                                        <ToggleButton value={value}>
                                            <Clear />
                                        </ToggleButton>
                                        <ToggleButton value={value}>
                                            <FiberManualRecord />
                                        </ToggleButton>
                                        <ToggleButton value={value}>
                                            <Done />
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Stack>
            </div>
        </ChannelSettingsLayout>
    );
};
