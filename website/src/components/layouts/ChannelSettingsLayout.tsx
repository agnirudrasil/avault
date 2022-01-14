import styled from "@emotion/styled";
import { Close } from "@mui/icons-material";
import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton as MuiListItemButton,
    ListItemText,
    Stack,
    SvgIcon,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useDeleteChannel } from "../../../hooks/requests/useDeleteChannel";
import { usePermssions } from "../../../hooks/usePermissions";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useRoutesStore } from "../../../stores/useRoutesStore";
import { checkPermissions } from "../../compute-permissions";
import { Permissions } from "../../permissions";
import { PrivateChannelIcon, ChannelIcon } from "../ChannelIcon";
import shallow from "zustand/shallow";

const Container = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
`;

const ListItemButton = styled(MuiListItemButton)`
    border-radius: 5px;
`;

export const ChannelSettingsLayout: React.FC = ({ children }) => {
    const router = useRouter();
    const { channels, getFirstGuildChannel } = useChannelsStore(
        state => ({
            channels: state[router.query.server_id as string],
            getFirstGuildChannel: state.getFirstGuildChannel,
        }),
        shallow
    );

    const { isLoading, mutateAsync } = useDeleteChannel(
        router.query.channel as string
    );
    const { setRoute, route } = useRoutesStore();
    const { permissions } = usePermssions(
        router.query.server_id as string,
        router.query.channel as string
    );
    const channel = channels?.find(
        c => c.id === (router.query.channel as string)
    );

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
    }, [channel]);

    return (
        <Container>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    flex: "1 0 234px",
                }}
            >
                <div
                    style={{
                        borderRight: "1px solid #ccc",
                        height: "100vh",
                        flex: "1 0 auto",
                        flexDirection: "row",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "flex-end",
                    }}
                >
                    <List
                        sx={{
                            maxWidth: "218px",
                            width: "218px",
                            padding: "60px 6px 60px 20px",
                        }}
                        dense
                    >
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Stack alignItems="center" direction="row">
                                        <SvgIcon>
                                            {isChannelPrivate ? (
                                                <PrivateChannelIcon />
                                            ) : (
                                                <ChannelIcon />
                                            )}
                                        </SvgIcon>
                                        <Typography variant="button">
                                            {channel?.name}
                                        </Typography>
                                    </Stack>
                                }
                            />
                        </ListItem>
                        <ListItemButton
                            selected={route === "/channel-settings"}
                            onClick={() => setRoute("/settings")}
                            sx={{ width: "100%" }}
                        >
                            <ListItemText primary="Overview" />
                        </ListItemButton>
                        {checkPermissions(
                            permissions,
                            Permissions.MANAGE_ROLES
                        ) && (
                            <ListItemButton
                                selected={
                                    route === "/channel-settings/permissions"
                                }
                                onClick={() =>
                                    setRoute("/channel-settings/permissions")
                                }
                                sx={{ width: "100%" }}
                            >
                                <ListItemText primary="Permissions" />
                            </ListItemButton>
                        )}
                        <Divider />
                        {checkPermissions(
                            permissions,
                            Permissions.MANAGE_CHANNELS
                        ) && (
                            <ListItemButton
                                onClick={async () => {
                                    await mutateAsync();
                                    setRoute("/");
                                    router.replace(`/channels/@me`);
                                }}
                                disabled={isLoading}
                                sx={{ width: "100%" }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography color="red">
                                            Delete Channel
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        )}
                    </List>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    flex: "1 1 800px",
                    maxHeight: "100vh",
                    overflow: "auto",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        position: "static",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        maxHeight: "100vh",
                    }}
                >
                    <main
                        style={{
                            flex: "1 1 auto",
                            maxWidth: "740px",
                            overflow: "hidden",
                            minWidth: "460px",
                            minHeight: "100px",
                            display: "flex",
                            maxHeight: "100vh",
                        }}
                    >
                        {children}
                    </main>
                    <div
                        style={{
                            marginRight: "21px",
                            position: "relative",
                            flex: "0 0 36px",
                            width: "60px",
                            paddingTop: "60px",
                        }}
                    >
                        <div style={{ position: "fixed" }}>
                            <IconButton
                                onClick={() => setRoute("/")}
                                sx={{ border: "2px solid #ccc" }}
                            >
                                <Close />
                            </IconButton>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};
