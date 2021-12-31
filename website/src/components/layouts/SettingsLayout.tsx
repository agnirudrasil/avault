import styled from "@emotion/styled";
import { Close } from "@mui/icons-material";
import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton as MuiListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { usePermssions } from "../../../hooks/usePermissions";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import { useRoutesStore } from "../../../stores/useRoutesStore";
import { checkPermissions } from "../../compute-permissions";
import { Permissions } from "../../permissions";

const Container = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
`;

const ListItemButton = styled(MuiListItemButton)`
    border-radius: 5px;
`;

export const SettingsLayout: React.FC = ({ children }) => {
    const router = useRouter();
    const guilds = useGuildsStore(
        state => state[router.query.server_id as string]
    );
    const { setRoute, route } = useRoutesStore();
    const { permissions } = usePermssions(
        router.query.server_id as string,
        router.query.channel as string
    );

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
                                    <Typography variant="button">
                                        {guilds.name}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        <ListItemButton
                            selected={route === "/settings"}
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
                                selected={route === "/settings/roles"}
                                onClick={() => setRoute("/settings/roles")}
                                sx={{ width: "100%" }}
                            >
                                <ListItemText primary="Roles" />
                            </ListItemButton>
                        )}
                        {checkPermissions(
                            permissions,
                            Permissions.MANAGE_EMOJIS_AND_STICKERS
                        ) && (
                            <ListItemButton
                                selected={route === "/settings/emojis"}
                                onClick={() => setRoute("/settings/emojis")}
                                sx={{ width: "100%" }}
                            >
                                <ListItemText primary="Emoji" />
                            </ListItemButton>
                        )}
                        {checkPermissions(
                            permissions,
                            Permissions.MANAGE_GUILD
                        ) && (
                            <ListItemButton
                                selected={route === "/settings/moderation"}
                                onClick={() => setRoute("/settings/moderation")}
                                sx={{ width: "100%" }}
                            >
                                <ListItemText primary="Moderation" />
                            </ListItemButton>
                        )}
                        {checkPermissions(
                            permissions,
                            Permissions.MANAGE_GUILD
                        ) && (
                            <ListItemButton
                                selected={route === "/settings/inetegrations"}
                                onClick={() =>
                                    setRoute("/settings/integrations")
                                }
                                sx={{ width: "100%" }}
                            >
                                <ListItemText primary="Integrations" />
                            </ListItemButton>
                        )}
                        <Divider sx={{ margin: "1rem 0" }} />
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Typography variant="button">
                                        User Management
                                    </Typography>
                                }
                            />
                        </ListItem>
                        <ListItemButton
                            selected={route === "/settings/members"}
                            onClick={() => setRoute("/settings/members")}
                            sx={{ width: "100%" }}
                        >
                            <ListItemText primary="Member" />
                        </ListItemButton>
                        {checkPermissions(
                            permissions,
                            Permissions.MANAGE_GUILD
                        ) && (
                            <ListItemButton
                                selected={route === "/settings/invites"}
                                onClick={() => setRoute("/settings/invites")}
                                sx={{ width: "100%" }}
                            >
                                <ListItemText primary="Invites" />
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
